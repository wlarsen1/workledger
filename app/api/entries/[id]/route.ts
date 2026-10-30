import { getLocalUser } from "../../../local-user";
import { allEntries, database, failure, sameOrigin } from "../../../../lib/store";
import { validateEntry } from "../../../../lib/tracking";
export const dynamic="force-dynamic";
type Context={params:Promise<{id:string}>};
export async function PATCH(request:Request,context:Context){
  const user=await getLocalUser();if(!user)return failure(new Error("Please sign in to edit entries."),401);
  if(!sameOrigin(request))return failure(new Error("Invalid request origin."),403);
  try{
    const {id}=await context.params;const db=database();
    const original=await db.prepare("SELECT id,hours,source_week FROM work_entries WHERE id=? AND user_id=?").bind(id,user.userId).first();
    if(!original)return failure(new Error("That entry was not found."),404);
    const body=await request.json() as {entries?:unknown};const inputs=body?.entries??[body];
    if(!Array.isArray(inputs)||inputs.length<1||inputs.length>24)throw new Error("Add between 1 and 24 entries at a time.");
    const values=inputs.map((input:unknown,i:number)=>validateEntry(input,i===0&&original.hours===null));
    const perDay=new Map<string,number>();for(const v of values)perDay.set(v.date,(perDay.get(v.date)??0)+(v.hours??0));
    for(const [date,hours] of perDay){const row=await db.prepare("SELECT COALESCE(SUM(hours),0) AS hours FROM work_entries WHERE user_id=? AND date=? AND id<>?").bind(user.userId,date,id).first<{hours:number}>();if(hours+(row?.hours??0)>24.00001)throw new Error("A day cannot contain more than 24 tracked hours.");}
    const v=values[0];const now=new Date().toISOString();
    const statements=[db.prepare("UPDATE work_entries SET date=?,kind=?,hours=?,rate=?,approximate=?,note=?,updated_at=? WHERE id=? AND user_id=?").bind(v.date,v.kind,v.hours,v.rate,v.approximate?1:0,v.note,now,id,user.userId)];
    for(const extra of values.slice(1))statements.push(db.prepare("INSERT INTO work_entries (id,user_id,date,kind,hours,rate,approximate,note,source_week,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),user.userId,extra.date,extra.kind,extra.hours,extra.rate,extra.approximate?1:0,extra.note,original.source_week as number|null,now));
    await db.batch(statements);
    return Response.json({entries:await allEntries(user.userId)},{headers:{"Cache-Control":"no-store"}});
  }catch(error){return failure(error);}
}
export async function DELETE(request:Request,context:Context){
  const user=await getLocalUser();if(!user)return failure(new Error("Please sign in to delete entries."),401);
  if(!sameOrigin(request))return failure(new Error("Invalid request origin."),403);
  try{const {id}=await context.params;const result=await database().prepare("DELETE FROM work_entries WHERE id=? AND user_id=?").bind(id,user.userId).run();if(result.meta.changes===0)return failure(new Error("That entry was not found."),404);return Response.json({entries:await allEntries(user.userId)},{headers:{"Cache-Control":"no-store"}});}catch(error){return failure(error);}
}
