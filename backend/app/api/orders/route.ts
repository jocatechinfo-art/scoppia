import {getCustomerUser} from '@/lib/customer-auth';
import {getDb} from '@/db';
import {customers,orders} from '@/db/schema';
import {eq,desc} from 'drizzle-orm';
import {privateHeaders} from '@/lib/customers';
export const dynamic='force-dynamic';
export async function GET(){const u=await getCustomerUser();if(!u)return Response.json({error:'Entre para acessar seu histórico.'},{status:401,headers:privateHeaders});const [c]=await getDb().select().from(customers).where(eq(customers.userId,u.userId));const rows=c?await getDb().select().from(orders).where(eq(orders.customerId,c.id)).orderBy(desc(orders.createdAt)).limit(100):[];return Response.json(rows.map(({requestId,customerId,...o})=>({...o,items:JSON.parse(o.items)})),{headers:privateHeaders})}
