-- Курсы «по приглашению» и «платные» не должны быть видны всем:
-- опубликованный курс виден посторонним (каталог), только если запись на него свободная.
-- Страница приглашения использует invite_info() (security definer) и продолжает работать.

drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses for select
  using ((status = 'published' and access_type = 'free') or public.is_course_staff(id) or public.is_enrolled(id));

drop policy if exists modules_select on public.modules;
create policy modules_select on public.modules for select
  using (exists (select 1 from courses c where c.id = course_id
                 and ((c.status = 'published' and c.access_type = 'free') or public.is_course_staff(c.id) or public.is_enrolled(c.id))));
