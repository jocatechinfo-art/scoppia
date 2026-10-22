import {redirect} from 'next/navigation';
import {requireChatGPTUser} from '../chatgpt-auth';
import {getDb} from '@/db';
import {bridgeCodes} from '@/db/schema';
import {bridgeConfig} from '@/lib/bridge-config';
import {digest,base64url} from '@/lib/bridge-session';
import {lt} from 'drizzle-orm';
export const dynamic='force-dynamic';
export default async function Connect({searchParams}:{searchParams:Promise<{challenge?:string,state?:string}>}){
 const p=await searchParams;if(!p.challenge||!/^[A-Za-z0-9_-]{43}$/.test(p.challenge)||!p.state||!/^[A-Za-z0-9_-]{32,128}$/.test(p.state))return <main className="login"><h1>Conexão inválida</h1><p>Inicie o login pelo site Scoppia Gourmet.</p></main>;
 const config=bridgeConfig();const user=await requireChatGPTUser('/conectar?'+new URLSearchParams({challenge:p.challenge,state:p.state}));const code=base64url(crypto.getRandomValues(new Uint8Array(32)));const now=Math.floor(Date.now()/1000);const db=getDb();await db.delete(bridgeCodes).where(lt(bridgeCodes.expiresAt,now));await db.insert(bridgeCodes).values({codeHash:await digest(code),challenge:p.challenge,userId:user.userId,email:user.email,displayName:user.displayName,fullName:user.fullName,expiresAt:now+120});
 const url=new URL('/auth/callback',config.origin);url.searchParams.set('code',code);url.searchParams.set('state',p.state);redirect(url.toString());
}
