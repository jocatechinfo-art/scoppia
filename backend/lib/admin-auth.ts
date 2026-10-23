import {env} from 'cloudflare:workers';
import {headers} from 'next/headers';
import {bridgeConfig} from './bridge-config';
import {digest,verifySession,signSession} from './bridge-session';
import {adminCookieName} from './admin-cookie';
import {ADMIN} from './customers';
export function adminPasswordHash(){return (env as unknown as {SCOPPIA_ADMIN_PASSWORD_HASH?:string}).SCOPPIA_ADMIN_PASSWORD_HASH||''}
async function signingSecret(){const hash=adminPasswordHash();if(!hash)throw Error('Acesso administrativo indisponível.');return digest(bridgeConfig().secret+'|admin-password-v1|'+hash)}
export async function adminToken(){return signSession({userId:'scoppia-admin-password',email:ADMIN,displayName:'Administração Scoppia',fullName:null},await signingSecret(),8*3600)}
export async function getAdminUser(){try{const h=await headers(),host=h.get('host')||'',origin=/^(127\.0\.0\.1|localhost):\d+$/.test(host)?'http://'+host:'https://'+host,name=adminCookieName(origin);const raw=(h.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));if(!raw)return null;const user=await verifySession(decodeURIComponent(raw.slice(name.length+1)),await signingSecret());return user?.userId==='scoppia-admin-password'&&user.email===ADMIN?user:null}catch{return null}}
