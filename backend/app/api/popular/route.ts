import {popularMeals} from '@/lib/popular';
export const dynamic='force-dynamic';
export async function GET(){
 try{return Response.json(await popularMeals(),{headers:{'Cache-Control':'no-store'}})}
 catch{return Response.json({error:'Não foi possível carregar as mais pedidas.'},{status:503,headers:{'Cache-Control':'no-store'}})}
}
