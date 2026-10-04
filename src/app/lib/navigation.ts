import { ROLE_HOME } from '../context/AuthContext';
import type { User } from '../types';

/** Внутренний путь из ?next= (защита от открытого редиректа на чужие сайты). */
export function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return null;
  return raw;
}

export function homeFor(user: User | null): string {
  return (user && ROLE_HOME[user.role]) || '/';
}

export const PENDING_INVITE_KEY = 'unick_pending_invite';
