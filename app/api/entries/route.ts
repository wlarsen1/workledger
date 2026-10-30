import { getLocalUser } from "../../local-user";
import { allEntries, database, failure, initialize, sameOrigin } from "../../../lib/store";
import { validateEntry } from "../../../lib/tracking";
import { ORIGINAL_SUMMARIES } from "../../../lib/seed";
export const dynamic="force-dynamic";
export async function GET(){
  const user=await getLocalUser();if(!user)return failure(new Error("Please sign in to load your work log."),401);
  try{await initialize(user.userId);return Response.json({entries:await allEntries(user.userId),summaries:ORIGINAL_SUMMARIES},{headers:{"Cache-Control":"no-store"}});}catch(error){console.error("Load failed",error);return failure(new Error("Your work log could not be loaded. Please try again."),500);}
}
export async function POST(request:Request){
  const user=await getLocalUser();if(!user)return failure(new Error("Please sign in to save entries."),401);
  if(!sameOrigin(request))return failure(new Error("Invalid request origin."),403);
  try{
    const body=await request.json() as {entries?:unknown};const inputs=body?.entries;
    if(!Array.isArray(inputs)||inputs.length<1||inputs.length>24)throw new Error("Add between 1 and 24 entries at a time.");
    const values=inputs.map((v:unknown)=>validateEntry(v));
    const db=database();await initialize(user.userId);const perDay=new Map<string,number>();
    for(const v of values)perDay.set(v.date,(perDay.get(v.date)??0)+(v.hours??0));
    for(const [date,hours] of perDay){const row=await db.prepare("SELECT COALESCE(SUM(hours),0) AS hours FROM work_entries WHERE user_id=? AND date=?").bind(user.userId,date).first<{hours:number}>();if(hours+(row?.hours??0)>24.00001)throw new Error("A day cannot contain more than 24 tracked hours.");}
    const now=new Date().toISOString();
    await db.batch(values.map(v=>db.prepare("INSERT INTO work_entries (id,user_id,date,kind,hours,rate,approximate,note,source_week,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),user.userId,v.date,v.kind,v.hours,v.rate,v.approximate?1:0,v.note,null,now)));
    return Response.json({entries:await allEntries(user.userId)},{status:201,headers:{"Cache-Control":"no-store"}});
  }catch(error){return failure(error);}
}
