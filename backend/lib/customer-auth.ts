import {betterAuth} from 'better-auth/minimal';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import {headers} from 'next/headers';
import {eq,and,gt} from 'drizzle-orm';
import {getDb} from '@/db';
import {authUser,authSession,authAccount,authVerification,authRateLimit} from '@/db/schema';
import {bridgeConfig} from './bridge-config';
import {digest} from './bridge-session';
export const customerCookie='scoppia_customer_session';
export const siteOrigin='https://scoppia-gourmet-cardapio.califanirodrigo.chatgpt.site';
export function credentialEmail(hash:string){return hash+'@cpf.scoppia.invalid'}
export async function customerAuth(origin=siteOrigin){
 const secret=await digest(bridgeConfig().secret+'|customer-auth-v1');
 return betterAuth({appName:'Scoppia Gourmet',secret,baseURL:origin,basePath:'/api/customer-auth',
 database:drizzleAdapter(getDb(),{provider:'sqlite',schema:{user:authUser,session:authSession,account:authAccount,verification:authVerification,rateLimit:authRateLimit}}),
 emailAndPassword:{enabled:true,minPasswordLength:10,maxPasswordLength:128,autoSignIn:true},
 session:{expiresIn:7*86400,updateAge:86400,cookieCache:{enabled:false}},
 rateLimit:{enabled:true,storage:'database',window:60,max:100,customRules:{'/sign-in/email':{window:60,max:30},'/sign-up/email':{window:60,max:20}}},
 advanced:{ipAddress:{ipAddressHeaders:['cf-connecting-ip']},cookies:{session_token:{name:customerCookie,attributes:{httpOnly:true,secure:origin.startsWith('https:'),sameSite:'lax',path:'/'}}}},
 trustedOrigins:[origin],telemetry:{enabled:false}});
}
export async function getCustomerUser(){
 const h=await headers();const raw=(h.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(customerCookie+'='));
 if(!raw)return null;
 let token:string;try{token=decodeURIComponent(raw.slice(customerCookie.length+1)).split('.')[0]}catch{return null}
 if(!token||token.length>256)return null;
 // Reject revoked/expired opaque tokens before entering the library's cookie-refresh path.
 // A positive lookup still requires Better Auth's signature and session verification below.
 const [active]=await getDb().select({id:authSession.id}).from(authSession).where(and(eq(authSession.token,token),gt(authSession.expiresAt,new Date()))).limit(1);if(!active)return null;
 const host=h.get('host')||'';const origin=/^(127\.0\.0\.1|localhost):\d+$/.test(host)?'http://'+host:siteOrigin;
 const response=await (await customerAuth(origin)).api.getSession({headers:new Headers({cookie:h.get('cookie')||''}),query:{disableRefresh:true},asResponse:true});
 const session=await response.json() as {user:{id:string,name:string,email:string}}|null;
 return session?{userId:session.user.id,displayName:session.user.name,email:session.user.email,fullName:session.user.name}:null;
}
