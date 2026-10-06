import { test as base, expect, type Page } from '@playwright/test';

/**
 * Общий `test`: каждый тест получает новый browser context (пустой localStorage — приложение
 * само сеет демо-данные), а все запросы не к локальному dev-серверу блокируются, чтобы
 * встроенные YouTube-плееры и внешние шрифты не делали прогон медленным и нестабильным.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route(
      url => url.hostname !== 'localhost' && url.hostname !== '127.0.0.1',
      route => route.abort(),
    );
    await use(context);
  },
});

export { expect };

let counter = 0;
/** Уникальный email в пределах прогона (тесты идут параллельно, но контексты изолированы). */
export function uniqueEmail(prefix: string): string {
  counter += 1;
  return `${prefix}.${Date.now().toString(36)}${counter}${Math.random().toString(36).slice(2, 6)}@e2e.test`;
}

/** Сбросить демо-сессию. Следующий page.goto загрузит приложение без пользователя. */
export async function clearSession(page: Page) {
  if (!page.url().startsWith('http')) return; // about:blank — сессии ещё нет
  await page.evaluate(() => localStorage.removeItem('unick_auth_user'));
}

/** Вход через форму: в демо-режиме пароль не проверяется. */
export async function loginAs(page: Page, email: string, next?: string) {
  await clearSession(page);
  await page.goto(next ? `login?next=${encodeURIComponent(next)}` : 'login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Пароль').fill('e2e-password');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
}

type DemoDb = {
  courses: { id: string; title: string }[];
  lessons: { id: string; courseId: string; title: string }[];
};

/** Прочитать id курса/уроков из демо-БД в localStorage. */
export async function readDemoDb(page: Page): Promise<DemoDb> {
  return page.evaluate(() => JSON.parse(localStorage.getItem('unick_demo_db_v2') || '{}'));
}

export async function lessonIdByTitle(page: Page, courseId: string, title: string): Promise<string> {
  const db = await readDemoDb(page);
  const lesson = db.lessons.find(l => l.courseId === courseId && l.title === title);
  if (!lesson) throw new Error(`Урок «${title}» не найден в демо-БД`);
  return lesson.id;
}
