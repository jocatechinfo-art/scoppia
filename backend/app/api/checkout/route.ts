import {getDb} from '@/db';
import {availability,orders} from '@/db/schema';
import {menu} from '@/lib/menu';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {saveCustomer,privateHeaders,sameOrigin} from '@/lib/customers';
import {eq} from 'drizzle-orm';
export async function POST(req:Request){
 const u=await getChatGPTUser();if(!u)return Response.json({error:'Entre para salvar seus dados e registrar o pedido.'},{status:401,headers:privateHeaders});if(!sameOrigin(req))return new Response(null,{status:403});
 try{
 const b=await req.json() as {cart:{id:string,size:number,qty:number}[],cpf?:string,name:string,phone:string,address:string,date:string,notes:string,requestId:string};const {cart,date,notes,requestId}=b;
 if(!Array.isArray(cart)||!cart.length||cart.length>150||typeof notes!=='string'||notes.length>1000||typeof requestId!=='string'||!/^[\da-f-]{36}$/i.test(requestId))throw Error('Confira os dados do pedido.');
 const db=getDb();const [previous]=await db.select().from(orders).where(eq(orders.requestId,requestId));
 if(previous){const {customers}=await import('@/db/schema');const [owner]=await db.select().from(customers).where(eq(customers.userId,u.userId));if(previous.customerId!==owner?.id)throw Error('Identificador de pedido inválido.');return Response.json({url:whatsapp(previous),orderId:previous.id},{headers:privateHeaders});}
 const min=new Date(Date.now()-3*3600000);min.setUTCDate(min.getUTCDate()+7);if(typeof date!=='string'||(date!==''&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||date<min.toISOString().slice(0,10))))throw Error('Escolha uma data com pelo menos 7 dias de antecedência.');
 const rows=await db.select().from(availability);const off=new Set(rows.filter(r=>!r.active).map(r=>r.id));let totalCents=0;
 const snapshot=cart.map(c=>{if(!c||typeof c.id!=='string')throw Error('Item inválido.');const i=menu.find(i=>i.id===c.id);if(!i||off.has(c.id))throw Error('Um item ficou indisponível. Atualize o cardápio.');if(!Number.isInteger(c.size)||c.size<0||c.size>=i.prices.length||!Number.isInteger(c.qty)||c.qty<1||c.qty>99)throw Error('Quantidade inválida.');const unitCents=Math.round(i.prices[c.size]*100);totalCents+=unitCents*c.qty;return {id:i.id,name:i.name,size:i.sizes[c.size],qty:c.qty,unitCents};});
 const c=await saveCustomer(u.userId,b);const order={id:crypto.randomUUID(),customerId:c.id,requestId,items:JSON.stringify(snapshot),totalCents,customerName:c.name,phone:c.phone,address:c.address,preferredDate:date,notes,status:'aguardando_confirmacao',deliveryDate:null,createdAt:new Date().toISOString()};
 await db.insert(orders).values(order).onConflictDoNothing({target:orders.requestId});const [saved]=await db.select().from(orders).where(eq(orders.requestId,requestId));if(!saved||saved.customerId!==c.id)throw Error('Não foi possível registrar o pedido.');return Response.json({url:whatsapp(saved),orderId:saved.id},{headers:privateHeaders});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Não foi possível preparar o pedido.'},{status:400,headers:privateHeaders})}
}
function whatsapp(o:typeof orders.$inferSelect){const items=JSON.parse(o.items) as {name:string,size:string,qty:number,unitCents:number}[];const lines=items.map(i=>`${i.qty}x ${i.name} (${i.size}) - R$ ${(i.unitCents*i.qty/100).toFixed(2)}`);const text=`Olá, Scoppia Gourmet! Gostaria de fazer um pedido.\nPedido: ${o.id}\nNome: ${o.customerName}\nWhatsApp: ${o.phone}\nEndereço: ${o.address}\nPreferência de entrega: ${o.preferredDate?o.preferredDate.split('-').reverse().join('/'):'A combinar com a equipe'}\n\n${lines.join('\n')}\n\nSubtotal: R$ ${(o.totalCents/100).toFixed(2)}\nObservações: ${o.notes||'Nenhuma'}\n\nPor favor, confirmem meu pedido e informem a previsão da data de entrega, a taxa e as formas de pagamento. Sabores dos combos a combinar conforme o cardápio da semana.`;return 'https://wa.me/5511988944648?text='+encodeURIComponent(text);}
