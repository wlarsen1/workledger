import { getLocalUser } from "../../local-user";
import { allEntries, database, failure, sameOrigin } from "../../../lib/store";
export const dynamic="force-dynamic";
export async function PATCH(request:Request){
  const user=await getLocalUser();if(!user)return failure(new Error("Please sign in to update rates."),401);
  if(!sameOrigin(request))return failure(new Error("Invalid request origin."),403);
  try{
    const body=await request.json() as {rate?:unknown;ids?:unknown};const rate=body?.rate;const ids=body?.ids;
    if(typeof rate!=="number"||!Number.isFinite(rate)||rate<0||rate>100000||Math.abs(rate*100-Math.round(rate*100))>.00001)throw new Error("Enter a valid hourly rate with no more than two decimal places.");
    if(!Array.isArray(ids)||!ids.length||ids.length>1000||ids.some(id=>typeof id!=="string"||id.length>250))throw new Error("Select the entries to update.");
    const unique=[...new Set(ids)] as string[];const db=database();const now=new Date().toISOString();
    const results=await db.batch(unique.map(id=>db.prepare("UPDATE work_entries SET rate=?,approximate=0,updated_at=? WHERE id=? AND user_id=? AND kind='work' AND rate IS NULL").bind(rate,now,id,user.userId)));
    return Response.json({entries:await allEntries(user.userId),updated:results.reduce((sum,r)=>sum+r.meta.changes,0)},{headers:{"Cache-Control":"no-store"}});
  }catch(error){return failure(error);}
}
