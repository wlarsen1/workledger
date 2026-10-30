# Workledger — Hours & Earnings

A work-hours tracker developed by Weston Larsen with AI assistance. Turn a handwritten time log into daily, weekly, monthly, and yearly stacked charts, then keep recording hours and hourly rates in one place.

This standalone portfolio edition preserves the original tracker's interface and calculation rules, uses **entirely fictional sample data**, and runs on a local SQLite database. It needs no ChatGPT account, API key, paid AI service, or Cloudflare account.

## Run it

Install Node.js **22.13 or newer** (Node 24 recommended), then run:

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. For a production build:

```sh
npm run build
npm start
```

The first load inserts sample records once. Saved changes survive restarts. Entries are stored in `data/workledger.sqlite`; database files are excluded from Git. To reset the demo, stop the server and remove `data/` before restarting. To choose another database location, set `WORKLEDGER_DB_PATH`.

## Features

- Daily, weekly (Sunday–Saturday), monthly, and yearly stacked bar charts
- Gray: qualifying time; blue: $20–29.99/hr; red: $30–49.99/hr; yellow: $50+/hr
- Work without an exact rate appears in blue, while earnings remain unknown
- Below-$20 rates remain visible as a separate patterned category
- Log dates, hours, exact hourly rates, approximate rates, and notes
- Split one day into multiple entries with different rates
- Edit/delete entries, filter and search records, drill into chart periods
- CSV export and bulk assignment of missing hourly rates
- Import review flags missing durations, missing rates, estimates, and weekly discrepancies
- Qualifying time is counted separately from paid work

Recorded earnings only include hours with a known rate. Approximate rates are flagged, and qualifying time does not generate earnings. The sample contains an unknown rate, an unknown qualifying duration, and an intentionally mismatched weekly total so these paths can be explored.

## Why I built it

I was recording hours and pay rates in notes. Some days included multiple hourly rates, other entries contained unpaid qualifying time, and weekly summaries did not always match daily records. I wanted an easier way to understand when I worked, at which rates, and how my hours changed over time.

## How I used AI

I supplied the original time log and described the desired charts, rate categories, and entry fields. I used ChatGPT and Sites to turn those requirements into a working application, then refined the behavior through follow-up instructions—for example, assigning unrated work to the blue category without inventing exact pay.

AI generated the implementation and helped organize the data, identify ambiguities, and verify calculation and persistence paths. My contribution was identifying the problem, supplying requirements and source records, and directing refinements. This is an **AI-assisted project**, not a claim that I independently wrote every line of code or trained a model. The application itself is a conventional tracker and does not call an AI model at runtime.

For this portable edition, ChatGPT adapted the original Sites application to standard Next.js and SQLite, substituted fictional records, and prepared documentation and automated verification.

## Technical design

- Next.js App Router, React, TypeScript, Tailwind CSS, Lucide icons
- Custom SVG stacked charts and reusable calculation functions in `lib/tracking.ts`
- API routes for loading, creating, editing, deleting, and assigning rates
- SQLite persistence via Node's built-in `node:sqlite`
- One-time seeding and transaction-based writes
- Validation for calendar dates, hourly rates, note lengths, and daily hour limits
- Same-origin checks for browser writes

The original private Sites edition uses ChatGPT identity and Cloudflare D1 with per-user ownership checks. This local edition deliberately uses one fixed local owner instead. It has **no login or user isolation for multiple visitors**: everyone reaching the same running instance sees the same data. The provided commands bind to loopback. Add real authentication, authorization, deployment configuration, and persistent storage before exposing it publicly. GitHub stores the source; it does not itself run this SQLite server app through GitHub Pages.

## Verification

```sh
npm test
npm run typecheck
npm run build
```

The automated suite tests sample totals, time aggregation, rate boundaries, dates, validation, SQLite insert/update/split/delete/reload behavior, bulk rate changes, ownership conditions in the API routes, and request-origin protection. API-route tests use an in-memory SQLite adapter and a mocked identity; they are not an end-to-end login test.

## Main files

| Path | Purpose |
| --- | --- |
| `app/tracker.tsx` | Dashboard, charts, entry editor, and CSV export |
| `lib/tracking.ts` | Calculations, grouping, rate bands, validation |
| `lib/seed.ts` | Fictional sample entries and weekly summary |
| `lib/sqlite.ts` | Local database setup and adapter |
| `lib/store.ts` | One-time seeding and record loading |
| `app/api/` | Entry and rate API routes |
| `tests/verify.mjs` | Calculation and persistence verification |

No original personal work history, live database, Site credentials, or private deployment identifiers are included.

Validation note: this edition was built and tested using dependencies already installed in the development environment. A fresh dependency download could not be verified in that environment because network access to the package registry was unavailable. No visual browser testing was performed for this edition.
