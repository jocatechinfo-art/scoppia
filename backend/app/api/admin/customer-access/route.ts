import {eq,sql} from 'drizzle-orm';
import {getDb} from '@/db';
import {customers,customerAccessCodes} from '@/db/schema';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {ADMIN,cpfHash,sameOrigin,privateHeaders} from '@/lib/customers';
import {base64url,digest} from '@/lib/bridge-session';
export async function POST(req:Request){
 const raw=await req.text();const admin=await getChatGPTUser();if(admin?.email.toLowerCase()!==ADMIN)return new Response(null,{status:403});if(!sameOrigin(req))return new Response(null,{status:403});
 try{const {hash}=await cpfHash((JSON.parse(raw) as {cpf:unknown}).cpf);const db=getDb();const [c]=await db.select().from(customers).where(eq(customers.cpfHash,hash));if(!c)return Response.json({error:'Cadastro não encontrado para este CPF.'},{status:404,headers:privateHeaders});
 const code=base64url(crypto.getRandomValues(new Uint8Array(18)));const expiresAt=Date.now()+30*60000;
 await db.batch([db.delete(customerAccessCodes).where(eq(customerAccessCodes.customerId,c.id)),db.delete(customerAccessCodes).where(sql`${customerAccessCodes.expiresAt}<${Date.now()}`),db.insert(customerAccessCodes).values({hash:await digest('customer-access:'+code),customerId:c.id,expiresAt})]);
 return Response.json({code,name:c.name,expiresAt},{headers:privateHeaders});
 }catch{return Response.json({error:'Confira o CPF informado.'},{status:400,headers:privateHeaders})}
}
