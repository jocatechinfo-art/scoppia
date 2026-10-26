import {enrichOrders} from '@/lib/commerce';
import {getCustomerUser} from '@/lib/customer-auth';
import {getDb} from '@/db';
import {customers,orders} from '@/db/schema';
import {eq,desc,and,isNull} from 'drizzle-orm';
import {privateHeaders} from '@/lib/customers';
export const dynamic='force-dynamic';
export async function GET(){const u=await getCustomerUser();if(!u)return Response.json({error:'Entre para acessar seu histórico.'},{status:401,headers:privateHeaders});const [c]=await getDb().select().from(customers).where(eq(customers.userId,u.userId));const rows=c?await getDb().select().from(orders).where(and(eq(orders.customerId,c.id),isNull(orders.deletedAt))).orderBy(desc(orders.createdAt)).limit(100):[];return Response.json(await enrichOrders(rows.map(({requestId,customerId,stockBatchId,entryActor,entryFingerprint,...o})=>({...o,items:JSON.parse(o.items)}))),{headers:privateHeaders})}
