import {cookies} from 'next/headers';
import {appOrigin,backendOrigin} from '@/app/chatgpt-auth';
import {adminCookieName} from './admin-cookie';
export async function getAdminUser(){try{const token=(await cookies()).get(adminCookieName(appOrigin()))?.value;if(!token)return null;const origin=backendOrigin();const r=await fetch(origin+'/api/admin/session',{headers:{Cookie:adminCookieName(origin)+'='+encodeURIComponent(token)},cache:'no-store',signal:AbortSignal.timeout(10000)});return r.ok&&(await r.json() as {authenticated:boolean}).authenticated?{email:'scoppiagourmet@gmail.com'}:null}catch{return null}}
