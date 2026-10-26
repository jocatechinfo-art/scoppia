import {getAdminUser} from '@/lib/admin-auth';
import AdminLogin from '../../admin-login';
import AdminLogout from '../../admin-logout';
import ShoppingList from '../../shopping-list';
export const dynamic='force-dynamic';
export default async function Page(){return await getAdminUser()?<main className="accountpage orders-dashboard"><div className="orders-topbar report-controls"><a href="/admin">← Painel administrativo</a><div><a className="secondary" href="/admin/pedidos">Pedidos e produção</a><AdminLogout/></div></div><ShoppingList/></main>:<AdminLogin returnTo="/admin/compras"/>}
