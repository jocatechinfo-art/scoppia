import {getAdminUser} from '@/lib/admin-auth';
import {privateHeaders,sameOrigin} from '@/lib/customers';
import {inventoryDb} from '@/lib/inventory';
import {purchaseFields} from '@/lib/shopping';
import {getDb} from '@/db';
import {shoppingItems,shoppingPurchases} from '@/db/schema';
import {eq} from 'drizzle-orm';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 if(!await getAdminUser()||!sameOrigin(req))return new Response(null,{status:403,headers:privateHeaders});
 try{
  const raw=await req.text();if(raw.length>2000)throw Error('Registro de compra muito longo.');const b=JSON.parse(raw);
  if(typeof b.id!=='string'||!b.id||b.id.length>80||typeof b.version!=='string'||!b.version||b.version.length>80)throw Error('Identificador inválido.');
  const fields=purchaseFields(b),token=crypto.randomUUID(),now=new Date().toISOString(),db=inventoryDb();
  // The guarded insert and status change share one D1 transaction. A stale item cannot publish a price.
  const result=await db.batch([
   db.prepare('INSERT INTO shopping_purchases(shopping_id,supply_key,quantity,unit,total_cents,unit_price_cents,updated_at) SELECT id,?,?,?,?,?,? FROM shopping_items WHERE id=? AND version=? ON CONFLICT(shopping_id) DO UPDATE SET supply_key=excluded.supply_key,quantity=excluded.quantity,unit=excluded.unit,total_cents=excluded.total_cents,unit_price_cents=excluded.unit_price_cents,updated_at=excluded.updated_at').bind(fields.supplyKey,fields.quantity,fields.unit,fields.totalCents,fields.unitPriceCents,now,b.id,b.version),
   db.prepare('UPDATE shopping_items SET ingredient_key=?,purchased=1,purchased_at=?,updated_at=?,version=? WHERE id=? AND version=?').bind(fields.supplyKey,now,now,token,b.id,b.version)
  ]);
  if(!result[1].meta.changes)return Response.json({error:'Este item mudou em outro acesso. Atualize a lista antes de registrar a compra.'},{status:409,headers:privateHeaders});
  const [saved]=await getDb().select().from(shoppingItems).where(eq(shoppingItems.id,b.id));const [purchase]=await getDb().select().from(shoppingPurchases).where(eq(shoppingPurchases.shoppingId,b.id));
  return Response.json({...saved,purchase},{headers:privateHeaders});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Não foi possível registrar a compra.'},{status:400,headers:privateHeaders})}
}
