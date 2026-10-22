import {redirect} from 'next/navigation';
import {bridgeConfig} from '@/lib/bridge-config';
export const dynamic='force-dynamic';
export default async function Exit({searchParams}:{searchParams:Promise<{return_to?:string}>}){const {return_to}=await searchParams;const path=return_to?.startsWith('/')&&!return_to.startsWith('//')?return_to:'/';const config=bridgeConfig();const dest=new URL(path,config.origin);redirect(dest.origin===config.origin?dest.toString():config.origin)}
