import {readyStock} from '@/lib/ready-stock';
import {getAdminUser} from '@/lib/admin-auth';
import {privateHeaders} from '@/lib/customers';
export const dynamic='force-dynamic';
export async function GET(){if(!await getAdminUser())return new Response(null,{status:403,headers:privateHeaders});try{return Response.json(await readyStock(true),{headers:privateHeaders})}catch{return Response.json({error:'Não foi possível consultar a pronta entrega.'},{status:503,headers:privateHeaders})}}
