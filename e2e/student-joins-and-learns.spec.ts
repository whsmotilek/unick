import { test, expect, lessonIdByTitle } from './fixtures';
import { COURSE, joinByInvite, newStudent, setupAuthorWithCourse, studyAndSubmitHomework } from './flows';

test('ученик вступает по приглашению, проходит видео и сдаёт домашку; следующий урок закрыт', async ({ page }) => {
  // Подготовка курса автором — на десктопной ширине (кабинет автора не цель мобильного прогона)
  const viewport = page.viewportSize();
  await page.setViewportSize({ width: 1280, height: 800 });
  const { courseId, inviteCode } = await setupAuthorWithCourse(page, { sequential: true });
  if (viewport) await page.setViewportSize(viewport);

  const student = newStudent();
  await joinByInvite(page, inviteCode, student, courseId);

  // Программа курса: всё, кроме первого урока, закрыто
  await expect(page.getByText('Пройдено 0 из 3 уроков')).toBeVisible();

  await studyAndSubmitHomework(page, 'Сделал три заливки: ровную, градиентную и по-сырому.');

  // Прямой переход на следующий урок — он закрыт, пока домашку не примут
  const finalId = await lessonIdByTitle(page, courseId, COURSE.final.title);
  await page.goto(`student/courses/${courseId}/lesson/${finalId}`);
  await expect(page.getByText('Урок пока закрыт')).toBeVisible();
  await expect(page.getByText(COURSE.final.text)).toHaveCount(0);

  // Прогресс: 1 из 3 (видео), домашка на проверке
  await page.goto(`student/courses/${courseId}`);
  await expect(page.getByText('Пройдено 1 из 3 уроков')).toBeVisible();
  await expect(page.getByRole('link', { name: /Первое задание/ })).toContainText('На проверке');
});
