-- Проверка прав доступа. Запуск: psql -v ON_ERROR_STOP=1 -f stub_supabase.sql -f ../migrations/*.sql -f rls_test.sql
\set QUIET on
create or replace function pg_temp.login(p uuid) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', coalesce(p::text, ''), false); end $$;
create or replace function pg_temp.check(cond boolean, msg text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'FAIL: %', msg; end if; raise notice 'ok  %', msg; end $$;

-- Пользователи создаются через auth.users -> триггер
insert into auth.users (id, email, raw_user_meta_data) values
 ('00000000-0000-0000-0000-00000000000a', 'author@x.ru',  '{"name":"Автор","role":"author"}'),
 ('00000000-0000-0000-0000-00000000000b', 'author2@x.ru', '{"name":"Чужой автор","role":"author"}'),
 ('00000000-0000-0000-0000-00000000000c', 'st1@x.ru',     '{"name":"Ученик 1","role":"student"}'),
 ('00000000-0000-0000-0000-00000000000d', 'st2@x.ru',     '{"name":"Ученик 2","role":"admin"}');

select pg_temp.check((select role from profiles where email='st2@x.ru') = 'student', 'роль admin из метаданных не принимается');
select pg_temp.check((select school_id from profiles where email='author@x.ru') is not null, 'у автора создаётся школа');

-- ===== Модерация авторов =====
insert into auth.users (id, email, raw_user_meta_data) values
 ('00000000-0000-0000-0000-0000000000ad', 'admin@x.ru', '{"name":"Админ","role":"student"}');
update profiles set role = 'admin' where email = 'admin@x.ru';
insert into auth.users (id, email, raw_user_meta_data) values
 ('00000000-0000-0000-0000-00000000000e', 'newauthor@x.ru', '{"name":"Новый автор","role":"author"}');
select pg_temp.check((select author_status from profiles where email='newauthor@x.ru') = 'pending', 'новый автор ждёт одобрения');
select pg_temp.check((select count(*) from notifications where type='author_pending' and user_id='00000000-0000-0000-0000-0000000000ad') = 1, 'админ получил уведомление о заявке');
-- авторы a и b для остальных тестов одобрены сразу
update profiles set author_status = 'approved' where email in ('author@x.ru', 'author2@x.ru');

set role authenticated;
select pg_temp.login('00000000-0000-0000-0000-00000000000e');
do $$ begin
  insert into courses (school_id, title) values (my_school_id(), 'До одобрения');
  raise exception 'FAIL: неодобренный автор создал курс';
exception when insufficient_privilege then raise notice 'ok  неодобренный автор не может создать курс'; end $$;
update profiles set author_status = 'approved' where id = auth.uid();
select pg_temp.check((select author_status from profiles where id = auth.uid()) = 'pending', 'автор не может сам себя одобрить');
do $$ begin perform set_author_status(auth.uid(), 'approved'); raise exception 'FAIL: автор вызвал set_author_status';
exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; raise notice 'ok  одобрять может только админ'; end $$;

select pg_temp.login('00000000-0000-0000-0000-0000000000ad');
select set_author_status('00000000-0000-0000-0000-00000000000e', 'approved');
select pg_temp.login('00000000-0000-0000-0000-00000000000e');
insert into courses (school_id, title) values (my_school_id(), 'После одобрения');
select pg_temp.check((select count(*) from courses where title = 'После одобрения') = 1, 'после одобрения автор создаёт курс');
select pg_temp.check((select count(*) from notifications where type = 'author_status') = 1, 'автору пришло уведомление об одобрении');
delete from courses where title = 'После одобрения';
select pg_temp.login(null);
reset role;

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
-- Создание с RETURNING (так работает API): черновик и курс по приглашению
do $$ declare v uuid; begin
  insert into courses (school_id, title, status, access_type) values (my_school_id(), 'Черновик с returning', 'draft', 'invite') returning id into v;
  if v is null then raise exception 'FAIL: insert returning'; end if;
  insert into courses (id, school_id, title) values (v, my_school_id(), 'Upsert-черновик')
    on conflict (id) do update set title = excluded.title;
  delete from courses where id = v;
  raise notice 'ok  автор создаёт черновик через INSERT RETURNING и upsert';
end $$;

-- Чужой автор
select pg_temp.login('00000000-0000-0000-0000-00000000000b');
select pg_temp.check((select count(*) from courses) = 0, 'чужой автор не видит курс по приглашению');
select pg_temp.check((select count(*) from lessons) = 0, 'чужой автор не видит уроки');
select pg_temp.check((select count(*) from invites) = 0, 'чужой автор не видит инвайты');
update courses set title = 'взлом' where id = '10000000-0000-0000-0000-000000000001';
reset role;
select pg_temp.check((select title from courses where id = '10000000-0000-0000-0000-000000000001') = 'Курс А', 'чужой автор не может изменить курс');
set role authenticated;
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

-- ===== Тесты с проверкой на сервере =====
select pg_temp.login('00000000-0000-0000-0000-00000000000a');
update courses set sequential = false where id = '10000000-0000-0000-0000-000000000001';
insert into lessons (id, module_id, course_id, title, type, position, content) values
 ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Тест', 'quiz', 5,
  '{"questions":[{"id":"q1","text":"2+2","options":[{"id":"a","text":"4"},{"id":"b","text":"5"}],"correct":["a"]},{"id":"q2","text":"Цвета","options":[{"id":"r","text":"красный"},{"id":"g","text":"зелёный"},{"id":"s","text":"стол"}],"correct":["r","g"]}]}');
insert into quiz_keys (lesson_id, course_id, answers, pass_percent) values
 ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '{"q1":["a"],"q2":["r","g"]}', 100);
select pg_temp.check((select content->'questions'->0 ? 'correct' from lessons where id = '30000000-0000-0000-0000-000000000005') = false, 'правильные ответы вырезаются из урока');
select pg_temp.check((select count(*) from notifications where type = 'student_enrolled') = 2, 'автору пришли уведомления о новых учениках');
select pg_temp.check((select count(*) from notifications where type = 'homework_submitted') = 1, 'автору пришло уведомление о сданном ДЗ');

select pg_temp.login('00000000-0000-0000-0000-00000000000c');
select pg_temp.check((select count(*) from quiz_keys) = 0, 'ученик не видит ключи теста');
do $$ begin
  insert into lesson_progress (user_id, course_id, lesson_id) values (auth.uid(), '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005');
  raise exception 'FAIL: ученик сам засчитал тест';
exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; raise notice 'ok  тест нельзя засчитать в обход проверки'; end $$;
select pg_temp.check(
  (select (r->>'passed')::boolean = false and r->'key' = 'null'::jsonb and r->'wrong' = '["q2"]'::jsonb
   from (select submit_quiz('30000000-0000-0000-0000-000000000005', '{"q1":["a"],"q2":["r"]}') r) t),
  'неверный ответ: тест не пройден, ключ не раскрыт, видно ошибочный вопрос');
select pg_temp.check(not exists (select 1 from lesson_progress where lesson_id = '30000000-0000-0000-0000-000000000005'), 'непройденный тест не засчитан');
select pg_temp.check(
  (select (r->>'passed')::boolean and r->'key' is not null from (select submit_quiz('30000000-0000-0000-0000-000000000005', '{"q1":["a"],"q2":["g","r"]}') r) t),
  'верный ответ: тест пройден');
select pg_temp.check(exists (select 1 from lesson_progress where lesson_id = '30000000-0000-0000-0000-000000000005' and user_id = auth.uid()), 'пройденный тест засчитан');
select pg_temp.check((select count(*) from quiz_attempts) = 2, 'попытки сохраняются');
select pg_temp.check((select count(*) from notifications where type = 'homework_reviewed') = 1, 'ученику пришло уведомление о проверке ДЗ');
select pg_temp.check((select count(*) from notifications where type = 'message') = 1, 'ученику пришло уведомление о сообщении');
select pg_temp.check((select count(*) from notifications where type in ('student_enrolled','homework_submitted')) = 0, 'ученик не видит чужие уведомления');

select pg_temp.login('00000000-0000-0000-0000-00000000000b');
do $$ begin perform submit_quiz('30000000-0000-0000-0000-000000000005', '{}');
  raise exception 'FAIL: тест сдан без доступа к курсу';
exception when raise_exception then if sqlerrm like 'FAIL%' then raise; end if; raise notice 'ok  нельзя сдать тест чужого курса'; end $$;

-- Аноним
select pg_temp.login(null);
set role anon;
select pg_temp.check((select count(*) from courses) = 0, 'аноним не видит курс по приглашению');
reset role;
update courses set access_type = 'free' where id = '10000000-0000-0000-0000-000000000001';
set role anon;
select pg_temp.check((select count(*) from courses) = 1, 'аноним видит опубликованный курс со свободной записью');
select pg_temp.check((select count(*) from modules) = 1, 'аноним видит программу свободного курса');
select pg_temp.check((select count(*) from lessons) = 0, 'аноним не видит уроки');
reset role;
\echo ALL RLS TESTS PASSED
