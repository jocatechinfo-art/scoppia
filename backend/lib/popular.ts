import {sql} from 'drizzle-orm';
import {getDb} from '@/db';
import {catalogSnapshot,mealCategories} from './catalog';

// Aggregate immutable order snapshots. A whole combo multiplies its flavor quantities.
export const popularitySql=sql`WITH accepted AS (
 SELECT CASE WHEN json_valid(items) THEN items ELSE '[]' END AS items
 FROM orders WHERE deleted_at IS NULL AND status IN ('confirmado','em_producao','pronto','saiu_entrega','entregue')
), objects AS (
 SELECT CASE WHEN j.type='object' THEN j.value ELSE '{}' END AS item
 FROM accepted, json_each(accepted.items) j
), lines AS (
 SELECT CAST(json_extract(item,'$.id') AS TEXT) AS id,
 CASE WHEN json_type(item,'$.qty')='integer' AND json_extract(item,'$.qty')>0
 THEN json_extract(item,'$.qty') ELSE 0 END AS qty,
 CASE WHEN json_type(item,'$.flavors')='array' THEN json_extract(item,'$.flavors') ELSE '[]' END AS flavors
 FROM objects
), flavor_objects AS (
 SELECT lines.qty, CASE WHEN f.type='object' THEN f.value ELSE '{}' END AS flavor
 FROM lines,json_each(lines.flavors) f WHERE lines.id IN ('69','70','71','72')
), quantities AS (
 SELECT id,qty FROM lines WHERE id NOT IN ('69','70','71','72')
 UNION ALL
 SELECT CAST(json_extract(flavor,'$.id') AS TEXT), qty * json_extract(flavor,'$.qty')
 FROM flavor_objects WHERE json_type(flavor,'$.qty')='integer' AND json_extract(flavor,'$.qty')>0
)
SELECT id,SUM(qty) AS units FROM quantities WHERE qty>0 GROUP BY id`;

export async function popularMeals(){
 const [totals,{items}]=await Promise.all([getDb().all<{id:string,units:number}>(popularitySql),catalogSnapshot()]);
 const eligible=new Map(items.filter(i=>i.active&&mealCategories.includes(i.category)).map((i,index)=>[i.id,index]));
 return totals.filter(i=>eligible.has(i.id)&&i.units>0)
 .sort((a,b)=>b.units-a.units||eligible.get(a.id)!-eligible.get(b.id)!)
 .slice(0,12).map((i,index)=>({id:i.id,rank:index+1}));
}
