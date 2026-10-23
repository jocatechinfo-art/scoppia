import {eq,and,gt,sql} from 'drizzle-orm';
import {getDb} from '@/db';
import {authUser,authAccount,authSession,customers,customerAccessCodes,customerAuthAttempts} from '@/db/schema';
import {customerAuth,credentialEmail} from '@/lib/customer-auth';
import {cpfHash,privateHeaders,sameOrigin,profileFields,saveCustomer} from '@/lib/customers';
import {digest} from '@/lib/bridge-session';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export const dynamic='force-dynamic';
const invalid='Confira o CPF e a senha. Se precisar, solicite um código de recuperação à Scoppia.';
export async function POST(req:Request,{params}:{params:Promise<{action:string}>}){
 if(!sameOrigin(req))return new Response(null,{status:403});
 const {action}=await params;if(!['login','register','activate','logout'].includes(action))return new Response(null,{status:404});
 const auth=await customerAuth(new URL(req.url).origin);
 const forward=async(path:string,body:Record<string,unknown>)=>{const h=new Headers({'Content-Type':'application/json',Origin:new URL(req.url).origin});for(const key of ['cookie','user-agent','cf-connecting-ip']){const value=req.headers.get(key);if(value)h.set(key,value)}return auth.handler(new Request(new URL('/api/customer-auth/'+path,req.url),{method:'POST',headers:h,body:JSON.stringify(body)}))};
 const respond=async(r:Response)=>{await r.arrayBuffer();const h=new Headers(privateHeaders);for(const value of r.headers.getSetCookie())h.append('Set-Cookie',value);return Response.json(r.ok?{ok:true}:{error:invalid},{status:r.ok?200:r.status,headers:h})};
 try{
 if(action==='logout'){await req.arrayBuffer();return respond(await auth.api.signOut({headers:new Headers({cookie:req.headers.get('cookie')||''}),asResponse:true}));}
 const body=await req.json() as {cpf:unknown,password:unknown,name:unknown,code:unknown,phone:unknown,address:unknown,addressDetails?:unknown};
 const {hash}=await cpfHash(body.cpf),email=credentialEmail(hash),db=getDb(),now=Date.now();
 const bucket=hash+':'+Math.floor(now/900000);
 const [attempt]=await db.insert(customerAuthAttempts).values({key:bucket,count:1,expiresAt:now+900000}).onConflictDoUpdate({target:customerAuthAttempts.key,set:{count:sql`${customerAuthAttempts.count}+1`}}).returning();
 // Bounded cleanup, including expired one-time activation codes.
 await db.run(sql`DELETE FROM customer_auth_attempts WHERE key IN (SELECT key FROM customer_auth_attempts WHERE expires_at < ${now} LIMIT 100)`);
 if(attempt.count>10)return Response.json({error:'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.'},{status:429,headers:privateHeaders});
 if(typeof body.password!=='string'||body.password.length<10||body.password.length>128)return Response.json({error:'Use uma senha com 10 a 128 caracteres.'},{status:400,headers:privateHeaders});
 if(action==='login')return respond(await forward('sign-in/email',{email,password:body.password,rememberMe:true}));
 const [existing]=await db.select().from(customers).where(eq(customers.cpfHash,hash));
 if(action==='register'&&!existing)profileFields(body);
 let activated=false;
 if(action==='activate'){
 if(typeof body.code!=='string'||!existing)throw Error(invalid);
 const codeHash=await digest('customer-access:'+body.code.trim());
 const used=await db.delete(customerAccessCodes).where(and(eq(customerAccessCodes.hash,codeHash),eq(customerAccessCodes.customerId,existing.id),gt(customerAccessCodes.expiresAt,now))).returning();
 if(!used.length)throw Error('Código inválido ou expirado. Solicite um novo código à Scoppia.');activated=true;
 }else if(existing){const legacy=await getChatGPTUser();if(legacy?.userId!==existing.userId)throw Error('Este CPF já possui cadastro. Entre com sua senha ou solicite um código de ativação à Scoppia.');activated=true;}
 const [user]=await db.select().from(authUser).where(eq(authUser.email,email));
 if(user){
 if(!activated)throw Error('Este CPF já possui acesso. Entre com sua senha ou solicite um código de recuperação à Scoppia.');
 const context=await auth.$context;const password=await context.password.hash(body.password);
 await db.batch([db.update(authAccount).set({password,updatedAt:new Date()}).where(and(eq(authAccount.userId,user.id),eq(authAccount.providerId,'credential'))),db.delete(authSession).where(eq(authSession.userId,user.id))]);
 if(existing)await db.update(customers).set({userId:user.id,updatedAt:new Date().toISOString()}).where(eq(customers.id,existing.id));
 return respond(await forward('sign-in/email',{email,password:body.password,rememberMe:true}));
 }
 const name=existing?.name||(typeof body.name==='string'?body.name.trim():'');if(name.length<2||name.length>100)throw Error('Informe seu nome completo.');
 const r=await forward('sign-up/email',{name,email,password:body.password});
 if(r.ok){const [created]=await db.select().from(authUser).where(eq(authUser.email,email));if(!created)throw Error(invalid);if(existing)await db.update(customers).set({userId:created.id,updatedAt:new Date().toISOString()}).where(eq(customers.id,existing.id));else await saveCustomer(created.id,body);}
 return respond(r);
 }catch(e){return Response.json({error:e instanceof Error?e.message:invalid},{status:400,headers:privateHeaders})}
}
