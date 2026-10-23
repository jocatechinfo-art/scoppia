import {getAdminUser} from '@/lib/admin-auth';
import AdminLogin from '../../admin-login';
import ProductionReport from '../../production-report';
export const dynamic='force-dynamic';
export default async function Page(){return await getAdminUser()?<ProductionReport/>:<AdminLogin returnTo="/admin/producao"/>}
