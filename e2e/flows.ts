import type { Page } from '@playwright/test';
import { expect, uniqueEmail, clearSession } from './fixtures';

export const COURSE = {
  title: 'Акварель для начинающих (e2e)',
  description: 'Пять уроков: материалы, заливки, первые пейзажи.',
  module: 'Введение',
  video: { title: 'Знакомство с курсом', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s', id: 'dQw4w9WgXcQ' },
  homework: { title: 'Первое задание', text: 'Нарисуйте три заливки и пришлите описание.' },
  final: { title: 'Итоги модуля', text: 'Что мы прошли в первом модуле.' },
};

export interface Person { name: string; email: string }

export function newAuthor(): Person {
  return { name: 'Анна Автор', email: uniqueEmail('author') };
}

export function newStudent(): Person {
  return { name: 'Пётр Ученик', email: uniqueEmail('student') };
}

/** Регистрация автора на /register?role=author. Заканчивается на пустом дашборде /author. */
export async function registerAuthor(page: Page, author: Person) {
  await page.goto('register?role=author');
  await expect(page.getByRole('tab', { name: 'Я автор' })).toHaveAttribute('data-state', 'active');
  const form = page.getByRole('tabpanel', { name: 'Я автор' });
  await form.getByLabel('Имя и фамилия').fill(author.name);
  await form.getByLabel('Email').fill(author.email);
  await form.getByLabel('Пароль').fill('e2e-password');
  await form.getByRole('checkbox').check();
  await form.getByRole('button', { name: 'Создать аккаунт автора' }).click();
  await expect(page).toHaveURL(/\/unick\/author$/);
}

/** Регистрация ученика (вкладка по умолчанию или единственная форма при входе по приглашению). */
export async function registerStudentOnPage(page: Page, student: Person) {
  await page.getByLabel('Имя и фамилия').fill(student.name);
  await page.getByLabel('Email').fill(student.email);
  await page.getByLabel('Пароль').fill('e2e-password');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Создать аккаунт', exact: true }).click();
}

async function pickOption(page: Page, combobox: ReturnType<Page['getByRole']>, option: string | RegExp) {
  await combobox.click();
  await page.getByRole('option', { name: option }).click();
}

/** Новый урок в развёрнутом модуле. Диалог «Новый урок». */
async function openNewLessonDialog(page: Page) {
  await page.getByRole('button', { name: 'Добавить урок' }).click();
  const dialog = page.getByRole('dialog', { name: 'Новый урок' });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function typeInEditor(dialog: ReturnType<Page['getByRole']>, text: string) {
  const editor = dialog.locator('.ProseMirror');
  await editor.click();
  await editor.pressSequentially(text);
  await expect(editor).toContainText(text);
}

export interface BuiltCourse {
  courseId: string;
  inviteUrl: string;
  inviteCode: string;
}

/**
 * Журнал 1: автор создаёт курс «по порядку» с модулем, видео-уроком, домашним заданием и
 * текстовым уроком, публикует его и создаёт ссылку-приглашение.
 * Ожидается, что автор уже вошёл и находится в кабинете.
 */
export async function buildCourse(page: Page, opts: { sequential?: boolean } = {}): Promise<BuiltCourse> {
  const { sequential = true } = opts;

  await page.getByRole('link', { name: 'Курсы', exact: true }).first().click();
  await expect(page).toHaveURL(/\/author\/courses$/);
  await page.getByRole('link', { name: 'Создать курс' }).first().click();
  await expect(page).toHaveURL(/\/author\/courses\/new/);

  // Настройки
  await page.getByLabel('Название курса').fill(COURSE.title);
  await page.getByLabel('Описание').fill(COURSE.description);
  if (sequential) {
    // TODO(a11y): у переключателя «Уроки по порядку» нет доступного имени — ищем единственный switch на вкладке
    const sw = page.getByRole('tabpanel', { name: 'Настройки' }).getByRole('switch');
    await sw.click();
    await expect(sw).toHaveAttribute('data-state', 'checked');
  }
  await pickOption(page, page.getByRole('combobox').filter({ hasText: 'Черновик' }), /Опубликован/);
  await expect(page.getByRole('combobox').filter({ hasText: 'Опубликован' })).toBeVisible();
  await page.getByRole('button', { name: 'Создать курс' }).click();

  await expect(page).toHaveURL(/\/author\/courses\/[^/?]+\?tab=content/);
  const courseId = new URL(page.url()).pathname.split('/').pop()!;

  // Модуль
  await page.getByRole('button', { name: 'Добавить модуль' }).first().click();
  const moduleDialog = page.getByRole('dialog');
  await moduleDialog.getByLabel('Название').fill(COURSE.module);
  await moduleDialog.getByRole('button', { name: 'Добавить' }).click();
  await expect(moduleDialog).toBeHidden();
  await expect(page.getByText(COURSE.module)).toBeVisible();

  // Видео-урок: ссылка youtube.com/watch → предпросмотр с /embed/
  let dialog = await openNewLessonDialog(page);
  await dialog.getByLabel('Название').fill(COURSE.video.title);
  await expect(dialog.getByRole('combobox')).toContainText('Видео');
  await dialog.getByPlaceholder(/Ссылка на YouTube/).fill(COURSE.video.url);
  const preview = dialog.locator(`iframe[title="${COURSE.video.title}"]`);
  await expect(preview).toHaveAttribute('src', `https://www.youtube.com/embed/${COURSE.video.id}`);
  await dialog.getByRole('button', { name: 'Добавить урок' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: new RegExp(COURSE.video.title) })).toBeVisible();

  // Домашнее задание
  dialog = await openNewLessonDialog(page);
  await dialog.getByLabel('Название').fill(COURSE.homework.title);
  await pickOption(page, dialog.getByRole('combobox'), 'Домашнее задание');
  await typeInEditor(dialog, COURSE.homework.text);
  await dialog.getByRole('button', { name: 'Добавить урок' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: new RegExp(COURSE.homework.title) })).toBeVisible();

  // Текстовый урок после домашки — закрыт, пока домашку не примут
  dialog = await openNewLessonDialog(page);
  await dialog.getByLabel('Название').fill(COURSE.final.title);
  await pickOption(page, dialog.getByRole('combobox'), 'Текст');
  await typeInEditor(dialog, COURSE.final.text);
  await dialog.getByRole('button', { name: 'Добавить урок' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: new RegExp(COURSE.final.title) })).toBeVisible();

  // Ученики и доступ → ссылка-приглашение
  await page.getByRole('tab', { name: 'Ученики и доступ' }).click();
  await page.getByRole('button', { name: 'Создать ссылку' }).click();
  const link = page.getByRole('tabpanel', { name: 'Ученики и доступ' }).getByText(/\/join\/[0-9a-f]+$/);
  await expect(link).toBeVisible();
  const inviteUrl = (await link.textContent())!.trim();
  const inviteCode = inviteUrl.split('/join/')[1];
  expect(inviteUrl).toMatch(/^http:\/\/localhost:\d+\/unick\/join\/[0-9a-f]{12}$/);

  return { courseId, inviteUrl, inviteCode };
}

/** Автор регистрируется и собирает курс, затем выходит. Возвращает данные курса. */
export async function setupAuthorWithCourse(page: Page, opts?: { sequential?: boolean }) {
  const author = newAuthor();
  await registerAuthor(page, author);
  const course = await buildCourse(page, opts);
  await clearSession(page);
  return { author, ...course };
}

/** Ученик заходит по ссылке-приглашению без аккаунта и регистрируется. Заканчивается на обзоре курса. */
export async function joinByInvite(page: Page, inviteCode: string, student: Person, courseId: string) {
  await page.goto(`join/${inviteCode}`);
  await expect(page.getByRole('heading', { name: COURSE.title })).toBeVisible();
  await page.getByRole('link', { name: 'Зарегистрироваться и начать' }).click();
  await expect(page).toHaveURL(/\/register\?next=/);
  // По приглашению — только форма ученика, без вкладки «Я автор»
  await expect(page.getByRole('tab', { name: 'Я автор' })).toHaveCount(0);
  await registerStudentOnPage(page, student);
  await expect(page).toHaveURL(new RegExp(`/student/courses/${courseId}$`));
  await expect(page.getByRole('heading', { name: COURSE.title })).toBeVisible();
}

/** Ученик проходит видео-урок и сдаёт домашку. Заканчивается на странице домашки. */
export async function studyAndSubmitHomework(page: Page, answer: string) {
  await page.getByRole('link', { name: /Начать обучение/ }).click();
  await expect(page.getByRole('heading', { name: COURSE.video.title, level: 1 })).toBeVisible();
  await expect(page.locator(`iframe[title="${COURSE.video.title}"]`)).toHaveAttribute('src', /youtube\.com\/embed\//);
  await page.getByRole('button', { name: 'Пройдено, дальше' }).click();

  await expect(page.getByRole('heading', { name: COURSE.homework.title, level: 1 })).toBeVisible();
  await expect(page.getByText(COURSE.homework.text)).toBeVisible();
  await page.getByPlaceholder('Ваш ответ…').fill(answer);
  await page.getByRole('button', { name: 'Отправить на проверку' }).click();
  await expect(page.getByText('На проверке').first()).toBeVisible();
  await expect(page.getByText(answer)).toBeVisible();
}
