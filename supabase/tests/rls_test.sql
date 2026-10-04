-- Проверка прав доступа. Запуск: psql -v ON_ERROR_STOP=1 -f stub_supabase.sql -f ../migrations/*.sql -f rls_test.sql
\set QUIET on
create or replace function pg_temp.login(p uuid) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', coalesce(p::text, ''), false); end $$;
create or replace function pg_temp.check(cond boolean, msg text) returns void language plpgsql as $$
begin if not cond then raise exception 'FAIL: %', msg; end if; raise notice 'ok  %', msg; end $$;

-- Пользователи создаются через auth.users -> триггер
insert into auth.users (id, email, raw_user_meta_data) values
 ('00000000-0000-0000-0000-00000000000a', 'author@x.ru',  '{"name":"Автор","role":"author"}'),
 ('00000000-0000-0000-0000-00000000000b', 'author2@x.ru', '{"name":"Чужой автор","role":"author"}'),
 ('00000000-0000-0000-0000-00000000000c', 'st1@x.ru',     '{"name":"Ученик 1","role":"student"}'),
 ('00000000-0000-0000-0000-00000000000d', 'st2@x.ru',     '{"name":"Ученик 2","role":"admin"}');

select pg_temp.check((select role from profiles where email='st2@x.ru') = 'student', 'роль admin из метаданных не принимается');
select pg_temp.check((select school_id from profiles where email='author@x.ru') is not null, 'у автора создаётся школа');

set role authenticated;

-- Автор создаёт курс, модуль, урок, инвайт
select pg_temp.login('00000000-0000-0000-0000-00000000000a');
insert into courses (id, school_id, title, status) values
 ('10000000-0000-0000-0000-000000000001', my_school_id(), 'Курс А', 'published'),
 ('10000000-0000-0000-0000-000000000002', my_school_id(), 'Черновик', 'draft');
insert into modules (id, course_id, title) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'М1');
insert into lessons (id, module_id, course_id, title, type, content) values
 ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Урок 1', 'text', '{"html":"секрет"}'),
 ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'ДЗ', 'homework', '{}');
insert into invites (course_id, code, max_uses) values ('10000000-0000-0000-0000-000000000001', 'join-a', 1);
select pg_temp.check((select count(*) from courses) = 2, 'автор видит свои курсы, включая черновик');

-- Чужой автор
select pg_temp.login('00000000-0000-0000-0000-00000000000b');
select pg_temp.check((select count(*) from courses) = 1, 'чужой автор видит только опубликованный курс');
select pg_temp.check((select count(*) from lessons) = 0, 'чужой автор не видит уроки');
select pg_temp.check((select count(*) from invites) = 0, 'чужой автор не видит инвайты');
update courses set title = 'взлом' where id = '10000000-0000-0000-0000-000000000001';
select pg_temp.check((select title from courses where id = '10000000-0000-0000-0000-000000000001') = 'Курс А', 'чужой автор не может изменить курс');
do $$ begin
  insert into courses (school_id, title) values ((select school_id from profiles where email='author@x.ru'), 'x');
  raise exception 'FAIL: вставка в чужую школу прошла';
exception when insufficient_privilege then raise notice 'ok  нельзя создать курс в чужой школе'; end $$;

-- Ученик 1 до записи
select pg_temp.login('00000000-0000-0000-0000-00000000000c');
select pg_temp.check((select count(*) from lessons) = 0, 'ученик без записи не видит уроки');
select pg_temp.check((select valid from invite_info('join-a')), 'invite_info показывает валидный инвайт');
do $$ begin
  insert into enrollments (course_id, user_id) values ('10000000-0000-0000-0000-000000000001', auth.uid());
  raise exception 'FAIL: ученик записал себя сам';
exception when insufficient_privilege then raise notice 'ok  ученик не может записать себя напрямую'; end $$;
do $$ begin
  perform enroll_free('10000000-0000-0000-0000-000000000001');
  raise exception 'FAIL: бесплатная запись на invite-курс прошла';
exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; raise notice 'ok  самозапись на invite-курс запрещена'; end $$;
select pg_temp.check(redeem_invite('join-a') = '10000000-0000-0000-0000-000000000001', 'ученик вступает по инвайту');
select pg_temp.check((select count(*) from lessons) = 2, 'после записи ученик видит уроки');
select pg_temp.check((select count(*) from profiles) = 2, 'ученик видит себя и автора курса');

-- Прогресс и ДЗ
do $$ begin
  insert into lesson_progress (user_id, course_id, lesson_id) values (auth.uid(), '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002');
  raise exception 'FAIL: ученик сам засчитал ДЗ';
exception when raise_exception then
  if sqlerrm like 'FAIL%' then raise; end if;
  raise notice 'ok  ученик не может сам засчитать урок-ДЗ';
end $$;
insert into lesson_progress (user_id, course_id, lesson_id) values (auth.uid(), '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001');
insert into homework (lesson_id, course_id, student_id, content, status, feedback)
  values ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', auth.uid(), 'мой ответ', 'approved', 'сам себе 5');
select pg_temp.check((select status from homework) = 'submitted' and (select feedback from homework) is null, 'ученик не может сам себе принять ДЗ');

-- Ученик 2: инвайт исчерпан, чужие данные не видны
select pg_temp.login('00000000-0000-0000-0000-00000000000d');
do $$ begin perform redeem_invite('join-a'); raise exception 'FAIL: лимит инвайта не сработал';
exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; raise notice 'ok  лимит использований инвайта'; end $$;
select pg_temp.check((select count(*) from homework) = 0, 'ученик 2 не видит чужие ДЗ');
select pg_temp.check((select count(*) from lesson_progress) = 0, 'ученик 2 не видит чужой прогресс');
select pg_temp.check((select count(*) from profiles) = 1, 'ученик 2 видит только себя');
do $$ begin
  insert into messages (from_id, to_id, content) values (auth.uid(), '00000000-0000-0000-0000-00000000000a', 'спам');
  raise exception 'FAIL: сообщение незнакомцу прошло';
exception when insufficient_privilege then raise notice 'ok  нельзя писать незнакомым пользователям'; end $$;
update profiles set role = 'author' where id = auth.uid();
select pg_temp.check((select role from profiles where id = auth.uid()) = 'student', 'пользователь не может сменить себе роль');

-- Автор проверяет ДЗ и видит ученика
select pg_temp.login('00000000-0000-0000-0000-00000000000a');
update homework set status = 'approved', feedback = 'Отлично', reviewer_id = auth.uid();
select pg_temp.check((select status from homework) = 'approved', 'автор принимает ДЗ');
select pg_temp.check((select count(*) from lesson_progress) = 2, 'принятое ДЗ засчитывает урок, автор видит прогресс');

-- Последовательный курс
update courses set sequential = true where id = '10000000-0000-0000-0000-000000000001';
insert into lessons (id, module_id, course_id, title, type, position) values
 ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Урок 3', 'text', 3),
 ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Урок 4', 'text', 4);
update lessons set position = 1 where id = '30000000-0000-0000-0000-000000000001';
update lessons set position = 2 where id = '30000000-0000-0000-0000-000000000002';
select pg_temp.check(enroll_by_email('10000000-0000-0000-0000-000000000001', 'ST2@x.ru') is not null, 'автор добавляет ученика по email');
insert into messages (from_id, to_id, content) values (auth.uid(), '00000000-0000-0000-0000-00000000000c', 'Привет');

-- Ученик 1 отвечает автору, не может изменить принятое ДЗ
select pg_temp.login('00000000-0000-0000-0000-00000000000c');
insert into messages (from_id, to_id, content) values (auth.uid(), '00000000-0000-0000-0000-00000000000a', 'Здравствуйте');
select pg_temp.check((select count(*) from messages) = 2, 'переписка ученика и автора');
do $$ begin update homework set content = 'подмена'; raise exception 'FAIL: принятое ДЗ изменено';
exception when raise_exception then
  if sqlerrm like 'FAIL%' then raise; end if;
  raise notice 'ok  принятое ДЗ нельзя изменить'; end $$;
do $$ begin
  insert into lesson_progress (user_id, course_id, lesson_id) values (auth.uid(), '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004');
  raise exception 'FAIL: урок 4 отмечен раньше урока 3';
exception when raise_exception then
  if sqlerrm like 'FAIL%' then raise; end if;
  raise notice 'ok  последовательный курс: нельзя перепрыгнуть урок';
end $$;
insert into lesson_progress (user_id, course_id, lesson_id) values (auth.uid(), '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003');
insert into lesson_progress (user_id, course_id, lesson_id) values (auth.uid(), '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004');
select pg_temp.check((select count(*) from lesson_progress where user_id = auth.uid()) = 4, 'последовательный курс: уроки по порядку отмечаются');

-- Аноним
select pg_temp.login(null);
set role anon;
select pg_temp.check((select count(*) from courses) = 1, 'аноним видит только опубликованный курс');
select pg_temp.check((select count(*) from lessons) = 0, 'аноним не видит уроки');
reset role;
\echo ALL RLS TESTS PASSED
