import {getAdminUser} from '@/lib/admin-auth';
import {privateHeaders,sameOrigin} from '@/lib/customers';
import {lockContext,checkWrite} from '@/lib/commerce';
import {basicClient} from '@/lib/admin-clients';
import {paymentLabel} from '@/lib/payments';
import {validDay} from '@/lib/operations';
import {editOrderItems,isPersonalizedItem,type EditableSoldItem} from '@/lib/edit-order-items';
export const dynamic='force-dynamic';
export async function PUT(req:Request){
 const user=await getAdminUser();if(!user||!sameOrigin(req))return new Response(null,{status:403,headers:privateHeaders});
 try{
  const text=await req.text();if(text.length>120000)throw Error('Pedido muito longo.');const b=JSON.parse(text);
  if(typeof b.orderId!=='string'||!b.orderId||b.orderId.length>80||typeof b.version!=='string'||b.version.length>80||b.confirmChanges!==true||!['entrega','retirada'].includes(b.mode)||typeof b.date!=='string'||b.date!==''&&!validDay(b.date)||typeof b.notes!=='string'||b.notes.length>2000||typeof b.paymentMethod!=='string'||b.paymentMethod!==''&&!paymentLabel(b.paymentMethod)||b.shippingCents!==null&&(!Number.isSafeInteger(b.shippingCents)||b.shippingCents<0||b.shippingCents>100000))throw Error('Confira os dados e confirme as alterações do pedido.');
  const fields=basicClient({name:'Pedido',phone:b.phone,address:b.address}),ctx=await lockContext(b.orderId,b.version),old=ctx.order as typeof ctx.order&{entry_source:string,phone:string,address:string,preferred_date:string,delivery_date:string|null,notes:string,payment_method:string|null},original=JSON.parse(old.items) as EditableSoldItem[];
  if(old.entry_source!=='admin'&&!original.some(isPersonalizedItem))throw Error('Esta edição é destinada aos pedidos personalizados ou lançados pela administração.');
  if(!['aguardando_confirmacao','confirmado'].includes(old.status))return Response.json({error:'Os itens só podem ser editados antes de iniciar a produção. Pedidos em produção, prontos, entregues ou cancelados ficam bloqueados.'},{status:409,headers:privateHeaders});
  if(await ctx.db.prepare('SELECT id FROM production_progress WHERE order_id=? AND ready_qty>0 LIMIT 1').bind(b.orderId).first())return Response.json({error:'Já há unidades produzidas para este pedido. Confira a produção antes de alterar os itens.'},{status:409,headers:privateHeaders});
  const {items,totalCents}=editOrderItems(original,b.items),shipping=b.mode==='retirada'?0:b.shippingCents,notes=b.notes.trim().split('\n').filter((line:string)=>line!=='Personalizada: preço combinado com o cliente no atendimento.').join('\n'),stamp=new Date().toISOString();
  const before={items:original,totalCents:old.total_cents,shippingCents:old.shipping_fee_cents,status:old.status,mode:ctx.c.delivery_mode,date:old.delivery_date||old.preferred_date,paymentMethod:old.payment_method,notes:old.notes};
  const after={items,totalCents,shippingCents:shipping,status:'aguardando_confirmacao',mode:b.mode,date:b.date,paymentMethod:b.paymentMethod||null,notes};
  const result=await ctx.db.batch([
   ...ctx.locks,
   ctx.db.prepare(`INSERT INTO inventory_movements(id,item_key,order_id,kind,delta,actor,reason,created_at) SELECT ?||a.id,a.item_key,a.order_id,'devolucao',a.qty,?,'Reserva liberada pela edição do pedido',? FROM stock_allocations a WHERE a.order_id=? AND a.qty>0 AND ? AND ${ctx.guard}`).bind(ctx.token+':edit:',user.email,stamp,b.orderId,old.status==='confirmado'?1:0,b.orderId,ctx.token),
   ctx.db.prepare(`UPDATE orders SET items=?,total_cents=?,shipping_fee_cents=?,status='aguardando_confirmacao',phone=?,address=?,address_details=NULL,preferred_date=?,delivery_date=?,notes=?,payment_method=? WHERE id=? AND ${ctx.guard}`).bind(JSON.stringify(items),totalCents,shipping,fields.phone,fields.address,b.date,b.date||null,notes,b.paymentMethod||null,b.orderId,b.orderId,ctx.token),
   ctx.db.prepare(`DELETE FROM stock_lot_allocations WHERE order_id=? AND ${ctx.guard}`).bind(b.orderId,b.orderId,ctx.token),
   ctx.db.prepare(`DELETE FROM stock_allocations WHERE order_id=? AND ${ctx.guard}`).bind(b.orderId,b.orderId,ctx.token),
   ctx.db.prepare(`DELETE FROM production_progress WHERE order_id=? AND ${ctx.guard}`).bind(b.orderId,b.orderId,ctx.token),
   ctx.db.prepare(`DELETE FROM order_checks WHERE order_id=? AND ${ctx.guard}`).bind(b.orderId,b.orderId,ctx.token),
   ctx.db.prepare(`UPDATE order_quotes SET status='superseded' WHERE order_id=? AND status IN ('pending','accepted') AND ${ctx.guard}`).bind(b.orderId,b.orderId,ctx.token),
   ctx.db.prepare(`UPDATE order_commercial SET quote_id=NULL,delivery_mode=? WHERE order_id=? AND ${ctx.guard}`).bind(b.mode,b.orderId,b.orderId,ctx.token),
   ctx.db.prepare(`INSERT INTO order_edits(id,order_id,before_state,after_state,actor,created_at) SELECT ?,?,?,?,?,? WHERE ${ctx.guard}`).bind(ctx.token,b.orderId,JSON.stringify(before),JSON.stringify(after),user.email,stamp,b.orderId,ctx.token)
  ]);
  checkWrite(result);return Response.json({ok:true},{headers:privateHeaders});
 }catch(e){const message=e instanceof Error?e.message:'Não foi possível editar o pedido.';return Response.json({error:message},{status:/mudou|mudaram|Atualize o pedido/.test(message)?409:400,headers:privateHeaders})}
}
