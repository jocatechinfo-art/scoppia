import {getAdminUser} from '@/lib/admin-auth';
import {privateHeaders} from '@/lib/customers';
import {getDb} from '@/db';
import {customers,orders} from '@/db/schema';
import {eq,and,isNull,desc} from 'drizzle-orm';
import {enrichOrders} from '@/lib/commerce';
export const dynamic='force-dynamic';
export async function GET(req:Request){if(!await getAdminUser())return new Response(null,{status:403,headers:privateHeaders});const id=new URL(req.url).searchParams.get('customerId');if(!id||id.length>80)return new Response(null,{status:400,headers:privateHeaders});const db=getDb(),[client]=await db.select({id:customers.id}).from(customers).where(eq(customers.id,id)).limit(1);if(!client)return new Response(null,{status:404,headers:privateHeaders});const rows=await db.select().from(orders).where(and(eq(orders.customerId,id),isNull(orders.deletedAt))).orderBy(desc(orders.createdAt),desc(orders.id)).limit(11);return Response.json({orders:await enrichOrders(rows.slice(0,10).map(({requestId,entryFingerprint,stockBatchId,...o})=>o),true),hasMore:rows.length>10},{headers:privateHeaders})}
