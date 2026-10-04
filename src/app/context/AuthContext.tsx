import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase, isDemoMode, appUrl } from '../lib/supabase';
import { toUser } from '../lib/backend/supabaseBackend';
import { getDemoUsers, saveDemoUsers } from '../lib/backend/localBackend';

export interface AuthResult {
  success: boolean;
  error?: string;
  /** Регистрация прошла, но нужно подтвердить email по ссылке из письма */
  needsConfirmation?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  /** Идёт восстановление сессии при загрузке приложения */
  loading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string, role: UserRole, extra?: { schoolName?: string; redirectPath?: string }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  updateProfile: (patch: { name?: string; avatar?: string }) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_SESSION_KEY = 'unick_auth_user';

const AUTH_ERRORS: Record<string, string> = {
  'Invalid login credentials': 'Неверный email или пароль',
  'Email not confirmed': 'Подтвердите email — мы отправили письмо со ссылкой',
  'User already registered': 'Пользователь с таким email уже существует',
  'Password should be at least 6 characters': 'Пароль должен быть не короче 6 символов',
};
const translate = (msg: string) => AUTH_ERRORS[msg] ?? msg;

async function fetchProfile(id: string): Promise<User | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return toUser(data);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (!isDemoMode) return null;
    try {
      const stored = localStorage.getItem(DEMO_SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!isDemoMode);

  // Демо: сессия в localStorage
  useEffect(() => {
    if (!isDemoMode) return;
    if (user) localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(DEMO_SESSION_KEY);
  }, [user]);

  // Supabase: восстановление сессии и подписка на изменения
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase.auth.getSession().then(async ({ data }) => {
      const profile = data.session ? await fetchProfile(data.session.user.id) : null;
      if (!cancelled) { setUser(profile); setLoading(false); }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) { setUser(null); return; }
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Вне колбэка: нельзя ждать запросы к Supabase внутри onAuthStateChange
        setTimeout(async () => {
          const profile = await fetchProfile(session.user.id);
          if (!cancelled) setUser(profile);
        }, 0);
      }
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return { success: false, error: translate(error.message) };
      const profile = await fetchProfile(data.user.id);
      if (!profile) return { success: false, error: 'Профиль не найден. Напишите в поддержку.' };
      setUser(profile);
      return { success: true };
    }
    const found = getDemoUsers().find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) return { success: false, error: 'Пользователь не найден' };
    setUser(found);
    return { success: true };
  }, []);

  const register = useCallback(async (
    name: string, email: string, password: string, role: UserRole, extra?: { schoolName?: string; redirectPath?: string },
  ): Promise<AuthResult> => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name, role, school_name: extra?.schoolName },
          emailRedirectTo: appUrl(extra?.redirectPath || '/login'),
        },
      });
      if (error) return { success: false, error: translate(error.message) };
      if (!data.session) return { success: true, needsConfirmation: true };
      const profile = await fetchProfile(data.user!.id);
      setUser(profile);
      return { success: true };
    }
    const all = getDemoUsers();
    if (all.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { success: false, error: 'Пользователь с таким email уже существует' };
    }
    const id = crypto.randomUUID();
    const newUser: User = {
      id,
      name,
      email: email.trim(),
      role,
      schoolId: role === 'author' ? `school-${id}` : undefined,
    };
    saveDemoUsers([...all, newUser]);
    setUser(newUser);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return { success: false, error: 'В демо-режиме восстановление пароля недоступно' };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: appUrl('/reset-password') });
    return error ? { success: false, error: translate(error.message) } : { success: true };
  }, []);

  const updatePassword = useCallback(async (password: string): Promise<AuthResult> => {
    if (!supabase) return { success: false, error: 'Недоступно в демо-режиме' };
    const { error } = await supabase.auth.updateUser({ password });
    return error ? { success: false, error: translate(error.message) } : { success: true };
  }, []);

  const updateProfile = useCallback(async (patch: { name?: string; avatar?: string }): Promise<AuthResult> => {
    if (!user) return { success: false, error: 'Нужно войти' };
    const next = { ...user, ...patch };
    if (supabase) {
      const { error } = await supabase.from('profiles').update({ name: next.name, avatar: next.avatar ?? null }).eq('id', user.id);
      if (error) return { success: false, error: error.message };
    } else {
      saveDemoUsers(getDemoUsers().map(u => (u.id === user.id ? next : u)));
    }
    setUser(next);
    return { success: true };
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, loading, isDemoMode,
      login, register, logout, requestPasswordReset, updatePassword, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export const ROLE_HOME: Record<string, string> = {
  author: '/author',
  student: '/student',
  curator: '/curator',
  admin: '/admin',
};
