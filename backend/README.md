# Contact form backend (Google Apps Script)

The site is fully static. Form submissions are POSTed to a Google Apps Script
Web App that writes to a Google Sheet and emails `leviterestudio@gmail.com`.
Visitors never see Google Forms or Sheets.

## Deploy (once, ~5 minutes)

1. Sign in to Google with the account that should own the data (ideally the
   `leviterestudio@gmail.com` account).
2. Create a new Google Sheet, e.g. **Levitere — Enquiries**.
3. In the Sheet: **Extensions → Apps Script**. Delete the sample code, paste the
   whole content of [`Code.gs`](Code.gs), and save (name the project
   `levitere-contact`).
4. **Deploy → New deployment** → type **Web app**:
   - Description: `levitere contact v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorise the permissions it asks for (Sheets + send email
   as you), and copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`).
6. Sanity check: open that URL in a browser. You should see
   `{"ok":true,"service":"levitere-contact"}`.
7. In the website project, create `.env` (copy `.env.example`) and set:
   ```
   VITE_FORM_ENDPOINT=https://script.google.com/macros/s/.../exec
   ```
   Rebuild (`npm run build`). The URL is baked into the static build, so
   redeploy the site after changing it.

## Updating the script

Edit the code in the Apps Script editor, then **Deploy → Manage deployments →
Edit (pencil) → Version: New version → Deploy**. The URL stays the same.
Simply saving the code does not update the live web app.

## Behaviour

- Appends `Date | Name | Email | Message` to a sheet tab named `Enquiries`
  (created automatically with a bold header row).
- Sends an email to `NOTIFY_EMAIL` with `Reply-To` set to the visitor's address.
- Rejects requests without a name or with an invalid email (`{"ok":false,...}`).
- Input is trimmed and length-capped (name/email 200 chars, message 5000).
- Change the recipient or the tab name at the top of `Code.gs`.

## Notes

- The front end sends `Content-Type: text/plain` with a JSON body. That avoids a
  CORS preflight, which Apps Script web apps do not answer.
- Gmail quota for `MailApp` is 100 emails/day on a free account — plenty for a
  contact form.
- Without `VITE_FORM_ENDPOINT`, `npm run dev` uses a mock: the payload is logged
  to the browser console and the success state is shown, so the whole flow can be
  tested locally.
