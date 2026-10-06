import { test, expect, clearSession, lessonIdByTitle, loginAs } from './fixtures';
import { COURSE, newStudent, registerStudentOnPage, setupAuthorWithCourse } from './flows';

test('ученик без записи на курс не видит урок по прямой ссылке', async ({ page }) => {
  const viewport = page.viewportSize();
  await page.setViewportSize({ width: 1280, height: 800 });
  const { courseId } = await setupAuthorWithCourse(page, { sequential: false });
  if (viewport) await page.setViewportSize(viewport);
  const videoId = await lessonIdByTitle(page, courseId, COURSE.video.title);

  await page.goto('register');
  await registerStudentOnPage(page, newStudent());
  await expect(page).toHaveURL(/\/student$/);

  await page.goto(`student/courses/${courseId}/lesson/${videoId}`);
  await expect(page).not.toHaveURL(new RegExp(`/lesson/${videoId}`));
  await expect(page).toHaveURL(/\/student\/catalog$/);
  await expect(page.getByRole('heading', { name: COURSE.video.title, level: 1 })).toHaveCount(0);
  await expect(page.locator(`iframe[title="${COURSE.video.title}"]`)).toHaveCount(0);

  // Обзор курса тоже закрыт
  await page.goto(`student/courses/${courseId}`);
  await expect(page).toHaveURL(/\/student\/catalog$/);
});

test('гость на /author уходит на /login?next=...', async ({ page }) => {
  await page.goto('author/courses');
  await expect(page).toHaveURL(/\/unick\/login\?next=%2Fauthor%2Fcourses$/);
  await expect(page.getByRole('button', { name: 'Войти', exact: true })).toBeVisible();
});

test('после входа по ?next=... возвращает на исходную страницу', async ({ page }) => {
  await page.goto('student/progress');
  await expect(page).toHaveURL(/\/login\?next=%2Fstudent%2Fprogress$/);
  await page.getByRole('link', { name: 'Зарегистрироваться' }).click();
  await registerStudentOnPage(page, newStudent());
  await expect(page).toHaveURL(/\/student\/progress$/);
});

test('перезагрузка на глубоком маршруте не даёт пустую страницу', async ({ page }) => {
  const viewport = page.viewportSize();
  await page.setViewportSize({ width: 1280, height: 800 });
  const { author, courseId } = await setupAuthorWithCourse(page, { sequential: false });
  if (viewport) await page.setViewportSize(viewport);

  // Автор: редактор курса
  await loginAs(page, author.email);
  await expect(page).toHaveURL(/\/author$/);
  await page.goto(`author/courses/${courseId}?tab=content`);
  await expect(page.getByText(COURSE.module)).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(new RegExp(`/author/courses/${courseId}`));
  await expect(page.getByText(COURSE.module)).toBeVisible();
  await expect(page.getByText(COURSE.video.title)).toBeVisible();

  // Неизвестный маршрут — 404, а не пустой экран
  await clearSession(page);
  await page.goto('no/such/page');
  await expect(page.getByText('Страница не найдена')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Страница не найдена')).toBeVisible();
});
