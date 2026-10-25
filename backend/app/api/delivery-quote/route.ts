import {shippingQuote} from '@/lib/shipping';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{const b=await req.json() as {cep:unknown};if(typeof b.cep!=='string')throw Error('Informe o CEP.');return Response.json(await shippingQuote(b.cep.replace(/\D/g,'')),{headers:{'Cache-Control':'no-store'}})}catch(e){return Response.json({error:e instanceof Error?e.message:'Não foi possível consultar a entrega.'},{status:400,headers:{'Cache-Control':'no-store'}})}}
