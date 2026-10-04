-- Правила прогресса:
-- 1) принятое ДЗ засчитывает урок ученику, возврат принятой работы — снимает отметку;
-- 2) урок типа «домашнее задание» ученик не может отметить пройденным сам;
-- 3) в последовательном курсе нельзя отметить урок, пока не пройдены все предыдущие.

create or replace function public.homework_progress_sync() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'approved' then
    insert into lesson_progress (user_id, course_id, lesson_id)
    values (new.student_id, new.course_id, new.lesson_id)
    on conflict (user_id, lesson_id) do nothing;
  elsif tg_op = 'UPDATE' and old.status = 'approved' then
    delete from lesson_progress where user_id = new.student_id and lesson_id = new.lesson_id;
  end if;
  return new;
end $$;

create trigger homework_progress after insert or update of status on public.homework
  for each row execute function public.homework_progress_sync();

create or replace function public.check_progress_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_type text;
  v_seq boolean;
  v_mpos int;
  v_lpos int;
  v_missing bigint;
begin
  -- Проверяем только отметки, которые ученик ставит сам себе.
  -- Засчёт ДЗ происходит в сессии автора (он сотрудник курса) и сюда не попадает.
  if auth.uid() is null or auth.uid() <> new.user_id or public.is_course_staff(new.course_id) then
    return new;
  end if;

  select l.type, c.sequential, m.position, l.position
    into v_type, v_seq, v_mpos, v_lpos
  from lessons l
  join courses c on c.id = l.course_id
  join modules m on m.id = l.module_id
  where l.id = new.lesson_id;

  if v_type = 'homework' then
    raise exception 'Домашнее задание засчитывается после проверки автором';
  end if;

  if v_seq then
    select count(*) into v_missing
    from lessons l join modules m on m.id = l.module_id
    where l.course_id = new.course_id
      and (m.position < v_mpos or (m.position = v_mpos and l.position < v_lpos))
      and not exists (select 1 from lesson_progress p where p.user_id = new.user_id and p.lesson_id = l.id);
    if v_missing > 0 then
      raise exception 'Сначала пройдите предыдущие уроки';
    end if;
  end if;
  return new;
end $$;

create trigger progress_check before insert on public.lesson_progress
  for each row execute function public.check_progress_insert();
