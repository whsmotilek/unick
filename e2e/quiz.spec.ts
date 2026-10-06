import { test, expect, clearSession, lessonIdByTitle, readDemoDb } from './fixtures';
import { buildCourse, joinByInvite, newAuthor, newStudent, registerAuthor } from './flows';

const QUIZ = {
  title: 'Проверка знаний',
  q1: { text: 'Какой цвет получится из синего и жёлтого?', right: 'Зелёный', wrong: 'Красный' },
  q2: { text: 'Какие из этих цветов тёплые?', options: ['Синий', 'Оранжевый', 'Жёлтый'], right: ['Оранжевый', 'Жёлтый'] },
};

test('тест: ответы проверяются без раскрытия ключа, после прохождения урок засчитан', async ({ page }) => {
  const author = newAuthor();
  await registerAuthor(page, author);
  const { courseId, inviteCode } = await buildCourse(page, { sequential: false });

  // Автор добавляет тест из двух вопросов (второй — с несколькими ответами)
  await page.getByRole('tab', { name: 'Содержимое' }).click();
  await page.getByRole('button', { name: 'Добавить урок' }).click();
  const dialog = page.getByRole('dialog', { name: 'Новый урок' });
  await dialog.getByLabel('Название').fill(QUIZ.title);
  await dialog.getByLabel('Тип урока').click();
  await page.getByRole('option', { name: 'Тест' }).click();

  await dialog.getByRole('button', { name: 'Добавить вопрос' }).click();
  await dialog.getByPlaceholder('Текст вопроса').nth(0).fill(QUIZ.q1.text);
  await dialog.getByPlaceholder('Вариант 1').nth(0).fill(QUIZ.q1.right); // первый вариант правильный по умолчанию
  await dialog.getByPlaceholder('Вариант 2').nth(0).fill(QUIZ.q1.wrong);

  await dialog.getByRole('button', { name: 'Добавить вопрос' }).click();
  await dialog.getByPlaceholder('Текст вопроса').nth(1).fill(QUIZ.q2.text);
  await dialog.getByRole('button', { name: 'Вариант', exact: true }).nth(1).click();
  await dialog.getByPlaceholder('Вариант 1').nth(1).fill(QUIZ.q2.options[0]);
  await dialog.getByPlaceholder('Вариант 2').nth(1).fill(QUIZ.q2.options[1]);
  await dialog.getByPlaceholder('Вариант 3').nth(0).fill(QUIZ.q2.options[2]);
  // Во втором вопросе: снять отметку с варианта 1, отметить 2 и 3. Кнопки-отметки идут перед полями вариантов.
  const marks = dialog.locator('button[title="Правильный ответ"], button[title="Отметить правильным"]');
  await marks.nth(2).click();
  await marks.nth(3).click();
  await marks.nth(4).click();
  await dialog.getByRole('button', { name: 'Добавить урок' }).click();
  await expect(dialog).toBeHidden();

  // Ответы не хранятся в содержимом урока — только в отдельном ключе
  const db = await readDemoDb(page);
  const lesson = db.lessons.find(l => l.title === QUIZ.title)!;
  const stored = JSON.stringify(lesson.content);
  expect(stored).not.toContain('"correct"');
  expect(stored).toContain('"multiple":true');

  await clearSession(page);
  await joinByInvite(page, inviteCode, newStudent(), courseId);
  const quizId = await lessonIdByTitle(page, courseId, QUIZ.title);
  await page.goto(`student/courses/${courseId}/lesson/${quizId}`);
  await expect(page.getByRole('heading', { name: QUIZ.title })).toBeVisible();
  await expect(page.getByText('несколько ответов')).toBeVisible();

  // Попытка с ошибкой: ключ не раскрывается
  await page.getByRole('button', { name: QUIZ.q1.wrong }).click();
  await page.getByRole('button', { name: QUIZ.q2.right[0] }).click();
  await page.getByRole('button', { name: QUIZ.q2.right[1] }).click();
  await page.getByRole('button', { name: 'Проверить ответы' }).click();
  await expect(page.getByText(/Пока не получилось — 1 из 2/)).toBeVisible();
  await expect(page.getByText('Пройдено', { exact: true })).toHaveCount(0);

  // Повторная попытка без ошибок
  await page.getByRole('button', { name: 'Пройти заново' }).click();
  await page.getByRole('button', { name: QUIZ.q1.right }).click();
  await page.getByRole('button', { name: QUIZ.q2.right[0] }).click();
  await page.getByRole('button', { name: QUIZ.q2.right[1] }).click();
  await page.getByRole('button', { name: 'Проверить ответы' }).click();
  await expect(page.getByText(/Тест пройден! — 2 из 2/)).toBeVisible();
  await expect(page.getByText('Пройдено', { exact: true })).toBeVisible();
});
