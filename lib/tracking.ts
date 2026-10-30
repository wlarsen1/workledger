export type Entry = {
  id: string; date: string; kind: "work" | "qualifying"; hours: number | null;
  rate: number | null; approximate: boolean; note: string; sourceWeek: number | null;
};
export type OriginalSummary = { week: number; worked: number | null; qualifying: number | null; qualifyingAtLeast: boolean; note: string };
export type Period = "day" | "week" | "month" | "year";
export type Band = "qualifying" | "blue" | "red" | "yellow" | "other";
export const BANDS: {key: Band; label: string; color: string}[] = [
  {key:"qualifying",label:"Qualifying",color:"#9ca3ad"},
  {key:"blue",label:"$20–29.99/hr",color:"#508ee1"},
  {key:"red",label:"$30–49.99/hr",color:"#e7766b"},
  {key:"yellow",label:"$50+/hr",color:"#e8bc4d"},
  {key:"other",label:"Below $20/hr",color:"url(#unrated-hatch)"},
];
export const round = (n: number) => Math.round((n + Number.EPSILON) * 10000) / 10000;
export const number = (n: number) => new Intl.NumberFormat("en-US",{maximumFractionDigits:2}).format(n);
export const money = (n: number) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(n);
export function band(e: Entry): Band {
  if(e.kind === "qualifying") return "qualifying";
  // Work with no exact rate belongs to the user's $20–29.99/hour range.
  if(e.rate === null) return "blue";
  if(e.rate < 20) return "other";
  if(e.rate < 30) return "blue";
  if(e.rate < 50) return "red";
  return "yellow";
}
export const needsReview = (e: Entry) => e.hours === null || (e.kind === "work" && e.rate === null) || e.approximate;
export const dateObject = (s: string) => new Date(s + "T00:00:00Z");
export const iso = (d: Date) => d.toISOString().slice(0,10);
export function addDays(s: string,n: number) {const d=dateObject(s);d.setUTCDate(d.getUTCDate()+n);return iso(d);}
export function weekStart(s: string) {return addDays(s,-dateObject(s).getUTCDay());}
export function shortDate(s: string) {return dateObject(s).toLocaleDateString("en-US",{month:"short",day:"numeric",timeZone:"UTC"});}
export function longDate(s: string) {return dateObject(s).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric",timeZone:"UTC"});}
export function today() {return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Denver",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());}
export function summarize(entries: Entry[]) {
  let worked=0,qualifying=0,earnings=0,unrated=0,rated=0,estimated=0,unmeasured=0;
  const totals: Record<Band,number>={qualifying:0,blue:0,red:0,yellow:0,other:0};
  for(const e of entries){
    const h=e.hours??0;totals[band(e)]+=h;
    if(e.hours===null) unmeasured++;
    if(e.kind==="qualifying") qualifying+=h;
    else {worked+=h;if(e.rate===null) unrated+=h;else {rated+=h;earnings+=h*e.rate;if(e.approximate) estimated+=h;}}
  }
  return {worked:round(worked),qualifying:round(qualifying),earnings:round(earnings),unrated:round(unrated),rated:round(rated),estimated:round(estimated),unmeasured,totals:Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,round(v)])) as Record<Band,number>};
}
export type ChartGroup = {key:string;label:string;fullLabel:string;start:string;end:string;total:number;qualifying:number;blue:number;red:number;yellow:number;other:number;entries:Entry[]};
export function aggregate(entries: Entry[],period: Period,year: number,month: number): ChartGroup[] {
  const filtered=entries.filter(e=>period==="year" || e.date.startsWith(String(year)));
  const groups=new Map<string,ChartGroup>();
  function add(key:string,start:string,end:string,label:string,fullLabel:string){if(!groups.has(key))groups.set(key,{key,start,end,label,fullLabel,total:0,qualifying:0,blue:0,red:0,yellow:0,other:0,entries:[]});}
  if(period==="day"){
    const last=new Date(Date.UTC(year,month,0)).getUTCDate();
    for(let d=1;d<=last;d++){const s=`${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;add(s,s,s,String(d),longDate(s));}
  }else if(period==="month"){
    for(let m=1;m<=12;m++){const s=`${year}-${String(m).padStart(2,"0")}-01`;const end=iso(new Date(Date.UTC(year,m,0)));const label=dateObject(s).toLocaleDateString("en-US",{month:"short",timeZone:"UTC"});add(s.slice(0,7),s,end,label,`${label} ${year}`);}
  }else if(period==="week"){
    const dates=filtered.map(e=>e.date).sort();
    if(dates.length){const end=weekStart(dates.at(-1)!);for(let s=weekStart(dates[0]);s<=end;s=addDays(s,7))add(s,s,addDays(s,6),shortDate(s),`${shortDate(s)} – ${shortDate(addDays(s,6))}, ${year}`);}
  }else{
    const years=[...new Set(entries.map(e=>e.date.slice(0,4)))].sort();
    for(const y of years)add(y,`${y}-01-01`,`${y}-12-31`,y,y);
  }
  for(const e of filtered){
    const key=period==="day"?e.date:period==="week"?weekStart(e.date):period==="month"?e.date.slice(0,7):e.date.slice(0,4);
    const g=groups.get(key);if(!g)continue;
    g[band(e)]=round(g[band(e)]+(e.hours??0));g.total=round(g.total+(e.hours??0));g.entries.push(e);
  }
  return [...groups.values()].sort((a,b)=>a.key.localeCompare(b.key));
}
export function importAudit(entries: Entry[],summaries: OriginalSummary[]) {
  return summaries.filter(s=>s.worked!==null).map(s=>{
    const calculated=round(entries.filter(e=>e.sourceWeek===s.week&&e.kind==="work").reduce((sum,e)=>sum+(e.hours??0),0));
    return {...s,calculated,difference:round(calculated-s.worked!)};
  }).filter(s=>Math.abs(s.difference)>.0001);
}
export function validDate(value: unknown): value is string {
  if(typeof value!=="string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const d=dateObject(value);return Number.isFinite(d.getTime())&&iso(d)===value&&Number(value.slice(0,4))>=1900&&Number(value.slice(0,4))<=2200;
}
export function validateEntry(value: unknown,allowUnknownHours=false): Omit<Entry,"id"|"sourceWeek"> {
  if(!value || typeof value!=="object")throw new Error("Enter a valid work entry.");
  const v=value as Record<string,unknown>;
  if(!validDate(v.date))throw new Error("Choose a valid date.");
  if(v.kind!=="work"&&v.kind!=="qualifying")throw new Error("Choose worked or qualifying hours.");
  const hours=v.hours;
  if(!(allowUnknownHours&&v.kind==="qualifying"&&hours===null)&&(typeof hours!=="number"||!Number.isFinite(hours)||hours<=0||hours>24))throw new Error("Hours must be greater than 0 and no more than 24.");
  const rate=v.kind==="qualifying"?null:v.rate;
  if(rate!==null&&(typeof rate!=="number"||!Number.isFinite(rate)||rate<0||rate>100000||Math.abs(rate*100-Math.round(rate*100))>.00001))throw new Error("Enter a valid hourly rate with no more than two decimal places.");
  if(typeof v.note!=="string"||v.note.length>2000)throw new Error("Notes must be no more than 2,000 characters.");
  return {date:v.date,kind:v.kind,hours:hours as number|null,rate:rate as number|null,approximate:v.kind==="work"&&rate!==null&&v.approximate===true,note:v.note.trim()};
}
