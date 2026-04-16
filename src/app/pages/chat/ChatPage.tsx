import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { MessageSquare, Send, Plus, Search } from 'lucide-react';
import { useDataStore } from '../../store/DataStore';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../../types';
import { mockUsers } from '../../data/mockData';

export function ChatPage() {
  const { user } = useAuth();
  const { sendMessage, getChatMessages, getChatThreads, markChatRead, courses, enrollments } = useDataStore();
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get all users from localStorage
  const allUsers = useMemo<User[]>(() => {
    try {
      const stored = localStorage.getItem('unick_users');
      return stored ? JSON.parse(stored) : mockUsers;
    } catch {
      return mockUsers;
    }
  }, []);

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
            if (u.role === 'author' && u.schoolId === c.schoolId) authorIds.add(u.id);
          }
        }
      }
      return allUsers.filter(u => authorIds.has(u.id));
    }
    if (user.role === 'author') {
      // Students enrolled in author's courses
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
    sendMessage(user.id, activeUserId, draft);
    setDraft('');

    // Simulate auto-reply after 2s
    setTimeout(() => {
      const replies = [
        'Спасибо за сообщение! Скоро отвечу подробнее',
        'Хороший вопрос, давайте обсудим',
        'Получил ваше сообщение, изучаю',
        'Отличная мысль! Расскажите подробнее',
        'Спасибо! Я свяжусь с вами в ближайшее время',
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      sendMessage(activeUserId, user.id, reply);
    }, 1500 + Math.random() * 1500);
  };

  const startChat = (contactId: string) => {
    setActiveUserId(contactId);
    setNewChatOpen(false);
  };

  return (
    <div className="flex h-full max-h-screen">
      {/* Threads list */}
      <aside className="w-full md:w-[320px] bg-white border-r border-[#1A1A2E]/5 flex flex-col">
        <div className="p-4 border-b border-[#1A1A2E]/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>Чаты</h2>
            <Button size="sm" onClick={() => setNewChatOpen(true)} className="transition-transform active:scale-[0.95]">
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
                onClick={() => setActiveUserId(t.withUserId)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-[#F5F4F2] transition-colors text-left border-b border-[#1A1A2E]/5 ${
                  activeUserId === t.withUserId ? 'bg-[#EDE9FF]/50' : ''
                }`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={t.withUserAvatar} />
                  <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">
                    {t.withUserName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-[#1A1A2E] truncate" style={{ fontFamily: 'var(--font-body)' }}>
                      {t.withUserName}
                    </p>
                    {t.unreadCount > 0 && (
                      <span className="bg-[#7C6AF7] text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {t.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#8A8A9A] truncate" style={{ fontFamily: 'var(--font-body)' }}>
                    {t.lastMessage?.content || 'Нет сообщений'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Conversation */}
      <main className="hidden md:flex flex-1 flex-col bg-[#F5F4F2]">
        {!activeUserId ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon={MessageSquare} title="Выберите чат" description="или начните новый диалог слева" />
          </div>
        ) : (
          <>
            <div className="bg-white border-b border-[#1A1A2E]/5 p-4 flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src={userMap[activeUserId]?.avatar} />
                <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">
                  {userMap[activeUserId]?.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[14px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {userMap[activeUserId]?.name || 'Пользователь'}
                </p>
                <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                  {userMap[activeUserId]?.role === 'author' ? 'Автор курса' : userMap[activeUserId]?.role === 'student' ? 'Ученик' : ''}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        isMine ? 'bg-[#7C6AF7] text-white' : 'bg-white text-[#1A1A2E]'
                      }`}>
                        <p className="text-[13px] whitespace-pre-wrap break-words" style={{ fontFamily: 'var(--font-body)' }}>{m.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-[#8A8A9A]'}`} style={{ fontFamily: 'var(--font-body)' }}>
                          {new Date(m.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-[#1A1A2E]/5 p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Введите сообщение..."
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  className="bg-[#F5F4F2] border-0"
                />
                <Button onClick={handleSend} disabled={!draft.trim()} className="transition-transform active:scale-[0.98]">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </main>

      <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Новый чат</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
              <Input
                placeholder="Поиск..."
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                className="pl-9 mb-2"
              />
            </div>
            {availableContacts
              .filter(u => !searchUser || u.name.toLowerCase().includes(searchUser.toLowerCase()))
              .map(u => (
                <button
                  key={u.id}
                  onClick={() => startChat(u.id)}
                  className="w-full p-3 flex items-center gap-3 rounded-xl hover:bg-[#F5F4F2] transition-colors text-left"
                >
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback className="bg-[#7C6AF7] text-white text-xs">{u.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-body)' }}>{u.name}</p>
                    <p className="text-[11px] text-[#8A8A9A]" style={{ fontFamily: 'var(--font-body)' }}>
                      {u.role === 'author' ? 'Автор' : u.role === 'student' ? 'Ученик' : u.role}
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
