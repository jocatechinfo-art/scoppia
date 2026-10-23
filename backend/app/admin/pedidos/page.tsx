import {getChatGPTUser,chatGPTSignInPath} from '../../chatgpt-auth';
import {ADMIN} from '@/lib/customers';
import AdminOrders from '../../admin-orders';
export const dynamic='force-dynamic';
export default async function Page(){const u=await getChatGPTUser();if(u?.email.toLowerCase()!==ADMIN)return <main className="login"><h1>Administração</h1><p>Acesso exclusivo para {ADMIN}.</p><a className="primary" target="_top" href={u?'/signout-with-chatgpt?return_to=%2Fadmin%2Fpedidos':chatGPTSignInPath('/admin/pedidos')}>{u?'Trocar de conta':'Entrar na administração'}</a></main>;return <AdminOrders/>}
