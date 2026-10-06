-- Лимиты хранилища на стороне сервера (интерфейс проверяет то же самое, но обойти его легко)
update storage.buckets set
  file_size_limit = 5 * 1024 * 1024,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
where id = 'covers';

update storage.buckets set
  file_size_limit = 50 * 1024 * 1024,
  allowed_mime_types = null   -- материалы урока: видео, PDF, презентации, архивы
where id = 'lesson-files';

update storage.buckets set
  file_size_limit = 20 * 1024 * 1024,
  allowed_mime_types = null   -- ответы учеников: фото, документы, архивы
where id = 'homework-files';

-- Исполняемый контент в хранилище не нужен: запрещаем загрузку HTML/SVG/JS,
-- чтобы через публичные ссылки нельзя было разместить фишинговую страницу на нашем домене
create or replace function public.block_active_content() returns trigger
language plpgsql as $$
begin
  if lower(coalesce(new.metadata->>'mimetype', '')) in ('text/html', 'image/svg+xml', 'application/javascript', 'text/javascript', 'application/xhtml+xml')
     or lower(new.name) ~ '\.(html?|svg|js|mjs|xhtml)$' then
    raise exception 'Этот тип файла нельзя загрузить';
  end if;
  return new;
end $$;

drop trigger if exists storage_block_active_content on storage.objects;
create trigger storage_block_active_content before insert or update on storage.objects
  for each row execute function public.block_active_content();
