import {cookies} from 'next/headers';
import {verifySession} from '@/lib/bridge-session';
import {redirect} from 'next/navigation';
export type ChatGPTUser={userId:string,email:string,displayName:string,fullName:string|null};
export function appOrigin(){return new URL(process.env.APP_ORIGIN||'https://scoppia-gourmet.vercel.app').origin;}
export function backendOrigin(){const u=new URL(process.env.SCOPPIA_BACKEND_ORIGIN||'https://scoppia-gourmet-cardapio.califanirodrigo.chatgpt.site');if(u.protocol!=='https:'&&!['127.0.0.1','localhost'].includes(u.hostname))throw Error('Invalid backend');return u.origin;}
export function secure(){return appOrigin().startsWith('https:');}
export function sessionName(){return secure()?'__Host-scoppia_session':'scoppia_session';}
export function flowName(){return secure()?'__Host-scoppia_login':'scoppia_login';}
export function safePath(v:string){try{const url=new URL(v,appOrigin());return v.startsWith('/')&&!v.startsWith('//')&&url.origin===appOrigin()?url.pathname+url.search+url.hash:'/';}catch{return '/';}}
export async function getChatGPTUser():Promise<ChatGPTUser|null>{const token=(await cookies()).get(sessionName())?.value;const secret=process.env.SCOPPIA_BRIDGE_SECRET;return token&&secret?verifySession(token,secret):null;}
export function chatGPTSignInPath(returnTo:string){return '/signin-with-chatgpt?return_to='+encodeURIComponent(safePath(returnTo));}
export function chatGPTSignOutPath(returnTo='/'){return '/signout-with-chatgpt?return_to='+encodeURIComponent(safePath(returnTo));}
export async function requireChatGPTUser(returnTo:string){const user=await getChatGPTUser();if(user)return user;redirect(chatGPTSignInPath(returnTo));}
