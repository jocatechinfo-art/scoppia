import {getChatGPTUser} from '@/app/chatgpt-auth';
import {getDb} from '@/db';
import {customers} from '@/db/schema';
import {eq} from 'drizzle-orm';
import {saveCustomer,publicProfile,privateHeaders,sameOrigin} from '@/lib/customers';
export const dynamic='force-dynamic';
export async function GET(){const u=await getChatGPTUser();if(!u)return Response.json({authenticated:false},{headers:privateHeaders});const [c]=await getDb().select().from(customers).where(eq(customers.userId,u.userId));return Response.json({authenticated:true,profile:c?publicProfile(c):null},{headers:privateHeaders});}
export async function POST(req:Request){const u=await getChatGPTUser();if(!u)return Response.json({error:'Entre para salvar seu cadastro.'},{status:401,headers:privateHeaders});if(!sameOrigin(req))return new Response(null,{status:403});try{const c=await saveCustomer(u.userId,await req.json() as {cpf?:unknown,name:unknown,phone:unknown,address:unknown});return Response.json({profile:publicProfile(c)},{headers:privateHeaders})}catch(e){return Response.json({error:e instanceof Error?e.message:'Não foi possível salvar.'},{status:400,headers:privateHeaders})}}
