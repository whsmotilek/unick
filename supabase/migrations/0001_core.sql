-- =====================================================================
-- Unick — базовая схема: профили, школы, курсы, доступ, прогресс, ДЗ, чат
-- Все таблицы защищены Row Level Security. Клиент ходит с anon-ключом,
-- права определяются политиками ниже.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Профили и школы ----------

create table public.schools (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  slug        text unique,
  created_at  timestamptz not null default now()
);

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text not null default '',
  avatar      text,
  role        text not null default 'student' check (role in ('student','author','curator','admin')),
  school_id   uuid references public.schools(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------- Курсы ----------

create table public.courses (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  title        text not null,
  description  text not null default '',
  cover        text,
  status       text not null default 'draft' check (status in ('draft','published','archived')),
  access_type  text not null default 'invite' check (access_type in ('invite','free','paid')),
  price        integer,                      -- в рублях, для access_type = 'paid'
  sequential   boolean not null default false, -- уроки открываются по порядку
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on public.courses(school_id);

create table public.modules (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses(id) on delete cascade,
  title        text not null,
  description  text,
  position     integer not null default 0
);
create index on public.modules(course_id);

create table public.lessons (
  id           uuid primary key default gen_random_uuid(),
  module_id    uuid not null references public.modules(id) on delete cascade,
  course_id    uuid not null references public.courses(id) on delete cascade,
  title        text not null,
  description  text,
  position     integer not null default 0,
  type         text not null check (type in ('video','text','homework','quiz','file','audio')),
  content      jsonb not null default '{}'::jsonb,
  is_locked    boolean not null default false
);
create index on public.lessons(module_id);
create index on public.lessons(course_id);

-- ---------- Доступ ----------

create table public.invites (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  code        text not null unique default encode(gen_random_bytes(6), 'hex'),
  label       text,
  max_uses    integer,                 -- null = без ограничения
  uses        integer not null default 0,
  expires_at  timestamptz,
  active      boolean not null default true,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index on public.invites(course_id);

create table public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  status      text not null default 'active' check (status in ('active','revoked','completed')),
  source      text not null default 'manual' check (source in ('invite','manual','free','network','payment')),
  invite_id   uuid references public.invites(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (course_id, user_id)
);
create index on public.enrollments(user_id);

-- ---------- Обучение ----------

create table public.lesson_progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_id    uuid not null references public.courses(id) on delete cascade,
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index on public.lesson_progress(course_id);

create table public.homework (
  id           uuid primary key default gen_random_uuid(),
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  course_id    uuid not null references public.courses(id) on delete cascade,
  student_id   uuid not null references auth.users(id) on delete cascade,
  title        text not null default '',
  description  text not null default '',
  status       text not null default 'submitted' check (status in ('submitted','review','returned','approved')),
  content      text not null default '',
  files        jsonb not null default '[]'::jsonb,
  feedback     text,
  reviewer_id  uuid references auth.users(id) on delete set null,
  deadline     timestamptz,
  submitted_at timestamptz not null default now(),
  reviewed_at  timestamptz,
  unique (lesson_id, student_id)
);
create index on public.homework(course_id);

create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  from_id     uuid not null references auth.users(id) on delete cascade,
  to_id       uuid not null references auth.users(id) on delete cascade,
  content     text not null check (length(content) between 1 and 5000),
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on public.messages(from_id);
create index on public.messages(to_id);

-- =====================================================================
-- Вспомогательные функции (security definer, чтобы не ловить рекурсию RLS)
-- =====================================================================

create or replace function public.my_school_id() returns uuid
language sql stable security definer set search_path = public as $$
  select school_id from profiles where id = auth.uid()
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

-- Пользователь — сотрудник школы, которой принадлежит курс (автор или куратор)
create or replace function public.is_course_staff(p_course uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from courses c join profiles p on p.school_id = c.school_id
    where c.id = p_course and p.id = auth.uid() and p.role in ('author','curator')
  ) or public.is_admin()
$$;

create or replace function public.is_enrolled(p_course uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from enrollments e
    where e.course_id = p_course and e.user_id = auth.uid() and e.status in ('active','completed')
  )
$$;

-- Может ли текущий пользователь видеть профиль p_user:
-- сам себя; сотрудник школы видит своих учеников и коллег; ученик видит сотрудников школ своих курсов
create or replace function public.can_see_profile(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select p_user = auth.uid()
    or public.is_admin()
    or exists (  -- коллеги по школе
      select 1 from profiles me join profiles other on other.school_id = me.school_id
      where me.id = auth.uid() and other.id = p_user and me.school_id is not null
    )
    or exists (  -- я сотрудник, он ученик моего курса
      select 1 from enrollments e join courses c on c.id = e.course_id
      join profiles me on me.school_id = c.school_id and me.id = auth.uid()
      where e.user_id = p_user
    )
    or exists (  -- я ученик, он сотрудник школы моего курса
      select 1 from enrollments e join courses c on c.id = e.course_id
      join profiles other on other.school_id = c.school_id and other.id = p_user
      where e.user_id = auth.uid()
    )
$$;

-- =====================================================================
-- Триггеры
-- =====================================================================

-- Профиль и (для автора) школа создаются при регистрации.
-- Роль из метаданных принимается только student/author — curator/admin назначаются вручную.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_role text := coalesce(new.raw_user_meta_data->>'role', 'student');
  v_name text := coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1));
  v_school uuid;
begin
  if v_role not in ('student','author') then v_role := 'student'; end if;
  if v_role = 'author' then
    insert into schools (owner_id, name)
    values (new.id, coalesce(nullif(new.raw_user_meta_data->>'school_name', ''), 'Школа ' || v_name))
    returning id into v_school;
  end if;
  insert into profiles (id, email, name, role, school_id)
  values (new.id, new.email, v_name, v_role, v_school);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Пользователь не может сам поменять себе роль или школу
create or replace function public.protect_profile_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() and auth.uid() is not null then
    new.role := old.role;
    new.school_id := old.school_id;
    new.email := old.email;
  end if;
  return new;
end $$;

create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profile_fields();

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at := now(); return new; end $$;

create trigger courses_touch before update on public.courses
  for each row execute function public.touch_updated_at();

-- Ученик не может сам себе поставить оценку по ДЗ
create or replace function public.protect_homework_review() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_course_staff(new.course_id) then
    if tg_op = 'UPDATE' then
      if old.status = 'approved' then
        raise exception 'Принятую работу нельзя изменить';
      end if;
      new.feedback := old.feedback;
      new.reviewer_id := old.reviewer_id;
      new.reviewed_at := old.reviewed_at;
    else
      new.feedback := null; new.reviewer_id := null; new.reviewed_at := null;
    end if;
    new.status := 'submitted';
    new.submitted_at := now();
  end if;
  return new;
end $$;

create trigger homework_protect before insert or update on public.homework
  for each row execute function public.protect_homework_review();

-- =====================================================================
-- RPC
-- =====================================================================

-- Вступление в курс по инвайт-коду. Возвращает id курса.
create or replace function public.redeem_invite(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_inv invites%rowtype;
begin
  if auth.uid() is null then raise exception 'Нужно войти в аккаунт'; end if;
  select * into v_inv from invites where code = p_code for update;
  if not found or not v_inv.active then raise exception 'Приглашение недействительно'; end if;
  if v_inv.expires_at is not null and v_inv.expires_at < now() then raise exception 'Срок приглашения истёк'; end if;
  if exists (select 1 from enrollments where course_id = v_inv.course_id and user_id = auth.uid()) then
    update enrollments set status = 'active' where course_id = v_inv.course_id and user_id = auth.uid() and status = 'revoked';
    return v_inv.course_id;
  end if;
  if v_inv.max_uses is not null and v_inv.uses >= v_inv.max_uses then raise exception 'Лимит мест по приглашению исчерпан'; end if;
  insert into enrollments (course_id, user_id, source, invite_id) values (v_inv.course_id, auth.uid(), 'invite', v_inv.id);
  update invites set uses = uses + 1 where id = v_inv.id;
  return v_inv.course_id;
end $$;

-- Публичная информация о приглашении (для страницы /join/:code до входа)
create or replace function public.invite_info(p_code text)
returns table (course_id uuid, title text, description text, cover text, school_name text, lessons_count bigint, valid boolean)
language sql stable security definer set search_path = public as $$
  select c.id, c.title, c.description, c.cover, s.name,
         (select count(*) from lessons l where l.course_id = c.id),
         i.active and (i.expires_at is null or i.expires_at > now())
           and (i.max_uses is null or i.uses < i.max_uses) and c.status = 'published'
  from invites i join courses c on c.id = i.course_id join schools s on s.id = c.school_id
  where i.code = p_code
$$;

-- Бесплатная запись на опубликованный курс с access_type = 'free'
create or replace function public.enroll_free(p_course uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Нужно войти в аккаунт'; end if;
  if not exists (select 1 from courses where id = p_course and status = 'published' and access_type = 'free') then
    raise exception 'На этот курс нельзя записаться самостоятельно';
  end if;
  insert into enrollments (course_id, user_id, source) values (p_course, auth.uid(), 'free')
  on conflict (course_id, user_id) do nothing;
end $$;

-- Добавить ученика по email (только сотрудник школы; пользователь должен быть зарегистрирован)
create or replace function public.enroll_by_email(p_course uuid, p_email text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_user uuid;
begin
  if not public.is_course_staff(p_course) then raise exception 'Недостаточно прав'; end if;
  select id into v_user from profiles where lower(email) = lower(trim(p_email));
  if v_user is null then raise exception 'Пользователь с таким email не зарегистрирован'; end if;
  insert into enrollments (course_id, user_id, source) values (p_course, v_user, 'manual')
  on conflict (course_id, user_id) do update set status = 'active';
  return v_user;
end $$;

-- =====================================================================
-- RLS
-- =====================================================================

alter table public.schools          enable row level security;
alter table public.profiles         enable row level security;
alter table public.courses          enable row level security;
alter table public.modules          enable row level security;
alter table public.lessons          enable row level security;
alter table public.invites          enable row level security;
alter table public.enrollments      enable row level security;
alter table public.lesson_progress  enable row level security;
alter table public.homework         enable row level security;
alter table public.messages         enable row level security;

-- schools: название школы видно всем (публичные страницы), менять может владелец
create policy schools_select on public.schools for select using (true);
create policy schools_update on public.schools for update using (owner_id = auth.uid() or public.is_admin());

-- profiles
create policy profiles_select on public.profiles for select using (public.can_see_profile(id));
create policy profiles_update on public.profiles for update using (id = auth.uid() or public.is_admin());

-- courses: опубликованные видны всем (каталог), остальные — сотрудникам и записанным
create policy courses_select on public.courses for select
  using (status = 'published' or public.is_course_staff(id) or public.is_enrolled(id));
create policy courses_insert on public.courses for insert
  with check ((school_id = public.my_school_id()
               and exists (select 1 from profiles where id = auth.uid() and role = 'author'))
              or public.is_admin());
create policy courses_update on public.courses for update using (public.is_course_staff(id));
create policy courses_delete on public.courses for delete
  using (school_id = public.my_school_id()
         and exists (select 1 from profiles where id = auth.uid() and role = 'author'));

-- modules: структура видна там же, где курс
create policy modules_select on public.modules for select
  using (exists (select 1 from courses c where c.id = course_id
                 and (c.status = 'published' or public.is_course_staff(c.id) or public.is_enrolled(c.id))));
create policy modules_write on public.modules for all
  using (public.is_course_staff(course_id)) with check (public.is_course_staff(course_id));

-- lessons: содержимое уроков — только сотрудникам и записанным ученикам
create policy lessons_select on public.lessons for select
  using (public.is_course_staff(course_id) or public.is_enrolled(course_id));
create policy lessons_write on public.lessons for all
  using (public.is_course_staff(course_id)) with check (public.is_course_staff(course_id));

-- invites: управляют сотрудники; ученики используют через RPC
create policy invites_staff on public.invites for all
  using (public.is_course_staff(course_id)) with check (public.is_course_staff(course_id));

-- enrollments: ученик видит свои, сотрудник — по своим курсам и управляет ими
create policy enrollments_select on public.enrollments for select
  using (user_id = auth.uid() or public.is_course_staff(course_id));
create policy enrollments_staff_write on public.enrollments for all
  using (public.is_course_staff(course_id)) with check (public.is_course_staff(course_id));

-- lesson_progress: ученик отмечает свои уроки в курсах, где он записан
create policy progress_select on public.lesson_progress for select
  using (user_id = auth.uid() or public.is_course_staff(course_id));
create policy progress_insert on public.lesson_progress for insert
  with check (user_id = auth.uid() and public.is_enrolled(course_id));
create policy progress_delete on public.lesson_progress for delete
  using (user_id = auth.uid());

-- homework
create policy homework_select on public.homework for select
  using (student_id = auth.uid() or public.is_course_staff(course_id));
create policy homework_student_insert on public.homework for insert
  with check (student_id = auth.uid() and public.is_enrolled(course_id));
create policy homework_update on public.homework for update
  using (student_id = auth.uid() or public.is_course_staff(course_id));

-- messages: только участники; писать можно тем, чей профиль виден
create policy messages_select on public.messages for select
  using (from_id = auth.uid() or to_id = auth.uid());
create policy messages_insert on public.messages for insert
  with check (from_id = auth.uid() and public.can_see_profile(to_id));
create policy messages_update on public.messages for update
  using (to_id = auth.uid());

-- =====================================================================
-- Storage: обложки публичные, материалы уроков и файлы ДЗ — приватные
-- Путь объекта: <course_id>/<...>
-- =====================================================================

insert into storage.buckets (id, name, public) values ('covers', 'covers', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('lesson-files', 'lesson-files', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('homework-files', 'homework-files', false)
  on conflict (id) do nothing;

create or replace function public.path_course(p_name text) returns uuid
language sql immutable as $$
  select case when split_part(p_name, '/', 1) ~ '^[0-9a-f-]{36}$'
              then split_part(p_name, '/', 1)::uuid end
$$;

create policy covers_read on storage.objects for select using (bucket_id = 'covers');
create policy covers_write on storage.objects for insert
  with check (bucket_id = 'covers' and public.is_course_staff(public.path_course(name)));
create policy covers_delete on storage.objects for delete
  using (bucket_id = 'covers' and public.is_course_staff(public.path_course(name)));

create policy lesson_files_read on storage.objects for select
  using (bucket_id = 'lesson-files' and (public.is_course_staff(public.path_course(name))
                                         or public.is_enrolled(public.path_course(name))));
create policy lesson_files_write on storage.objects for insert
  with check (bucket_id = 'lesson-files' and public.is_course_staff(public.path_course(name)));
create policy lesson_files_delete on storage.objects for delete
  using (bucket_id = 'lesson-files' and public.is_course_staff(public.path_course(name)));

-- homework-files: <course_id>/<student_id>/<file>
create policy hw_files_read on storage.objects for select
  using (bucket_id = 'homework-files' and (
    split_part(name, '/', 2) = auth.uid()::text or public.is_course_staff(public.path_course(name))));
create policy hw_files_write on storage.objects for insert
  with check (bucket_id = 'homework-files' and split_part(name, '/', 2) = auth.uid()::text
              and public.is_enrolled(public.path_course(name)));
