import {verifyPassword} from 'better-auth/crypto';
import {eq,sql} from 'drizzle-orm';
import {getDb} from '@/db';
import {customerAuthAttempts} from '@/db/schema';
import {adminPasswordHash,adminToken,getAdminUser} from '@/lib/admin-auth';
import {adminCookieName} from '@/lib/admin-cookie';
import {digest} from '@/lib/bridge-session';
import {privateHeaders,sameOrigin} from '@/lib/customers';
export const dynamic='force-dynamic';
export async function GET(){return Response.json({authenticated:!!await getAdminUser()},{headers:privateHeaders})}
function cookie(req:Request,value:string,maxAge:number){return adminCookieName(req.url)+'='+encodeURIComponent(value)+'; Path=/; HttpOnly; SameSite=Lax; Max-Age='+maxAge+(new URL(req.url).protocol==='https:'?'; Secure':'')}
export async function POST(req:Request){const raw=await req.text();if(!sameOrigin(req))return new Response(null,{status:403});try{if(raw.length>2048)throw Error();const body=JSON.parse(raw) as {password:unknown};if(typeof body.password!=='string'||body.password.length>128)throw Error();const hash=adminPasswordHash();if(!hash)return Response.json({error:'Acesso administrativo indisponível. Tente novamente mais tarde.'},{status:503,headers:privateHeaders});const now=Date.now(),key='admin-login:'+await digest(req.headers.get('cf-connecting-ip')||'proxy')+':'+Math.floor(now/900000),db=getDb();const [attempt]=await db.insert(customerAuthAttempts).values({key,count:1,expiresAt:now+900000}).onConflictDoUpdate({target:customerAuthAttempts.key,set:{count:sql`${customerAuthAttempts.count}+1`}}).returning();await db.run(sql`DELETE FROM customer_auth_attempts WHERE key IN (SELECT key FROM customer_auth_attempts WHERE expires_at < ${now} LIMIT 100)`);if(attempt.count>20)return Response.json({error:'Muitas tentativas. Aguarde 15 minutos para tentar novamente.'},{status:429,headers:{...privateHeaders,'Retry-After':'900'}});if(!await verifyPassword({hash,password:body.password}))return Response.json({error:'Senha incorreta. Confira e tente novamente.'},{status:401,headers:privateHeaders});return Response.json({ok:true},{headers:{...privateHeaders,'Set-Cookie':cookie(req,await adminToken(),8*3600)}})}catch{return Response.json({error:'Não foi possível entrar. Confira a senha.'},{status:400,headers:privateHeaders})}}
export async function DELETE(req:Request){await req.arrayBuffer();if(!sameOrigin(req))return new Response(null,{status:403});return Response.json({ok:true},{headers:{...privateHeaders,'Set-Cookie':cookie(req,'',0)}})}
