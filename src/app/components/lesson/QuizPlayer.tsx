import { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { gradeQuiz, type QuizQuestion } from '../../lib/lessonContent';

export function QuizPlayer({ questions, passPercent = 70, completed, onPassed }: {
  questions: QuizQuestion[];
  passPercent?: number;
  completed: boolean;
  onPassed?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<ReturnType<typeof gradeQuiz> | null>(null);

  if (!questions.length) return <p className="text-sm text-[#8A8A9A]">В тесте пока нет вопросов.</p>;

  const toggle = (q: QuizQuestion, optionId: string) => {
    if (result) return;
    const multiple = q.correct.length > 1;
    setAnswers(prev => {
      const cur = prev[q.id] ?? [];
      const next = multiple ? (cur.includes(optionId) ? cur.filter(x => x !== optionId) : [...cur, optionId]) : [optionId];
      return { ...prev, [q.id]: next };
    });
  };

  const check = () => {
    const r = gradeQuiz(questions, answers);
    setResult(r);
    if (r.percent >= passPercent) onPassed?.();
  };

  const passed = result ? result.percent >= passPercent : false;
  const allAnswered = questions.every(q => (answers[q.id] ?? []).length > 0);

  return (
    <div className="space-y-5">
      {completed && !result && (
        <p className="text-sm text-[#2D5016] bg-[#E8F5DC] rounded-xl px-4 py-2">Тест уже пройден. Можно пройти ещё раз для себя.</p>
      )}
      {questions.map((q, i) => {
        const multiple = q.correct.length > 1;
        const given = answers[q.id] ?? [];
        return (
          <div key={q.id} className="space-y-2">
            <p className="font-medium text-[#1A1A2E]">
              {i + 1}. {q.text}
              {multiple && <span className="text-xs text-[#8A8A9A] font-normal ml-2">несколько ответов</span>}
            </p>
            <div className="space-y-1.5">
              {q.options.map(o => {
                const selected = given.includes(o.id);
                const isCorrect = q.correct.includes(o.id);
                let cls = selected ? 'border-[#7C6AF7] bg-[#EDE9FF]' : 'border-[#1A1A2E]/10 bg-white hover:bg-[#F5F4F2]';
                if (result && isCorrect) cls = 'border-[#2D9D5B] bg-[#E8F5DC]';
                else if (result && selected && !isCorrect) cls = 'border-[#FF6B6B] bg-[#FFE5E5]';
                return (
                  <button key={o.id} type="button" onClick={() => toggle(q, o.id)} disabled={!!result}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-colors flex items-center gap-2 ${cls}`}>
                    {result && isCorrect && <CheckCircle2 className="w-4 h-4 text-[#2D9D5B] shrink-0" />}
                    {result && selected && !isCorrect && <XCircle className="w-4 h-4 text-[#FF6B6B] shrink-0" />}
                    <span>{o.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {result ? (
        <div className={`rounded-xl p-4 ${passed ? 'bg-[#E8F5DC] text-[#2D5016]' : 'bg-[#FFF4D6] text-[#5A4500]'}`}>
          <p className="font-semibold">
            {passed ? 'Тест пройден!' : 'Пока не получилось'} — {result.correct} из {result.total} ({result.percent}%)
          </p>
          {!passed && <p className="text-sm">Нужно набрать не меньше {passPercent}%. Посмотрите разбор и попробуйте снова.</p>}
          <Button variant="outline" size="sm" className="mt-3" onClick={() => { setResult(null); setAnswers({}); }}>
            <RotateCcw className="w-4 h-4 mr-1" />Пройти заново
          </Button>
        </div>
      ) : (
        <Button onClick={check} disabled={!allAnswered}>Проверить ответы</Button>
      )}
    </div>
  );
}
