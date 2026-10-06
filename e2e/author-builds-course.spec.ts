import { test, expect } from './fixtures';
import { buildCourse, newAuthor, registerAuthor, COURSE } from './flows';

test('автор регистрируется, собирает курс и создаёт ссылку-приглашение', async ({ page }) => {
  const author = newAuthor();
  await registerAuthor(page, author);

  // Новый автор видит пустой кабинет без курсов чужой (демо) школы
  await expect(page.getByRole('heading', { name: 'Быстрые действия' })).toBeVisible();
  await expect(page.getByText('Основы UI/UX дизайна')).toHaveCount(0);
  await page.getByRole('link', { name: 'Курсы', exact: true }).first().click();
  await expect(page.getByText('У вас пока нет курсов')).toBeVisible();
  await expect(page.getByText('Основы UI/UX дизайна')).toHaveCount(0);
  await page.getByRole('link', { name: 'Главная', exact: true }).first().click();

  const { courseId, inviteUrl } = await buildCourse(page);
  expect(courseId).toBeTruthy();
  expect(inviteUrl).toContain('/unick/join/');

  // Курс виден в списке курсов автора как опубликованный
  await page.getByRole('link', { name: 'Курсы', exact: true }).first().click();
  await expect(page.getByText(COURSE.title)).toBeVisible();
});
