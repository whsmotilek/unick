-- =====================================================================
-- 1. Тесты с проверкой на сервере
--    Правильные ответы хранятся в quiz_keys (видны только сотрудникам),
--    ученик отправляет ответы в submit_quiz(), урок засчитывает сервер.
-- 2. Уведомления в кабинете (основа и для будущих email-рассылок)
-- =====================================================================

create table public.quiz_keys (
  lesson_id     uuid primary key references public.lessons(id) on delete cascade,
  course_id     uuid not null references public.courses(id) on delete cascade,
  -- { "<question_id>": ["<option_id>", ...] }
  answers       jsonb not null default '{}'::jsonb,
  pass_percent  integer not null default 70 check (pass_percent between 0 and 100)
);

create table public.quiz_attempts (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  answers     jsonb not null,
  correct     integer not null,
  total       integer not null,
  percent     integer not null,
  passed      boolean not null,
  created_at  timestamptz not null default now()
);
create index on public.quiz_attempts(lesson_id, user_id);

alter table public.quiz_keys enable row level security;
alter table public.quiz_attempts enable row level security;

create policy quiz_keys_staff on public.quiz_keys for all
  using (public.is_course_staff(course_id)) with check (public.is_course_staff(course_id));
create policy quiz_attempts_select on public.quiz_attempts for select
  using (user_id = auth.uid() or public.is_course_staff(course_id));
-- Вставка попыток — только через submit_quiz()

-- Проверка ответов. Правильные ответы возвращаются только при успешном прохождении,
-- при неудаче — только список вопросов с ошибками.
create or replace function public.submit_quiz(p_lesson uuid, p_answers jsonb)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_course uuid;
  v_type text;
  v_key jsonb;
  v_pass int;
  v_total int := 0;
  v_correct int := 0;
  v_wrong jsonb := '[]'::jsonb;
  v_q text;
  v_expected jsonb;
  v_given jsonb;
  v_percent int;
  v_passed boolean;
begin
  if auth.uid() is null then raise exception 'Нужно войти в аккаунт'; end if;
  select course_id, type into v_course, v_type from lessons where id = p_lesson;
  if v_course is null or v_type <> 'quiz' then raise exception 'Тест не найден'; end if;
  if not public.is_enrolled(v_course) and not public.is_course_staff(v_course) then
    raise exception 'Нет доступа к курсу';
  end if;

  select answers, pass_percent into v_key, v_pass from quiz_keys where lesson_id = p_lesson;
  if v_key is null then raise exception 'Автор ещё не настроил ответы к тесту'; end if;

  for v_q, v_expected in select * from jsonb_each(v_key) loop
    v_total := v_total + 1;
    v_given := coalesce(p_answers -> v_q, '[]'::jsonb);
    if (select coalesce(jsonb_agg(x order by x), '[]'::jsonb) from jsonb_array_elements_text(v_given) x)
       = (select coalesce(jsonb_agg(x order by x), '[]'::jsonb) from jsonb_array_elements_text(v_expected) x)
       and jsonb_array_length(v_given) > 0 then
      v_correct := v_correct + 1;
    else
      v_wrong := v_wrong || to_jsonb(v_q);
    end if;
  end loop;

  v_percent := case when v_total = 0 then 0 else round(v_correct * 100.0 / v_total) end;
  v_passed := v_percent >= v_pass;

  -- Сотрудник проходит тест в предпросмотре — попытку не сохраняем
  if public.is_enrolled(v_course) then
    insert into quiz_attempts (lesson_id, course_id, user_id, answers, correct, total, percent, passed)
    values (p_lesson, v_course, auth.uid(), p_answers, v_correct, v_total, v_percent, v_passed);

    if v_passed then
      perform set_config('unick.quiz_ok', 'on', true);
      insert into lesson_progress (user_id, course_id, lesson_id) values (auth.uid(), v_course, p_lesson)
      on conflict (user_id, lesson_id) do nothing;
      perform set_config('unick.quiz_ok', 'off', true);
    end if;
  end if;

  return jsonb_build_object(
    'correct', v_correct, 'total', v_total, 'percent', v_percent, 'passed', v_passed, 'passPercent', v_pass,
    'wrong', v_wrong,
    'key', case when v_passed then v_key else null end
  );
end $$;

-- Тест засчитывается только через submit_quiz: дополняем проверку отметок прогресса
create or replace function public.check_progress_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_type text;
  v_seq boolean;
  v_mpos int;
  v_lpos int;
  v_missing bigint;
begin
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
  if v_type = 'quiz' and current_setting('unick.quiz_ok', true) is distinct from 'on' then
    raise exception 'Тест засчитывается после успешной сдачи';
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

-- Правильные ответы не должны попадать в содержимое урока, которое видит ученик
create or replace function public.strip_quiz_answers() returns trigger
language plpgsql as $$
begin
  if new.type = 'quiz' and new.content ? 'questions' then
    new.content := jsonb_set(new.content, '{questions}', coalesce((
      select jsonb_agg(q - 'correct') from jsonb_array_elements(new.content -> 'questions') q
    ), '[]'::jsonb));
  end if;
  return new;
end $$;

create trigger lessons_strip_quiz before insert or update on public.lessons
  for each row execute function public.strip_quiz_answers();

-- =====================================================================
-- Уведомления
-- =====================================================================

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text,
  link        text,
  read        boolean not null default false,
  emailed_at  timestamptz,               -- для будущей email-рассылки
  created_at  timestamptz not null default now()
);
create index on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;
create policy notifications_select on public.notifications for select using (user_id = auth.uid());
create policy notifications_update on public.notifications for update using (user_id = auth.uid());
create policy notifications_delete on public.notifications for delete using (user_id = auth.uid());

create or replace function public.notify(p_user uuid, p_type text, p_title text, p_body text, p_link text)
returns void language sql security definer set search_path = public as $$
  insert into notifications (user_id, type, title, body, link) values (p_user, p_type, p_title, p_body, p_link)
$$;

-- Префикс кабинета для ссылок в уведомлении
create or replace function public.role_home(p_user uuid) returns text
language sql stable security definer set search_path = public as $$
  select case role when 'author' then '/author' when 'curator' then '/curator' when 'admin' then '/admin' else '/student' end
  from profiles where id = p_user
$$;

-- ДЗ сдано → сотрудникам школы; ДЗ проверено → ученику
create or replace function public.homework_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_course record;
  v_student text;
  v_staff record;
begin
  select c.id, c.title, c.school_id into v_course from courses c where c.id = new.course_id;
  select name into v_student from profiles where id = new.student_id;

  if new.status = 'submitted' and (tg_op = 'INSERT' or old.status is distinct from 'submitted' or old.submitted_at is distinct from new.submitted_at) then
    for v_staff in select id from profiles where school_id = v_course.school_id and role in ('author','curator') loop
      perform notify(v_staff.id, 'homework_submitted', 'Новое домашнее задание',
        coalesce(v_student, 'Ученик') || ' · ' || new.title || ' · ' || v_course.title,
        case when role_home(v_staff.id) = '/curator' then '/curator' else '/author/homework' end);
    end loop;
  elsif tg_op = 'UPDATE' and new.status in ('approved','returned') and old.status is distinct from new.status then
    perform notify(new.student_id, 'homework_reviewed',
      case new.status when 'approved' then 'Домашнее задание принято' else 'Задание вернули на доработку' end,
      new.title || ' · ' || v_course.title,
      '/student/courses/' || new.course_id || '/lesson/' || new.lesson_id);
  end if;
  return new;
end $$;

create trigger homework_notify after insert or update on public.homework
  for each row execute function public.homework_notify();

-- Новый ученик → автору
create or replace function public.enrollment_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_course record;
  v_student text;
begin
  select c.id, c.title, s.owner_id into v_course from courses c join schools s on s.id = c.school_id where c.id = new.course_id;
  select name into v_student from profiles where id = new.user_id;
  perform notify(v_course.owner_id, 'student_enrolled', 'Новый ученик',
    coalesce(v_student, 'Ученик') || ' · ' || v_course.title,
    '/author/courses/' || new.course_id || '?tab=access');
  return new;
end $$;

create trigger enrollment_notify after insert on public.enrollments
  for each row execute function public.enrollment_notify();

-- Сообщение в чате → получателю (не чаще одного непрочитанного уведомления от собеседника)
create or replace function public.message_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_from text;
begin
  if exists (select 1 from notifications where user_id = new.to_id and type = 'message' and not read
             and link like '%' || new.from_id::text) then
    return new;
  end if;
  select name into v_from from profiles where id = new.from_id;
  perform notify(new.to_id, 'message', 'Новое сообщение', coalesce(v_from, 'Пользователь') || ': ' || left(new.content, 120),
    case when role_home(new.to_id) in ('/author', '/student') then role_home(new.to_id) || '/chat?with=' || new.from_id
         else role_home(new.to_id) || '?with=' || new.from_id end);
  return new;
end $$;

create trigger message_notify after insert on public.messages
  for each row execute function public.message_notify();
