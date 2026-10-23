import {getAdminUser} from '@/lib/admin-auth';
import AdminLogin from '../admin-login';
import Catalog from '../catalog';
export const dynamic='force-dynamic';
export default async function Admin(){return await getAdminUser()?<Catalog admin/>:<AdminLogin/>}
