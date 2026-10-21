-- Видео уроков загружаются в платформу частями (Tus, по 6 МБ), поэтому лимит файла урока — 2 ГБ.
-- Обложки и файлы ДЗ — прежние лимиты (0005).
update storage.buckets set file_size_limit = 2048::bigint * 1024 * 1024 where id = 'lesson-files';
