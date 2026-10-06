-- Исправление: политики таблицы courses не должны вызывать is_course_staff(id) — эта функция
-- ищет курс в той же таблице, а при INSERT ... RETURNING / upsert новая строка ещё не видна
-- запросу внутри функции. Из-за этого автор не мог создать черновик или курс «по приглашению».
-- Проверяем сотрудника по school_id самой строки.

create or replace function public.is_school_staff(p_school uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and school_id = p_school and role in ('author', 'curator', 'admin')
  ) or public.is_admin()
$$;

drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses for select
  using ((status = 'published' and access_type = 'free') or public.is_school_staff(school_id) or public.is_enrolled(id));

drop policy if exists courses_update on public.courses;
create policy courses_update on public.courses for update
  using (public.is_school_staff(school_id)) with check (public.is_school_staff(school_id));
