import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string, role: UserRole) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'unick_auth_user';

function getStoredUsers(): User[] {
  try {
    const stored = localStorage.getItem('unick_users');
    if (stored) return JSON.parse(stored);
  } catch {}
  return [...mockUsers];
}

function saveUsers(users: User[]) {
  localStorage.setItem('unick_users', JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (email: string, _password: string) => {
    const allUsers = getStoredUsers();
    const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { success: false, error: 'Пользователь не найден' };
    }
    setUser(found);
    return { success: true };
  };

  const register = (name: string, email: string, _password: string, role: UserRole) => {
    const allUsers = getStoredUsers();
    if (allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Пользователь с таким email уже существует' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7C6AF7&color=fff&size=150`,
    };
    allUsers.push(newUser);
    saveUsers(allUsers);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
