# Weatherbound — Field Telemetry Dashboard

Authenticated web dashboard for temperature + humidity from ESP32 field stations.

- **Next.js 14** (App Router, TypeScript) — app, API, and branded UI in one project
- **Postgres** — stores readings
- **Chart.js** — dual-axis time-series (temperature left, humidity right)
- **Auth** — email/password login, signed HttpOnly session cookie (`jose` + `bcrypt`)
- **Ingest** — one API endpoint the ESP32 POSTs to, guarded by a shared API key

## Architecture

```
ESP32  ──HTTPS POST /api/ingest (X-API-Key)──►  Next.js  ──►  Postgres
browser ──login──► /  (session cookie) ──fetch /api/readings──►  charts
```

The device auths with an **API key**; humans auth with a **login session**. Two
different trust models, deliberately separate — a leaked device key can write
readings but can't view the dashboard, and vice versa.

## Run it (Docker)

```bash
cp .env.example .env
# fill in SESSION_SECRET and INGEST_KEY:
openssl rand -base64 32   # paste into SESSION_SECRET
openssl rand -base64 32   # paste into INGEST_KEY
# set SEED_PASSWORD to whatever you want your login password to be

docker compose up -d --build          # starts db (auto-creates tables) + app
docker compose --profile seed run --rm seed   # creates your login + demo data
```

Open <http://localhost:3000>, log in with `SEED_EMAIL` / `SEED_PASSWORD`.
You'll see two demo stations with 3 days of data. Real ESP32 readings show up
alongside them; delete the demo rows once your device is posting.

To reset everything: `docker compose down -v` (the `-v` wipes the Postgres volume).

## Dev mode (no Docker for the app)

```bash
docker compose up -d db          # just Postgres
npm install
# .env needs DATABASE_URL=postgres://wb:<DB_PASSWORD>@localhost:5432/weatherbound
npm run seed
npm run dev                      # http://localhost:3000
```

## Sending data from the ESP32

POST JSON to `/api/ingest` with your `INGEST_KEY` in the `X-API-Key` header:

```json
{ "station": "field-01", "temp_c": 21.4, "humidity": 63.0 }
```

WiFi (`HTTPClient`) example:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

const char* URL = "https://data.weatherbound.com/api/ingest";
const char* API_KEY = "the-same-string-as-INGEST_KEY";

void sendReading(const char* station, float tempC, float humidity) {
  WiFiClientSecure client;
  client.setInsecure();  // fine behind a real TLS cert; pin later if you want
  HTTPClient http;
  http.begin(client, URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);

  char body[128];
  snprintf(body, sizeof(body),
    "{\"station\":\"%s\",\"temp_c\":%.2f,\"humidity\":%.1f}",
    station, tempC, humidity);

  int code = http.POST(body);
  Serial.printf("ingest -> %d\n", code);   // expect 200
  http.end();
}
```

For the LTE stations, it's the same URL and JSON over the EG800K QHTTP path:
`QHTTPURL` = the ingest URL, a `QHTTPCFG="requestheader"` carrying the API key,
then `QHTTPPOST` of the body.

Quick test from your laptop:

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "X-API-Key: <your INGEST_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"station":"field-01","temp_c":21.4,"humidity":63}'
```

## Reaching it from anywhere

`localhost:3000` is LAN-only. Your LTE stations (and you, off-site) need a public
address. Cleanest option, no router changes, free TLS:

```bash
cloudflared tunnel --url http://localhost:3000     # quick test, random URL
```

For a stable `data.weatherbound.com`, create a named tunnel and point the
subdomain at it via your DNS (Swizzonic, in Weatherbound's case) — the marketing
site on Webflow stays untouched. Then the ESP32 URL becomes
`https://data.weatherbound.com/api/ingest` and you drop the `setInsecure()`.

## Notes

- **Adding users:** re-run the seed with different `SEED_EMAIL`/`SEED_PASSWORD`,
  or insert a row into `users` with a bcrypt hash. There's no public sign-up by
  design (internal tool).
- **Swapping in Auth.js later:** the session layer is isolated in
  `src/lib/session.ts` + `src/lib/auth.ts`. If you ever want Google/SSO, replace
  those two files with Auth.js and leave the rest of the app as-is.
- **Station picker** is automatic — any `station` value your devices send shows
  up in the dropdown.
