import { env } from "./sqlite";
import { SEED_ENTRIES } from "./seed";
import type { Entry } from "./tracking";

export function database() {if(!env.DB)throw new Error("Saved storage is unavailable. Please try again.");return env.DB;}
export async function initialize(userId: string) {
  const db=database();
  if(await db.prepare("SELECT user_id FROM tracker_state WHERE user_id = ?").bind(userId).first())return;
  const now=new Date().toISOString();const statements=[];
  for(let i=0;i<SEED_ENTRIES.length;i+=8){
    const chunk=SEED_ENTRIES.slice(i,i+8);
    statements.push(db.prepare(`INSERT OR IGNORE INTO work_entries (id,user_id,date,kind,hours,rate,approximate,note,source_week,updated_at) VALUES ${chunk.map(()=>"(?,?,?,?,?,?,?,?,?,?)").join(",")}`).bind(...chunk.flatMap(e=>[`${userId}:${e.id}`,userId,e.date,e.kind,e.hours,e.rate,e.approximate?1:0,e.note,e.sourceWeek,now])));
  }
  statements.push(db.prepare("INSERT OR IGNORE INTO tracker_state (user_id,initialized_at) VALUES (?,?)").bind(userId,now));
  await db.batch(statements);
}
export async function allEntries(userId:string):Promise<Entry[]> {
  const result=await database().prepare("SELECT id,date,kind,hours,rate,approximate,note,source_week FROM work_entries WHERE user_id = ? ORDER BY date DESC,id ASC").bind(userId).all();
  return result.results.map(r=>({id:String(r.id),date:String(r.date),kind:r.kind as Entry["kind"],hours:r.hours===null?null:Number(r.hours),rate:r.rate===null?null:Number(r.rate),approximate:!!r.approximate,note:String(r.note),sourceWeek:r.source_week===null?null:Number(r.source_week)}));
}
export function sameOrigin(request:Request) {
  const origin=request.headers.get("origin");
  if (!origin || request.headers.get("content-type")?.split(";")[0] !== "application/json") return false;
  try { const source = new URL(origin); const target = new URL(request.url);
    return ["http:", "https:"].includes(source.protocol) && source.host === (request.headers.get("host") || target.host);
  } catch { return false; }
}
export function failure(error:unknown,status=400) {return Response.json({error:error instanceof Error?error.message:"Something went wrong. Please try again."},{status,headers:{"Cache-Control":"no-store"}});}
