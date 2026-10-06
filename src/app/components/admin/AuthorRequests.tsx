import { useMemo, useState } from 'react';
import { Check, X, RotateCcw, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useDataStore } from '../../store/DataStore';

/** Заявки авторов: в пилоте кабинет автора открывается только после одобрения. */
export function AuthorRequests() {
  const { users, courses, setAuthorStatus } = useDataStore();
  const [showDecided, setShowDecided] = useState(false);

  const authors = useMemo(() => users.filter(u => u.role === 'author'), [users]);
  const pending = authors.filter(u => u.authorStatus === 'pending');
  const decided = authors.filter(u => u.authorStatus !== 'pending');

  const decide = (id: string, name: string, status: 'approved' | 'rejected' | 'pending') => {
    setAuthorStatus(id, status);
    toast.success(status === 'approved' ? `${name}: доступ открыт` : status === 'rejected' ? `${name}: заявка отклонена` : `${name}: снова на рассмотрении`);
  };

  return (
    <Card className="border-0 mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <UserCheck className="w-5 h-5 text-[#7C6AF7] shrink-0" />
            <h2 className="text-[16px] font-semibold text-[#1A1A2E] whitespace-nowrap" style={{ fontFamily: 'var(--font-heading)' }}>Заявки авторов</h2>
            {pending.length > 0 && <Badge className="bg-[#FF6B6B] text-white border-0">{pending.length}</Badge>}
          </div>
          {decided.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setShowDecided(v => !v)} aria-expanded={showDecided} className="h-10 sm:h-8 ml-auto -mr-2 sm:mr-0 text-[#7C6AF7]">
              {showDecided ? 'Скрыть рассмотренные' : `Рассмотренные · ${decided.length}`}
            </Button>
          )}
        </div>

        {pending.length === 0 ? (
          <p className="text-sm text-[#8A8A9A]">Новых заявок нет. Автор появится здесь сразу после регистрации.</p>
        ) : (
          <ul className="divide-y divide-[#1A1A2E]/5">
            {pending.map(u => (
              <li key={u.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A2E] truncate">{u.name}</p>
                  <p className="text-xs text-[#8A8A9A] truncate">{u.email}</p>
                </div>
                <div className="grid grid-cols-2 sm:flex gap-2">
                  <Button size="sm" className="h-10 sm:h-8" onClick={() => decide(u.id, u.name, 'approved')}><Check className="w-4 h-4 mr-1" />Одобрить</Button>
                  <Button size="sm" variant="outline" className="h-10 sm:h-8" onClick={() => {
                    if (window.confirm(`Отклонить заявку ${u.name}?`)) decide(u.id, u.name, 'rejected');
                  }}><X className="w-4 h-4 mr-1" />Отклонить</Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {showDecided && decided.length > 0 && (
          <ul className="divide-y divide-[#1A1A2E]/5 mt-4 border-t border-[#1A1A2E]/5">
            {decided.map(u => {
              const count = courses.filter(c => c.schoolId === u.schoolId).length;
              return (
                <li key={u.id} className="py-3 flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <div className="flex-1 min-w-0 basis-full sm:basis-auto">
                    <p className="text-sm text-[#1A1A2E] truncate">{u.name} <span className="text-[#8A8A9A]">· {u.email}</span></p>
                    <p className="text-xs text-[#8A8A9A]">Курсов: {count}</p>
                  </div>
                  {u.authorStatus === 'approved'
                    ? <Badge variant="success" className="shrink-0">Одобрен</Badge>
                    : <Badge variant="destructive" className="shrink-0">Отклонён</Badge>}
                  <Button size="sm" variant="ghost" className="h-10 sm:h-8 ml-auto sm:ml-0" onClick={() => decide(u.id, u.name, u.authorStatus === 'approved' ? 'rejected' : 'approved')}>
                    <RotateCcw className="w-4 h-4 mr-1" />{u.authorStatus === 'approved' ? 'Закрыть доступ' : 'Одобрить'}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
