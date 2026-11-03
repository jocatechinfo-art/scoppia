import {readyStock} from '@/lib/ready-stock';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await readyStock(),{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Não foi possível consultar a pronta entrega. Tente atualizar.'},{status:503,headers:{'Cache-Control':'no-store'}})}}
