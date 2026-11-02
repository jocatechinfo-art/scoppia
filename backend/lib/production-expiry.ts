/** Three calendar months; clamp to the last valid day of the target month. */
export function productionExpiry(day:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return '';
 const base=new Date(day+'T12:00:00Z');if(!Number.isFinite(base.getTime())||base.toISOString().slice(0,10)!==day)return '';
 const wanted=base.getUTCDate();base.setUTCDate(1);base.setUTCMonth(base.getUTCMonth()+3);
 const last=new Date(base.getTime());last.setUTCMonth(last.getUTCMonth()+1);last.setUTCDate(0);
 base.setUTCDate(Math.min(wanted,last.getUTCDate()));return base.toISOString().slice(0,10);
}
