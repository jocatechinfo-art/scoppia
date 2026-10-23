import {getChatGPTUser} from '@/app/chatgpt-auth';
import {getDb} from '@/db';
import {customers,orders} from '@/db/schema';
import {eq,desc} from 'drizzle-orm';
import {cpfHash,publicProfile,privateHeaders,sameOrigin} from '@/lib/customers';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Entre na sua conta para consultar o CPF.'},{status:401,headers:privateHeaders});if(!sameOrigin(req))return new Response(null,{status:403});
 try{const body=await req.json() as {cpf:unknown};const {hash}=await cpfHash(body.cpf);const db=getDb();const [customer]=await db.select().from(customers).where(eq(customers.cpfHash,hash));
 if(customer&&customer.userId!==user.userId)return Response.json({error:'Não foi possível consultar este CPF nesta conta. Entre com a conta usada no cadastro ou fale com a Scoppia.'},{status:403,headers:privateHeaders});
 if(!customer){const [existing]=await db.select().from(customers).where(eq(customers.userId,user.userId));if(existing)return Response.json({error:'Esta conta já tem um CPF vinculado. Use o mesmo CPF do seu cadastro.'},{status:409,headers:privateHeaders});return Response.json({profile:null,orders:[]},{headers:privateHeaders})}
 const recent=await db.select().from(orders).where(eq(orders.customerId,customer.id)).orderBy(desc(orders.createdAt)).limit(5);
 return Response.json({profile:publicProfile(customer),orders:recent.map(({id,items,totalCents,status,deliveryDate,createdAt,address})=>({id,items:JSON.parse(items),totalCents,status,deliveryDate,createdAt,address}))},{headers:privateHeaders});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Não foi possível consultar o cadastro.'},{status:400,headers:privateHeaders})}
}
