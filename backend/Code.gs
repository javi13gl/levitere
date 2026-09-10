/**
 * Levitere contact form backend — Google Apps Script Web App.
 *
 * Receives a JSON POST from the website, appends a row to the bound Google Sheet
 * and emails a notification. Deploy as: Web app, Execute as "Me",
 * Who has access "Anyone". See backend/README.md.
 */

var SHEET_NAME = 'Enquiries';
var NOTIFY_EMAIL = 'leviterestudio@gmail.com';
var MAX_LEN = { name: 200, email: 200, message: 5000 };

function doPost(e) {
  try {
    var body = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var data = JSON.parse(body);

    var name = clean(data.name, MAX_LEN.name);
    var email = clean(data.email, MAX_LEN.email);
    var message = clean(data.message, MAX_LEN.message);

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return json({ ok: false, error: 'Name and a valid email are required.' });
    }

    var now = new Date();
    appendRow_([now, name, email, message]);
    notify_(name, email, message, now);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

/** Health check: open the web app URL in a browser. */
function doGet() {
  return json({ ok: true, service: 'levitere-contact' });
}

function appendRow_(row) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Date', 'Name', 'Email', 'Message']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
  }
  sheet.appendRow(row);
}

function notify_(name, email, message, when) {
  var tz = Session.getScriptTimeZone();
  var stamp = Utilities.formatDate(when, tz, 'yyyy-MM-dd HH:mm');
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: email,
    subject: 'New enquiry from ' + name,
    body:
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Date: ' + stamp + '\n\n' +
      (message || '(no message)') + '\n',
  });
}

function clean(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
