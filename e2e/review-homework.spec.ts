import { test, expect, loginAs, clearSession, lessonIdByTitle } from './fixtures';
import { COURSE, joinByInvite, newStudent, setupAuthorWithCourse, studyAndSubmitHomework } from './flows';

test('автор принимает домашку, ученик видит «Принято» и ответ, урок засчитан', async ({ page }) => {
  const { author, courseId, inviteCode } = await setupAuthorWithCourse(page, { sequential: true });
  const student = newStudent();
  const answer = 'Мой ответ на первое задание.';
  const feedback = 'Отличные заливки, переходите к следующему уроку!';

  await joinByInvite(page, inviteCode, student, courseId);
  await studyAndSubmitHomework(page, answer);
  const homeworkUrl = page.url();

  // Автор проверяет работу
  await loginAs(page, author.email);
  await expect(page).toHaveURL(/\/author$/);
  await page.getByRole('link', { name: 'Домашки', exact: true }).first().click();
  await expect(page).toHaveURL(/\/author\/homework$/);
  await page.getByText(COURSE.homework.title).click();
  const dialog = page.getByRole('dialog', { name: COURSE.homework.title });
  await expect(dialog.getByText(answer)).toBeVisible();
  await expect(dialog.getByText(COURSE.homework.text)).toBeVisible();
  // TODO(a11y): подпись «Обратная связь» не связана с полем — ищем по placeholder
  await dialog.getByPlaceholder('Напишите комментарий или замечания...').fill(feedback);
  await dialog.getByRole('button', { name: 'Принять' }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole('button', { name: 'Проверенные' }).click();
  await expect(page.getByText(COURSE.homework.title)).toBeVisible();
  await expect(page.getByText('Принято')).toBeVisible();

  // Ученик видит результат
  await clearSession(page);
  await loginAs(page, student.email);
  await expect(page).toHaveURL(/\/student/);
  await page.goto(new URL(homeworkUrl).pathname.replace(/^\/unick\//, ''));
  await expect(page.getByRole('heading', { name: COURSE.homework.title, level: 1 })).toBeVisible();
  await expect(page.getByText('Принято')).toBeVisible();
  await expect(page.getByText(feedback)).toBeVisible();
  await expect(page.getByText('Пройдено', { exact: true })).toBeVisible();
  await expect(page.getByPlaceholder('Ваш ответ…')).toHaveCount(0);

  // Домашка засчитана: прогресс 2 из 3, следующий урок открыт
  await page.goto(`student/courses/${courseId}`);
  await expect(page.getByText('Пройдено 2 из 3 уроков')).toBeVisible();
  await expect(page.getByRole('link', { name: /Первое задание/ })).toContainText('Принято');
  const finalId = await lessonIdByTitle(page, courseId, COURSE.final.title);
  await page.goto(`student/courses/${courseId}/lesson/${finalId}`);
  await expect(page.getByRole('heading', { name: COURSE.final.title, level: 1 })).toBeVisible();
  await expect(page.getByText(COURSE.final.text)).toBeVisible();
  await expect(page.getByText('Урок пока закрыт')).toHaveCount(0);
});
