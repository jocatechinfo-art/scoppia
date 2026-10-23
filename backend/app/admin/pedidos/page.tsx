import {getAdminUser} from '@/lib/admin-auth';
import AdminLogin from '../../admin-login';
import AdminOrders from '../../admin-orders';
export const dynamic='force-dynamic';
export default async function Page(){return await getAdminUser()?<AdminOrders/>:<AdminLogin returnTo="/admin/pedidos"/>}
