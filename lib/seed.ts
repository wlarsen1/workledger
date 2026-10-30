import type { Entry, OriginalSummary } from "./tracking";
// Entirely fictional portfolio data, not the owner's work history.
export const SEED_ENTRIES: Entry[] = [
  {
    "id": "demo-001",
    "date": "2026-07-06",
    "kind": "work",
    "hours": 3,
    "rate": 25,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": null
  },
  {
    "id": "demo-002",
    "date": "2026-07-07",
    "kind": "work",
    "hours": 4,
    "rate": 35,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": null
  },
  {
    "id": "demo-003",
    "date": "2026-07-08",
    "kind": "work",
    "hours": 2,
    "rate": 55,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": null
  },
  {
    "id": "demo-004",
    "date": "2026-07-08",
    "kind": "qualifying",
    "hours": 1,
    "rate": null,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": null
  },
  {
    "id": "demo-005",
    "date": "2026-08-03",
    "kind": "work",
    "hours": 3,
    "rate": 28,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": null
  },
  {
    "id": "demo-006",
    "date": "2026-08-04",
    "kind": "work",
    "hours": 5,
    "rate": 40,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": null
  },
  {
    "id": "demo-007",
    "date": "2026-08-05",
    "kind": "work",
    "hours": 2,
    "rate": 60,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": null
  },
  {
    "id": "demo-008",
    "date": "2026-08-05",
    "kind": "qualifying",
    "hours": 1,
    "rate": null,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": null
  },
  {
    "id": "demo-009",
    "date": "2026-09-07",
    "kind": "work",
    "hours": 4,
    "rate": 25,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": null
  },
  {
    "id": "demo-010",
    "date": "2026-09-08",
    "kind": "work",
    "hours": 3,
    "rate": 35,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": null
  },
  {
    "id": "demo-011",
    "date": "2026-09-09",
    "kind": "work",
    "hours": 2,
    "rate": 55,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": null
  },
  {
    "id": "demo-012",
    "date": "2026-09-09",
    "kind": "qualifying",
    "hours": 1,
    "rate": null,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": null
  },
  {
    "id": "demo-013",
    "date": "2026-10-05",
    "kind": "work",
    "hours": 2,
    "rate": 25,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": 1
  },
  {
    "id": "demo-014",
    "date": "2026-10-06",
    "kind": "work",
    "hours": 3,
    "rate": 40,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": 1
  },
  {
    "id": "demo-015",
    "date": "2026-10-07",
    "kind": "work",
    "hours": 2,
    "rate": 55,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": 1
  },
  {
    "id": "demo-016",
    "date": "2026-10-08",
    "kind": "work",
    "hours": 2,
    "rate": null,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": 1
  },
  {
    "id": "demo-017",
    "date": "2026-10-09",
    "kind": "qualifying",
    "hours": 1,
    "rate": null,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": 1
  },
  {
    "id": "demo-018",
    "date": "2026-10-10",
    "kind": "qualifying",
    "hours": null,
    "rate": null,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": 1
  },
  {
    "id": "demo-019",
    "date": "2026-10-12",
    "kind": "work",
    "hours": 1,
    "rate": 35,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": null
  },
  {
    "id": "demo-020",
    "date": "2026-10-12",
    "kind": "work",
    "hours": 2,
    "rate": 55,
    "approximate": false,
    "note": "Fictional example",
    "sourceWeek": null
  },
  {
    "id": "demo-prior-year",
    "date": "2025-10-06",
    "kind": "work",
    "hours": 3,
    "rate": 25,
    "approximate": false,
    "note": "Fictional prior-year record",
    "sourceWeek": null
  }
];
export const ORIGINAL_SUMMARIES: OriginalSummary[] = [{week:1,worked:10,qualifying:1,qualifyingAtLeast:false,note:"Fictional summary with a deliberate discrepancy"}];
