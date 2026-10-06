-- =====================================================================
-- Модерация авторов: после регистрации автор ждёт одобрения администратора.
-- Пока заявка не одобрена, автор не может создавать курсы.
-- Администратор (role = 'admin') может одновременно вести свою школу.
-- =====================================================================

alter table public.profiles
  add column if not exists author_status text check (author_status in ('pending', 'approved', 'rejected'));

-- Уже зарегистрированные авторы и админы со школой — одобрены
update public.profiles set author_status = 'approved'
where role in ('author', 'admin') and school_id is not null and author_status is null;

-- Может ли текущий пользователь создавать и удалять курсы своей школы
create or replace function public.can_author() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and ((role = 'author' and author_status = 'approved') or role = 'admin')
  )
$$;

drop policy if exists courses_insert on public.courses;
create policy courses_insert on public.courses for insert
  with check ((school_id = public.my_school_id() and public.can_author()) or public.is_admin());

drop policy if exists courses_delete on public.courses;
create policy courses_delete on public.courses for delete
  using ((school_id = public.my_school_id() and public.can_author()) or public.is_admin());

-- Регистрация: автор получает статус «на рассмотрении», админам — уведомление
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_role text := coalesce(new.raw_user_meta_data->>'role', 'student');
  v_name text := coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1));
  v_school uuid;
  v_admin record;
begin
  if v_role not in ('student','author') then v_role := 'student'; end if;
  if v_role = 'author' then
    insert into schools (owner_id, name)
    values (new.id, coalesce(nullif(new.raw_user_meta_data->>'school_name', ''), 'Школа ' || v_name))
    returning id into v_school;
  end if;
  insert into profiles (id, email, name, role, school_id, author_status)
  values (new.id, new.email, v_name, v_role, v_school, case when v_role = 'author' then 'pending' end);

  if v_role = 'author' then
    for v_admin in select id from profiles where role = 'admin' loop
      perform notify(v_admin.id, 'author_pending', 'Новая заявка автора',
        v_name || ' · ' || new.email, '/admin');
    end loop;
  end if;
  return new;
end $$;

-- Пользователь не может сам поменять себе роль, школу или статус заявки
create or replace function public.protect_profile_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() and auth.uid() is not null then
    new.role := old.role;
    new.school_id := old.school_id;
    new.email := old.email;
    new.author_status := old.author_status;
  end if;
  return new;
end $$;

-- Решение администратора по заявке автора
create or replace function public.set_author_status(p_user uuid, p_status text) returns void
language plpgsql security definer set search_path = public as $$
declare v_prev text;
begin
  if not public.is_admin() then raise exception 'Недостаточно прав'; end if;
  if p_status not in ('pending', 'approved', 'rejected') then raise exception 'Неизвестный статус'; end if;
  select author_status into v_prev from profiles where id = p_user and role = 'author';
  if not found then raise exception 'Автор не найден'; end if;
  update profiles set author_status = p_status where id = p_user;
  if p_status is distinct from v_prev and p_status in ('approved', 'rejected') then
    perform notify(p_user, 'author_status',
      case p_status when 'approved' then 'Аккаунт автора одобрен' else 'Заявка автора отклонена' end,
      case p_status when 'approved' then 'Можно создавать курсы' else 'Напишите нам, если это ошибка' end,
      '/author');
  end if;
end $$;
