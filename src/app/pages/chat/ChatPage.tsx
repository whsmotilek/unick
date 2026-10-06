import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { MessageSquare, Send, Plus, Search, ArrowLeft } from 'lucide-react';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router';
import { User } from '../../types';

export function ChatPage() {
  const { user, isDemoMode } = useAuth();
  const { sendMessage, getChatMessages, getChatThreads, markChatRead, courses, enrollments, users } = useDataStore();
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const withParam = searchParams.get('with');

  // Диплинк ?with=<userId> (из уведомлений): открываем диалог и убираем параметр из адреса
  useEffect(() => {
    if (!withParam) return;
    if (withParam !== user?.id) setActiveUserId(withParam);
    setSearchParams(p => { p.delete('with'); return p; }, { replace: true });
  }, [withParam, user?.id, setSearchParams]);

  const allUsers = users;

  const userMap = useMemo(() => {
    const m: Record<string, User> = {};
    for (const u of allUsers) m[u.id] = u;
    return m;
  }, [allUsers]);

  const threads = useMemo(() => {
    if (!user) return [];
    return getChatThreads(user.id).map(t => ({
      ...t,
      withUserName: userMap[t.withUserId]?.name || 'Пользователь',
      withUserAvatar: userMap[t.withUserId]?.avatar,
    }));
  }, [user, getChatThreads, userMap]);

  const messages = useMemo(() => {
    if (!user || !activeUserId) return [];
    return getChatMessages(user.id, activeUserId);
  }, [user, activeUserId, getChatMessages]);

  // Available users to start chat with
  const availableContacts = useMemo<User[]>(() => {
    if (!user) return [];
    if (user.role === 'student') {
      // Authors of enrolled courses
      const enrolledIds = enrollments[user.id] || [];
      const authorIds = new Set<string>();
      for (const c of courses) {
        if (enrolledIds.includes(c.id)) {
          // Find authors of school
          for (const u of allUsers) {
            if ((u.role === 'author' || u.role === 'curator') && u.schoolId === c.schoolId) authorIds.add(u.id);
          }
        }
      }
      return allUsers.filter(u => authorIds.has(u.id));
    }
    if (user.role === 'author' || user.role === 'curator') {
      // Students enrolled in the school's courses
      const myCourseIds = courses.filter(c => c.schoolId === user.schoolId).map(c => c.id);
      const studentIds = new Set<string>();
      for (const [uid, cids] of Object.entries(enrollments)) {
        if (cids.some(cid => myCourseIds.includes(cid))) studentIds.add(uid);
      }
      return allUsers.filter(u => studentIds.has(u.id));
    }
    return allUsers.filter(u => u.id !== user.id);
  }, [user, allUsers, courses, enrollments]);

  // Mark as read when opening chat
  useEffect(() => {
    if (user && activeUserId) markChatRead(user.id, activeUserId);
  }, [user, activeUserId, markChatRead]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!user || !activeUserId || !draft.trim()) return;
    sendMessage(user.id, activeUserId, draft.trim());
    setDraft('');
  };

  const startChat = (contactId: string) => {
    setActiveUserId(contactId);
    setNewChatOpen(false);
  };

  return (
    // На десктопе чат занимает всю высоту окна (за вычетом полосы демо-режима), сообщения прокручиваются внутри
    <div className={`flex ${isDemoMode ? 'md:h-[calc(100dvh-30px)]' : 'md:h-dvh'}`}>
      {/* Threads list. На телефоне — либо список, либо открытый диалог; на десктопе — две колонки */}
      <aside className={`${activeUserId ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] bg-white border-r border-[#1A1A2E]/5 flex-col`}>
        <div className="p-4 border-b border-[#1A1A2E]/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>Чаты</h2>
            <Button size="sm" onClick={() => setNewChatOpen(true)} className="h-10 md:h-8 px-3 transition-transform active:scale-[0.95]">
              <Plus className="w-4 h-4 mr-1" />Новый
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={MessageSquare}
                title="Чатов нет"
                description="Начните диалог с автором или учеником"
                action={
                  <Button onClick={() => setNewChatOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />Начать чат
                  </Button>
                }
              />
            </div>
          ) : (
            threads.map(t => (
              <button
                key={t.withUserId}
                type="button"
                onClick={() => setActiveUserId(t.withUserId)}
                aria-current={activeUserId === t.withUserId ? 'true' : undefined}
                className={`w-full px-4 py-3 md:py-4 min-h-[68px] flex items-center gap-3 hover:bg-[#F5F4F2] transition-colors text-left border-b border-[#1A1A2E]/5 ${
                  activeUserId === t.withUserId ? 'bg-[#EDE9FF]/50' : ''
                }`}
              >
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarImage src={t.withUserAvatar} />
                  <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">
                    {t.withUserName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] md:text-[13px] font-semibold text-[#1A1A2E] truncate" style={{ fontFamily: 'var(--font-body)' }}>
                      {t.withUserName}
                    </p>
                    {t.unreadCount > 0 && (
                      <span className="bg-[#7C6AF7] text-white text-[12px] leading-none font-semibold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center flex-shrink-0" aria-label={`Непрочитанных: ${t.unreadCount}`}>
                        {t.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className={`text-[13px] md:text-[12px] truncate ${t.unreadCount > 0 ? 'text-[#1A1A2E]/80' : 'text-[#8A8A9A]'}`} style={{ fontFamily: 'var(--font-body)' }}>
                    {t.lastMessage?.content || 'Нет сообщений'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Conversation */}
      {/* На телефоне открытый диалог занимает весь экран (поверх шапки кабинета), «←» возвращает к списку */}
      <main className={`${activeUserId ? 'flex fixed inset-0 z-50 md:static md:inset-auto md:z-auto' : 'hidden md:flex'} flex-1 flex-col min-w-0 bg-[#F5F4F2]`}>
        {!activeUserId ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon={MessageSquare} title="Выберите чат" description="или начните новый диалог слева" />
          </div>
        ) : (
          <>
            <div className="bg-white border-b border-[#1A1A2E]/5 px-2 md:px-4 py-2 md:py-4 pt-[max(0.5rem,env(safe-area-inset-top))] md:pt-4 flex items-center gap-2 md:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveUserId(null)}
                aria-label="Назад к списку чатов"
                className="md:hidden w-10 h-10 flex items-center justify-center shrink-0 rounded-lg text-[#1A1A2E] hover:bg-[#F5F4F2] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarImage src={userMap[activeUserId]?.avatar} />
                <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">
                  {userMap[activeUserId]?.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#1A1A2E] truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                  {userMap[activeUserId]?.name || 'Пользователь'}
                </p>
                <p className="text-[12px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                  {userMap[activeUserId]?.role === 'author' ? 'Автор курса' : userMap[activeUserId]?.role === 'curator' ? 'Куратор' : userMap[activeUserId]?.role === 'student' ? 'Ученик' : ''}
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-4 md:p-4 space-y-2 md:space-y-3">
              <AnimatePresence initial={false}>
                {messages.map((m) => {
                  const isMine = m.fromUserId === user?.id;
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] md:max-w-[70%] min-w-0 rounded-2xl px-3.5 md:px-4 py-2 md:py-2.5 ${
                        isMine ? 'bg-[#7C6AF7] text-white' : 'bg-white text-[#1A1A2E]'
                      }`}>
                        <p className="text-[15px] md:text-[13px] leading-snug whitespace-pre-wrap break-words [overflow-wrap:anywhere]" style={{ fontFamily: 'var(--font-body)' }}>{m.content}</p>
                        <p className={`text-[12px] md:text-[11px] mt-0.5 md:mt-1 text-right ${isMine ? 'text-white/70' : 'text-[#8A8A9A]'}`} style={{ fontFamily: 'var(--font-body)' }}>
                          {new Date(m.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-[#1A1A2E]/5 shrink-0 px-3 md:px-4 pt-2 md:pt-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Введите сообщение..."
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && (e.preventDefault(), handleSend())}
                  enterKeyHint="send"
                  aria-label="Сообщение"
                  className="bg-[#F5F4F2] border-0 h-11 md:h-10 text-base md:text-sm"
                />
                <Button onClick={handleSend} disabled={!draft.trim()} aria-label="Отправить" size="icon" className="h-11 w-11 md:h-10 md:w-10 shrink-0 transition-transform active:scale-[0.95]">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </main>

      <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
        <DialogContent className="flex flex-col gap-3 p-4 max-sm:p-4 sm:p-6 w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] sm:max-w-md max-h-[calc(100dvh-1rem)] sm:max-h-[80vh]">
          <DialogHeader className="text-left pr-8">
            <DialogTitle>Новый чат</DialogTitle>
          </DialogHeader>
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
            <Input
              placeholder="Поиск..."
              value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
              aria-label="Поиск контакта"
              className="pl-9 h-11 sm:h-10 text-base sm:text-sm"
            />
          </div>
          <div className="flex-1 min-h-0 -mx-2 px-2 space-y-1 overflow-y-auto overscroll-contain">
            {availableContacts
              .filter(u => !searchUser || u.name.toLowerCase().includes(searchUser.toLowerCase()))
              .map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => startChat(u.id)}
                  className="w-full p-3 min-h-14 flex items-center gap-3 rounded-xl hover:bg-[#F5F4F2] active:bg-[#F5F4F2] transition-colors text-left"
                >
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">{u.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-[14px] sm:text-[13px] font-semibold text-[#1A1A2E] truncate" style={{ fontFamily: 'var(--font-body)' }}>{u.name}</p>
                    <p className="text-[12px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                      {u.role === 'author' ? 'Автор' : u.role === 'curator' ? 'Куратор' : u.role === 'student' ? 'Ученик' : u.role}
                    </p>
                  </div>
                </button>
              ))}
            {availableContacts.length === 0 && (
              <p className="text-center text-[13px] text-[#8A8A9A] py-6" style={{ fontFamily: 'var(--font-body)' }}>
                Нет доступных контактов
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
