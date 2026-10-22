import {NextResponse} from 'next/server';
import {appOrigin,backendOrigin,safePath,secure,flowName} from '../chatgpt-auth';
import {base64url,digest} from '@/lib/bridge-session';
export const dynamic='force-dynamic';
export async function GET(req:Request){const url=new URL(req.url);if(req.headers.get('host')!==new URL(appOrigin()).host)return NextResponse.redirect(new URL(url.pathname+url.search,appOrigin()));const state=base64url(crypto.getRandomValues(new Uint8Array(32))),verifier=base64url(crypto.getRandomValues(new Uint8Array(32)));const dest=new URL('/conectar',backendOrigin());dest.searchParams.set('state',state);dest.searchParams.set('challenge',await digest(verifier));const response=NextResponse.redirect(dest);response.cookies.set(flowName(),JSON.stringify({state,verifier,returnTo:safePath(url.searchParams.get('return_to')||'/')}),{httpOnly:true,secure:secure(),sameSite:'lax',path:'/',maxAge:600});response.headers.set('Cache-Control','no-store');return response;}
