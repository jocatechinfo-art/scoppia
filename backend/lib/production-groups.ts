import type {ProductionRow} from './production';
export type ProductionFlavor<T extends ProductionRow>={key:string,name:string,description:string,personalized:boolean,rows:T[],qty:number};
export function groupProductionFlavors<T extends ProductionRow>(rows:T[]):ProductionFlavor<T>[]{
 const groups=new Map<string,ProductionFlavor<T>>();
 for(const row of rows){let id=row.key;try{const parts=JSON.parse(row.key);if(Array.isArray(parts)&&typeof parts[0]==='string')id=parts[0]}catch{/* Retain the full key if a legacy row is not JSON. */}
  const key=JSON.stringify([id,row.description,row.personalized]);const group=groups.get(key);
  if(group){group.rows.push(row);group.qty+=row.qty}else groups.set(key,{key,name:row.name,description:row.description,personalized:row.personalized,rows:[row],qty:row.qty});
 }
 return [...groups.values()].sort((a,b)=>Number(a.personalized)-Number(b.personalized)||a.name.localeCompare(b.name,'pt-BR')||a.description.localeCompare(b.description,'pt-BR')).map(g=>({...g,rows:g.rows.sort((a,b)=>a.size.localeCompare(b.size,'pt-BR',{numeric:true}))}));
}
export function productionSizeTone(size:string){return /^200\s*g$/i.test(size.trim())?'small':/^300\s*g$/i.test(size.trim())?'medium':/^400\s*g$/i.test(size.trim())?'large':'other'}
