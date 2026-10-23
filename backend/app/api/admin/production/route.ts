import {getAdminUser} from '@/lib/admin-auth';
import {getDb} from '@/db';
import {orders} from '@/db/schema';
import {eq,desc} from 'drizzle-orm';
import {privateHeaders} from '@/lib/customers';
import {productionSummary} from '@/lib/production';
import {orderLabel} from '@/lib/order-number';
export const dynamic='force-dynamic';
export async function GET(req:Request){if(!await getAdminUser())return new Response(null,{status:403,headers:privateHeaders});try{const date=new URL(req.url).searchParams.get('date')||'';if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date))throw Error('Informe uma data válida.');const confirmed=await getDb().select().from(orders).where(eq(orders.status,'confirmado')).orderBy(desc(orders.createdAt));const selected=confirmed.filter(o=>!date||(o.deliveryDate||o.preferredDate)===date);return Response.json({...productionSummary(selected),date,orders:selected.map(o=>({number:orderLabel(o),customerName:o.customerName,date:o.deliveryDate||o.preferredDate||null}))},{headers:privateHeaders})}catch(e){return Response.json({error:e instanceof Error?e.message:'Não foi possível gerar o relatório.'},{status:400,headers:privateHeaders})}}
