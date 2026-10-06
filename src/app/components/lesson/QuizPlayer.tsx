import { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import type { QuizQuestion } from '../../lib/lessonContent';
import { useDataStore } from '../../store/DataStore';
import type { QuizResult } from '../../types';

/** Несколько ответов: явный флаг; для старых тестов — по ключу, если он есть у сотрудника */
const isMultiple = (q: QuizQuestion) => q.multiple ?? (q.correct?.length ?? 0) > 1;

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : 'Не удалось проверить тест');

export function QuizPlayer({ lessonId, questions, passPercent = 70, completed }: {
  lessonId: string;
  questions: QuizQuestion[];
  passPercent?: number;
  completed: boolean;
}) {
  const { submitQuiz } = useDataStore();
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [checking, setChecking] = useState(false);

  if (!questions.length) return <p className="text-sm text-[#8A8A9A]">В тесте пока нет вопросов.</p>;

  const locked = !!result || checking;

  const toggle = (q: QuizQuestion, optionId: string) => {
    if (locked) return;
    const multiple = isMultiple(q);
    setAnswers(prev => {
      const cur = prev[q.id] ?? [];
      const next = multiple ? (cur.includes(optionId) ? cur.filter(x => x !== optionId) : [...cur, optionId]) : [optionId];
      return { ...prev, [q.id]: next };
    });
  };

  const check = async () => {
    setChecking(true);
    try {
      setResult(await submitQuiz(lessonId, answers));
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setChecking(false);
    }
  };

  const retry = () => { setResult(null); setAnswers({}); };

  const allAnswered = questions.every(q => (answers[q.id] ?? []).length > 0);
  const wrong = new Set(result?.wrong ?? []);
  const key = result?.key ?? null;
  const threshold = result?.passPercent ?? passPercent;

  return (
    <div className="space-y-5">
      {completed && !result && (
        <p className="text-sm text-[#2D5016] bg-[#E8F5DC] rounded-xl px-4 py-2">Тест уже пройден. Можно пройти ещё раз для себя.</p>
      )}
      {questions.map((q, i) => {
        const multiple = isMultiple(q);
        const given = answers[q.id] ?? [];
        const qWrong = !!result && wrong.has(q.id);
        const qRight = !!result && !wrong.has(q.id);
        const correctIds = key?.[q.id];
        return (
          <div key={q.id} className={`space-y-2 ${qWrong ? 'rounded-xl border-l-4 border-[#FF6B6B] pl-3' : ''}`}>
            <p className="font-medium text-[#1A1A2E] flex items-start gap-2">
              {qRight && <CheckCircle2 className="w-4 h-4 text-[#2D9D5B] shrink-0 mt-1" />}
              {qWrong && <XCircle className="w-4 h-4 text-[#FF6B6B] shrink-0 mt-1" />}
              <span>
                {i + 1}. {q.text}
                {multiple && <span className="text-xs text-[#8A8A9A] font-normal ml-2">несколько ответов</span>}
              </span>
            </p>
            <div className="space-y-1.5">
              {q.options.map(o => {
                const selected = given.includes(o.id);
                const isCorrect = correctIds?.includes(o.id) ?? false;
                let cls = selected ? 'border-[#7C6AF7] bg-[#EDE9FF]' : 'border-[#1A1A2E]/10 bg-white hover:bg-[#F5F4F2]';
                if (result) {
                  if (correctIds) {
                    // Ключ пришёл (тест пройден) — показываем полный разбор
                    if (isCorrect) cls = 'border-[#2D9D5B] bg-[#E8F5DC]';
                    else if (selected) cls = 'border-[#FF6B6B] bg-[#FFE5E5]';
                    else cls = 'border-[#1A1A2E]/10 bg-white';
                  } else if (selected) {
                    cls = qWrong ? 'border-[#FF6B6B] bg-[#FFE5E5]' : 'border-[#2D9D5B] bg-[#E8F5DC]';
                  } else {
                    cls = 'border-[#1A1A2E]/10 bg-white';
                  }
                }
                const showCheck = !!result && (correctIds ? isCorrect : selected && !qWrong);
                const showCross = !!result && selected && (correctIds ? !isCorrect : qWrong);
                return (
                  <button key={o.id} type="button" onClick={() => toggle(q, o.id)} disabled={locked}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-colors flex items-center gap-2 disabled:cursor-default ${cls}`}>
                    {showCheck && <CheckCircle2 className="w-4 h-4 text-[#2D9D5B] shrink-0" />}
                    {showCross && <XCircle className="w-4 h-4 text-[#FF6B6B] shrink-0" />}
                    <span>{o.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {result ? (
        <div className={`rounded-xl p-4 ${result.passed ? 'bg-[#E8F5DC] text-[#2D5016]' : 'bg-[#FFF4D6] text-[#5A4500]'}`}>
          <p className="font-semibold">
            {result.passed ? 'Тест пройден!' : 'Пока не получилось'} — {result.correct} из {result.total} ({result.percent}%)
          </p>
          {!result.passed && (
            <p className="text-sm">
              Нужно набрать не меньше {threshold}%. Вопросы с ошибками отмечены красным — правильные ответы откроются после прохождения.
            </p>
          )}
          <Button variant="outline" size="sm" className="mt-3" onClick={retry}>
            <RotateCcw className="w-4 h-4 mr-1" />Пройти заново
          </Button>
        </div>
      ) : (
        <Button onClick={check} disabled={!allAnswered || checking}>
          {checking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {checking ? 'Проверяем…' : 'Проверить ответы'}
        </Button>
      )}
    </div>
  );
}
