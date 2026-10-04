import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Клиент Supabase. null — бэкенд не настроен, приложение работает в демо-режиме (localStorage). */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

export const isDemoMode = supabase === null;

/** Абсолютный URL внутри приложения с учётом base (/unick/ на GitHub Pages). */
export function appUrl(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${window.location.origin}${base}${path.startsWith('/') ? path : `/${path}`}`;
}
