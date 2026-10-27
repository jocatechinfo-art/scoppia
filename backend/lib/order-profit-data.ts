import {getDb} from '@/db';
import {orders} from '@/db/schema';
import {and,eq,isNull,desc} from 'drizzle-orm';
import {inventoryDb} from './inventory';
import {enrichOrders} from './commerce';
import {costData} from './costs';
import {initialCostEstimates,priceRecipes} from './cost-estimates';
import {digest} from './bridge-session';
import {emptyProfitInputs,resolveOrderProfit,type ProfitRecord,type ProfitSoldItem,type ProfitOrder} from './order-profit';

export async function profitData(orderId?:string,customerId?:string){
 const raw=await getDb().select().from(orders).where(and(isNull(orders.deletedAt),orderId?eq(orders.id,orderId):undefined,customerId?eq(orders.customerId,customerId):undefined)).orderBy(desc(orders.createdAt));
 const ids=JSON.stringify(raw.map(o=>o.id));
 const [costs,enriched,stored,edits]=await Promise.all([costData(),enrichOrders(raw,true),inventoryDb().prepare('SELECT * FROM order_profits WHERE order_id IN (SELECT value FROM json_each(?))').bind(ids).all<{order_id:string,version:string,fingerprint:string,inputs:string,snapshot:string,updated_at:string}>(),inventoryDb().prepare('SELECT order_id,id FROM order_edits WHERE order_id IN (SELECT value FROM json_each(?)) ORDER BY created_at DESC,id DESC').bind(ids).all<{order_id:string,id:string}>()]);
 const known=new Set(costs.recipes.map(r=>r.key)),recipes=priceRecipes([...costs.recipes,...initialCostEstimates(costs.items).filter(r=>!known.has(r.key))],costs.purchasePrices);
 const result:ProfitOrder[]=await Promise.all(enriched.map(async o=>{
  const row=stored.results.find(r=>r.order_id===o.id),items=o.items as ProfitSoldItem[],revenueCents=o.commerce.totalCents;
  const editRevision=edits.results.find(e=>e.order_id===o.id)?.id;
  const fingerprint=await digest(JSON.stringify({...(editRevision?{editRevision}:{}),items,revenueCents,subtotal:o.commerce.subtotalCents,shipping:o.shippingFeeCents,quote:o.commerce.quote?{id:o.commerce.quote.id,status:o.commerce.quote.status,lines:o.commerce.quote.lines}:null}));
  const record:ProfitRecord|null=row?{version:row.version,fingerprint:row.fingerprint,inputs:JSON.parse(row.inputs),snapshot:JSON.parse(row.snapshot),updatedAt:row.updated_at}:null,stale=!!record&&record.fingerprint!==fingerprint;
  const frozen=record&&!stale&&!record.snapshot.missing.length?record:null;
  const calculation=frozen?{...frozen.snapshot}:resolveOrderProfit(items,revenueCents,record&&!stale?record.inputs:emptyProfitInputs(),costs.items,recipes);
  if(o.status==='cancelado'){calculation.profitCents=null;calculation.margin=null;calculation.missing=['Pedido cancelado — fora do resultado']}
  return {id:o.id,orderNumber:o.orderNumber,customerName:o.customerName,status:o.status,createdAt:o.createdAt,items,revenueCents,fingerprint,record,stale,result:calculation};
 }));
 return {orders:result,items:costs.items,recipes,raw,enriched};
}
