import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
const path = resolve(process.env.WORKLEDGER_DB_PATH || "data/workledger.sqlite");
mkdirSync(dirname(path), { recursive: true });
let sql: DatabaseSync | undefined;
function connection(): DatabaseSync {
 if (sql) return sql;
 sql = new DatabaseSync(path);
 sql.exec("PRAGMA busy_timeout=5000");
 sql.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS tracker_state(user_id TEXT PRIMARY KEY, initialized_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS work_entries(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,date TEXT NOT NULL,kind TEXT NOT NULL,hours REAL,rate REAL,approximate INTEGER DEFAULT 0 NOT NULL,note TEXT DEFAULT '' NOT NULL,source_week INTEGER,updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS entries_user_date_idx ON work_entries(user_id,date);`);
 return sql;
}
class Prepared {
 constructor(readonly query: string, readonly values: SQLInputValue[] = []) {}
 bind(...values: SQLInputValue[]) { return new Prepared(this.query, values); }
 async first<T = Record<string, unknown>>(): Promise<T | null> { return (connection().prepare(this.query).get(...this.values) as T) ?? null; }
 async all() { return { results: connection().prepare(this.query).all(...this.values) }; }
 runSync() { const r = connection().prepare(this.query).run(...this.values); return { success: true, meta: { changes: Number(r.changes) } }; }
 async run() { return this.runSync(); }
}
export const env = { DB: {
 prepare(query: string) { return new Prepared(query); },
 async batch(statements: Prepared[]) {
  const db = connection();
  db.exec("BEGIN IMMEDIATE");
  try { const results = []; for (const statement of statements) results.push(statement.runSync()); db.exec("COMMIT"); return results; }
  catch (error) { db.exec("ROLLBACK"); throw error; }
 }
} };
