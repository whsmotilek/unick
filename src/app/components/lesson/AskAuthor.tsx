import { MessageCircleQuestion } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { useDataStore } from '../../store/DataStore';

/** «Задать вопрос автору»: открывает чат с автором курса, в поле уже подставлено название урока. */
export function AskAuthor({ schoolId, lessonTitle }: { schoolId: string; lessonTitle: string }) {
  const { users } = useDataStore();
  // Вопросы идут владельцу школы; остальные авторы и кураторы — запасной вариант
  const author = users.find(u => u.schoolId === schoolId && u.role === 'author' && u.ownsSchool)
    ?? users.find(u => u.schoolId === schoolId && u.role === 'author')
    ?? users.find(u => u.schoolId === schoolId && (u.role === 'curator' || u.role === 'admin'));
  if (!author) return null;
  const text = `Вопрос по уроку «${lessonTitle}»: `;
  const href = `/student/chat?with=${author.id}&text=${encodeURIComponent(text)}`;
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="w-10 h-10 shrink-0 rounded-xl bg-[#EDE9FF] flex items-center justify-center">
        <MessageCircleQuestion className="w-5 h-5 text-[#7C6AF7]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-[#1A1A2E]">Остались вопросы по уроку?</p>
        <p className="text-[13px] text-[#8A8A9A]">Напишите {author.name} — ответ придёт в «Чаты» и в колокольчик.</p>
      </div>
      <Button asChild variant="outline" className="w-full sm:w-auto h-11 sm:h-10">
        <Link to={href}>Задать вопрос автору</Link>
      </Button>
    </div>
  );
}
