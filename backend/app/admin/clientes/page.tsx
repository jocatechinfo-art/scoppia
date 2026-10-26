import {getAdminUser} from '@/lib/admin-auth';
import AdminLogin from '../../admin-login';
import AdminClients from '../../admin-clients';
export const dynamic='force-dynamic';
export default async function Page(){return await getAdminUser()?<AdminClients/>:<AdminLogin returnTo="/admin/clientes"/>}
