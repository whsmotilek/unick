export interface WaitlistPayload {
  name: string;
  email: string;
  projectDescription: string;
  submittedAt: string;
}

const ENDPOINT = import.meta.env.VITE_WAITLIST_ENDPOINT as string | undefined;

/**
 * Отправка заявки в Google Apps Script Web App, который пишет строку в таблицу.
 * Content-Type намеренно text/plain — это позволяет избежать CORS preflight,
 * который Apps Script не обрабатывает корректно. На стороне Apps Script
 * тело читается из e.postData.contents и парсится как JSON.
 *
 * Если ENDPOINT не задан или fetch упал — возвращаем false, чтобы вызвавший
 * код мог продолжить (данные останутся в localStorage как резерв).
 */
export async function submitToWaitlistSheet(payload: WaitlistPayload): Promise<boolean> {
  if (!ENDPOINT) return false;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });
    if (!res.ok) return false;
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return json.ok === true;
    } catch {
      return true;
    }
  } catch (err) {
    if (import.meta.env.DEV) console.error('Waitlist submit failed:', err);
    return false;
  }
}
