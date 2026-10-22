import {bridgeConfig} from '@/lib/bridge-config';
import {digest,signSession} from '@/lib/bridge-session';
import {getDb} from '@/db';
import {bridgeCodes} from '@/db/schema';
import {and,eq,gt} from 'drizzle-orm';
export async function POST(req:Request){try{const b=await req.json() as {code:string,verifier:string};if(typeof b.code!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(b.code)||typeof b.verifier!=='string'||!/^[A-Za-z0-9_-]{43,128}$/.test(b.verifier))throw Error();const config=bridgeConfig();const [user]=await getDb().delete(bridgeCodes).where(and(eq(bridgeCodes.codeHash,await digest(b.code)),eq(bridgeCodes.challenge,await digest(b.verifier)),gt(bridgeCodes.expiresAt,Math.floor(Date.now()/1000)))).returning();if(!user)throw Error();const token=await signSession({userId:user.userId,email:user.email,displayName:user.displayName,fullName:user.fullName},config.secret);return Response.json({token},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Conexão expirada ou inválida. Inicie o login novamente.'},{status:400,headers:{'Cache-Control':'no-store'}})}}
