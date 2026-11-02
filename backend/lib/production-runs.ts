import {inventoryCatalog,inventoryDb,stockAssignments} from './inventory';
import {productionLines} from './production';
import {allocateProduction} from './production-allocation';
import {today,validDay} from './operations';
type RunOrder={id:string,orderNumber:number|null,customerName:string,deliveryDate:string|null,preferredDate:string,items:string,version:string|null};
const active="status IN ('confirmado','em_producao') AND deleted_at IS NULL";
export async function productionSnapshot(){
 const db=inventoryDb();
 const [raw,marks,assigned]=await Promise.all([db.prepare(`SELECT id,order_number AS orderNumber,customer_name AS customerName,delivery_date AS deliveryDate,preferred_date AS preferredDate,items,stock_batch_id AS version FROM orders WHERE ${active}`).all<RunOrder>(),db.prepare('SELECT id,ready_qty FROM production_progress').all<{id:string,ready_qty:number}>(),stockAssignments()]);
 const orders=raw.results,ready=new Map(marks.results.map(r=>[r.id,r.ready_qty])),stock=new Map(assigned.map(r=>[r.id,r.qty])),day=today();
 const lines=productionLines(orders).map(l=>{const id=JSON.stringify([l.orderId,l.key]),order=orders.find(o=>o.id===l.orderId)!;return {...l,qty:Math.max(0,l.qty-(ready.get(id)||0)-(stock.get(id)||0)),date:[day,order.deliveryDate||order.preferredDate||day].sort().at(-1)!}});
 return {orders,lines};
}
export async function productionEntryData(){
 const db=inventoryDb(),snapshot=await productionSnapshot();
 const options=new Map(inventoryCatalog.map(i=>[i.key,{...i,description:'',demand:[] as {date:string,qty:number}[]}]));
 for(const l of snapshot.lines){const option=options.get(l.key)||{key:l.key,name:l.name,size:l.size,description:l.description,demand:[]};if(l.qty)option.demand.push({date:l.date,qty:l.qty});options.set(l.key,option)}
 const history=await db.prepare('SELECT r.id,r.name,r.size,r.description,r.quantity,r.allocated_qty AS allocatedQty,r.produced_on AS producedOn,r.expires_on AS expiresOn,r.created_at AS createdAt FROM production_runs r ORDER BY r.created_at DESC,r.id DESC LIMIT 30').all();
 return {options:[...options.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')||a.size.localeCompare(b.size,'pt-BR',{numeric:true})),history:history.results,today:today()};
}
export type RunInput={id:string,key:string,quantity:number,producedOn:string,expiresOn:string};
export async function includeProduction(b:RunInput,actor:string){
 if(typeof b.id!=='string'||!/^[-a-f0-9]{36}$/i.test(b.id)||typeof b.key!=='string'||b.key.length>3000||!Number.isSafeInteger(b.quantity)||b.quantity<1||b.quantity>100000||!validDay(b.producedOn)||!validDay(b.expiresOn)||b.producedOn>today()||b.expiresOn<today()||b.expiresOn<b.producedOn)throw Error('Informe item, quantidade inteira, data de produção até hoje e validade não vencida.');
 const db=inventoryDb(),fingerprint=JSON.stringify([b.key,b.quantity,b.producedOn,b.expiresOn]);
 const prior=await db.prepare('SELECT fingerprint,quantity,allocated_qty FROM production_runs WHERE id=?').bind(b.id).first<{fingerprint:string,quantity:number,allocated_qty:number}>();
 const saved=(r:{quantity:number,allocated_qty:number})=>({ok:true,quantity:r.quantity,allocatedQty:r.allocated_qty,stockQty:r.quantity-r.allocated_qty,lotCode:'PROD-'+b.id.slice(0,8).toUpperCase()});
 if(prior){if(prior.fingerprint!==fingerprint)throw Error('Identificador já usado em outro lançamento. Feche e abra o cadastro.');return saved(prior)}
 const {orders,lines}=await productionSnapshot(),line=lines.find(l=>l.key===b.key),item=inventoryCatalog.find(i=>i.key===b.key)||line;
 if(!item)throw Error('Item não encontrado. Atualize a produção.');
 const plan=allocateProduction(b.quantity,b.expiresOn,lines.filter(l=>l.key===b.key)),token=crypto.randomUUID(),now=new Date().toISOString(),code='PROD-'+b.id.slice(0,8).toUpperCase();
 const versions=JSON.stringify(orders.map(o=>({id:o.id,version:o.version}))),guard="EXISTS(SELECT 1 FROM production_runs WHERE id=? AND token=?)";
 // The first statement validates the complete order snapshot. A change or another
 // confirmation prevents every write, so a stale view can never duplicate allocation.
 const queries=[db.prepare(`INSERT INTO production_runs(id,token,fingerprint,item_key,name,size,description,quantity,allocated_qty,produced_on,expires_on,actor,created_at) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM orders WHERE ${active})=? AND (SELECT COUNT(*) FROM orders o JOIN json_each(?) v ON o.id=json_extract(v.value,'$.id') WHERE o.stock_batch_id IS json_extract(v.value,'$.version') AND o.status IN ('confirmado','em_producao') AND o.deleted_at IS NULL)=? ON CONFLICT(id) DO NOTHING`).bind(b.id,token,fingerprint,b.key,item.name,item.size,line?.description||'',b.quantity,plan.allocatedQty,b.producedOn,b.expiresOn,actor,now,orders.length,versions,orders.length),
 db.prepare(`INSERT INTO stock_lots(id,item_key,code,produced_on,expires_on,quantity,created_at) SELECT ?,?,?,?,?,?,? WHERE ${guard}`).bind(b.id,b.key,code,b.producedOn,b.expiresOn,b.quantity,now,b.id,token),
 db.prepare(`INSERT INTO inventory_movements(id,item_key,lot_id,kind,delta,actor,reason,created_at) SELECT ?,?,?,'entrada_lote',?,?,?,? WHERE ${guard}`).bind(b.id+':entrada',b.key,b.id,b.quantity,actor,'Produção lançada no lote '+code,now,b.id,token)];
 for(const a of plan.allocations){const id=JSON.stringify([a.orderId,b.key]);queries.push(
  db.prepare(`UPDATE orders SET stock_batch_id=? WHERE id=? AND ${guard}`).bind(token,a.orderId,b.id,token),
  db.prepare(`INSERT INTO stock_allocations(id,order_id,item_key,qty) SELECT ?,?,?,? WHERE ${guard} ON CONFLICT(id) DO UPDATE SET qty=stock_allocations.qty+excluded.qty`).bind(id,a.orderId,b.key,a.qty,b.id,token),
  db.prepare(`INSERT INTO stock_lot_allocations(id,order_id,item_key,lot_id,qty) SELECT ?,?,?,?,? WHERE ${guard}`).bind(JSON.stringify([a.orderId,b.key,b.id]),a.orderId,b.key,b.id,a.qty,b.id,token),
  db.prepare(`INSERT INTO inventory_movements(id,item_key,lot_id,order_id,kind,delta,actor,reason,created_at) SELECT ?,?,?,?,'reserva',?,?,?,? WHERE ${guard}`).bind(b.id+':'+a.orderId,b.key,b.id,a.orderId,-a.qty,actor,'Separado automaticamente da produção '+code,now,b.id,token)
 )}
 const results=await db.batch(queries);
 if(!results[0].meta.changes){const retry=await db.prepare('SELECT fingerprint,quantity,allocated_qty FROM production_runs WHERE id=?').bind(b.id).first<{fingerprint:string,quantity:number,allocated_qty:number}>();if(retry?.fingerprint===fingerprint)return saved(retry);throw Error('Os pedidos ou a produção mudaram. Atualize e tente novamente. Nenhuma quantidade foi lançada.')}
 return saved({quantity:b.quantity,allocated_qty:plan.allocatedQty});
}
