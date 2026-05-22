// Apps Script для приёма заявок из waitlist-формы Unick.
//
// Установка:
// 1. Открыть таблицу https://docs.google.com/spreadsheets/d/1q39YXUSzI3OQFsEmBlPDQmxO2RzHjgfUb8u1f1ctszQ/edit
// 2. Extensions → Apps Script
// 3. Заменить содержимое Code.gs этим файлом
// 4. Save (диск)
// 5. Deploy → New deployment → выбрать "Web app"
//    - Description: "Unick waitlist endpoint"
//    - Execute as: Me (your account)
//    - Who has access: Anyone
// 6. Скопировать выданный URL вида https://script.google.com/macros/s/AKfycb.../exec
// 7. В GitHub: Settings → Secrets and variables → Actions → New repository secret
//    Name: WAITLIST_ENDPOINT
//    Value: <URL из шага 6>
// 8. Перезапустить workflow Deploy to GitHub Pages (или сделать любой коммит в main).
//
// При каждом деплое или изменении кода Apps Script нужно нажимать Deploy → Manage deployments → "Edit"
// и выбирать "New version", иначе клиенты будут стучаться в старую версию.

const SHEET_ID = '1q39YXUSzI3OQFsEmBlPDQmxO2RzHjgfUb8u1f1ctszQ';
const SHEET_NAME = 'Waitlist'; // имя листа; будет создан, если отсутствует

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: 'empty body' });
    }
    const body = JSON.parse(e.postData.contents);

    // Минимальная валидация
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const projectDescription = String(body.projectDescription || '').trim();
    const submittedAt = String(body.submittedAt || new Date().toISOString());

    if (!name || !email || !projectDescription) {
      return jsonResponse({ ok: false, error: 'missing fields' });
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Submitted At', 'Name', 'Email', 'Project Description', 'Source']);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(submittedAt),
      name,
      email,
      projectDescription,
      'landing-popup'
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// Для проверки развёртывания: открыть URL в браузере вернёт {ok:true,alive:true}.
function doGet() {
  return jsonResponse({ ok: true, alive: true });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
