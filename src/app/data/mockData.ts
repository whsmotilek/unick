import { User } from '../types';

// Демо-пользователи для режима без бэкенда (вход по email, пароль не проверяется).
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Анна Иванова',
    email: 'anna@example.com',
    role: 'author',
    schoolId: 'school-1',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
  },
  {
    id: 'user-2',
    name: 'Петр Смирнов',
    email: 'petr@example.com',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
  },
  {
    id: 'user-3',
    name: 'Мария Куратова',
    email: 'maria@example.com',
    role: 'curator',
    schoolId: 'school-1',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
  }
];

// Моковая школа
