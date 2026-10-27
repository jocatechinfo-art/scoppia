import {getAdminUser} from '@/lib/admin-auth';
import {privateHeaders,sameOrigin} from '@/lib/customers';
import {profitData} from '@/lib/order-profit-data';
import {soldCostLines,validateProfitInputs,resolveOrderProfit} from '@/lib/order-profit';
import {inventoryDb} from '@/lib/inventory';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 if(!await getAdminUser())return new Response(null,{status:403,headers:privateHeaders});
 const customerId=new URL(req.url).searchParams.get('customerId')||undefined;if(customerId&&customerId.length>80)return new Response(null,{status:400,headers:privateHeaders});
 const {orders,items,recipes}=await profitData(undefined,customerId);return Response.json({orders,items,recipes},{headers:privateHeaders});
}
export async function PUT(req:Request){
 const user=await getAdminUser();if(!user||!sameOrigin(req))return new Response(null,{status:403,headers:privateHeaders});
 try{
  const text=await req.text();if(text.length>100000)throw Error('Revisão muito longa.');const b=JSON.parse(text);
  if(typeof b.id!=='string'||!b.id||b.id.length>80||typeof b.version!=='string'||b.version.length>80||typeof b.fingerprint!=='string'||b.fingerprint.length>100||typeof b.refreshCosts!=='boolean')throw Error('Confira o pedido e atualize os dados.');
  const data=await profitData(b.id),order=data.orders[0],raw=data.raw[0],commercial=data.enriched[0];
  if(!order)return new Response(null,{status:404,headers:privateHeaders});
  if(order.status==='cancelado')return Response.json({error:'Pedidos cancelados ficam fora do cálculo de resultado.'},{status:409,headers:privateHeaders});
  if(order.fingerprint!==b.fingerprint||(order.record?.version||'')!==b.version)return Response.json({error:'O pedido ou a revisão mudou. Feche e atualize antes de salvar.'},{status:409,headers:privateHeaders});
  const inputs=validateProfitInputs(b.inputs,soldCostLines(order.items,data.items),data.items),frozen=!b.refreshCosts&&!order.stale&&order.record&&!order.record.snapshot.missing.length?order.record:null;
  const snapshot=resolveOrderProfit(order.items,order.revenueCents,inputs,data.items,data.recipes,frozen),token=crypto.randomUUID(),now=new Date().toISOString();
  const write=await inventoryDb().prepare(`INSERT INTO order_profits(order_id,version,fingerprint,inputs,snapshot,actor,updated_at) SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM orders WHERE id=? AND stock_batch_id IS ? AND items=? AND total_cents=? AND shipping_fee_cents IS ? AND status<>'cancelado' AND deleted_at IS NULL) AND COALESCE((SELECT version FROM order_commercial WHERE order_id=?),'')=? ON CONFLICT(order_id) DO UPDATE SET version=excluded.version,fingerprint=excluded.fingerprint,inputs=excluded.inputs,snapshot=excluded.snapshot,actor=excluded.actor,updated_at=excluded.updated_at WHERE order_profits.version=?`).bind(order.id,token,order.fingerprint,JSON.stringify(inputs),JSON.stringify(snapshot),user.email,now,order.id,raw.stockBatchId,raw.items,raw.totalCents,raw.shippingFeeCents,order.id,commercial.commerce.version,b.version).run();
  if(!write.meta.changes)return Response.json({error:'O pedido mudou durante a gravação. Atualize e tente novamente.'},{status:409,headers:privateHeaders});
  return Response.json({ok:true,complete:!snapshot.missing.length},{headers:privateHeaders});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Não foi possível salvar a revisão.'},{status:400,headers:privateHeaders})}
}
