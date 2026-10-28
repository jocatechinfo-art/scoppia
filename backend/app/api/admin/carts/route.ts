import {getAdminUser} from '@/lib/admin-auth';
import {ADMIN,privateHeaders} from '@/lib/customers';
import {inventoryDb} from '@/lib/inventory';
import {catalogSnapshot} from '@/lib/catalog';
export async function GET(){
 if((await getAdminUser())?.email.toLowerCase()!==ADMIN)return new Response(null,{status:403,headers:privateHeaders});
 const cutoff=new Date(Date.now()-30*86400000).toISOString();
 const [{results},catalog]=await Promise.all([inventoryDb().prepare("SELECT s.id,s.items,s.updated_at,s.created_at,c.name FROM cart_snapshots s LEFT JOIN customers c ON s.customer_id=c.id AND c.deleted_at IS NULL WHERE s.converted_order_id IS NULL AND s.items!='[]' AND s.updated_at>=? ORDER BY s.updated_at DESC LIMIT 201").bind(cutoff).all<{id:string,items:string,updated_at:string,created_at:string,name:string|null}>(),catalogSnapshot()]);
 const rows=results.slice(0,200).map(r=>({...r,items:JSON.parse(r.items).map((i:{id:string,sizeIndex:number})=>{const m=catalog.items.find(m=>m.id===i.id);return {...i,unitCents:m&&i.id!=='personalizada'?Math.round(m.prices[i.sizeIndex]*100):null}})}));
 return Response.json({rows,truncated:results.length>200,asOf:new Date().toISOString()},{headers:privateHeaders});
}
