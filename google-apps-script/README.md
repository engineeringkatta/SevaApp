# SevaConnect — Google Apps Script backend

This folder contains a simple backend you can deploy as a **Google Apps Script Web App**. It stores data in **Google Sheets** (one tab per entity) and exposes JSON endpoints for:

- `people`
- `sevas`
- `schedule`

## Setup (one-time)

1. Create a new Apps Script project: **script.new**
2. Copy these files into the Apps Script editor:
   - `appsscript.json`
   - `Utils.gs`
   - `Sheets.gs`
   - `Router.gs`
3. In Apps Script: **Project Settings → Script Properties**, set:
   - **`SPREADSHEET_ID`**: *(leave empty for now)* or set an existing Google Sheet ID
   - **`API_TOKEN`**: a random string (recommended; required for POST writes when set)
4. Run `init()` from the editor once.
   - If `SPREADSHEET_ID` was empty, `init()` creates a new sheet and stores its id into script properties.

## Deploy

1. **Deploy → New deployment → Web app**
2. **Execute as**: `User deploying`
3. **Who has access**: `Anyone` (or your org’s preference)
4. Copy the deployment URL that ends with `/exec` (this is your base URL).

## API

### GET

- **Health**
  - `GET <BASE_URL>?resource=health`
- **List people**
  - `GET <BASE_URL>?resource=people`
- **List sevas**
  - `GET <BASE_URL>?resource=sevas`
- **List schedule** (optional range filter)
  - `GET <BASE_URL>?resource=schedule&from=YYYY-MM-DD&to=YYYY-MM-DD`

### POST (writes)

If you set `API_TOKEN`, include it as `token` in the JSON body (or query string).

**Important (browser CORS)**: to avoid preflight issues, send POST with `Content-Type: text/plain` and a JSON-string body.

Example:

```js
await fetch(BASE_URL + "?resource=people&action=create", {
  method: "POST",
  headers: { "Content-Type": "text/plain;charset=utf-8" },
  body: JSON.stringify({
    token: API_TOKEN,
    fullName: "Asha Patel",
    email: "asha@example.com",
    mobile: "+1 555 0100",
    preferredChannel: "WHATSAPP",
    active: true
  })
}).then(r => r.json());
```

Supported actions:

- **People** (`resource=people`)
  - `action=create` body: `{ fullName, email, mobile, preferredChannel, active }`
  - `action=update` body: `{ id, ...patch }`
  - `action=delete` body: `{ id }`
- **Sevas** (`resource=sevas`)
  - `action=create` body: `{ name, description, defaultDurationMinutes, defaultStartTime, color }`
  - `action=update` body: `{ id, ...patch }`
  - `action=delete` body: `{ id }`
- **Schedule** (`resource=schedule`)
  - `action=createMany` body: `{ entries: ScheduleEntry[] }`
  - `action=updateStatus` body: `{ id, status }`
  - `action=update` body: `{ id, ...patch }`
  - `action=delete` body: `{ id }`

## JSONP (optional)

If you can’t call the web app via `fetch` due to CORS, you can use JSONP for GET endpoints:

- `GET <BASE_URL>?resource=people&callback=handlePeople`

