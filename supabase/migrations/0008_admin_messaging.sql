-- Переписка с администратором платформы (поддержка):
-- 1) профиль администратора виден всем вошедшим — иначе в чате не видно, кто написал;
-- 2) ответить можно любому, кто уже написал тебе;
-- 3) ссылка в уведомлении о сообщении для администратора ведёт в чат кабинета автора.

create or replace function public.can_see_profile(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select p_user = auth.uid()
    or public.is_admin()
    or exists (select 1 from profiles where id = p_user and role = 'admin')   -- поддержка видна всем
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

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert
  with check (
    from_id = auth.uid()
    and (public.can_see_profile(to_id)
         or exists (select 1 from public.messages m where m.from_id = to_id and m.to_id = auth.uid()))
  );

create or replace function public.message_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_from text;
  v_home text := role_home(new.to_id);
begin
  if exists (select 1 from notifications where user_id = new.to_id and type = 'message' and not read
             and link like '%' || new.from_id::text) then
    return new;
  end if;
  select name into v_from from profiles where id = new.from_id;
  perform notify(new.to_id, 'message', 'Новое сообщение', coalesce(v_from, 'Пользователь') || ': ' || left(new.content, 120),
    case v_home
      when '/author' then '/author/chat?with='
      when '/student' then '/student/chat?with='
      when '/admin' then '/author/chat?with='   -- у администратора чат в кабинете автора
      else v_home || '?with='
    end || new.from_id);
  return new;
end $$;
