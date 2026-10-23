import {getDb} from '@/db';
import {comboRules} from '@/db/schema';
import {getComboRules} from '@/lib/combo-rules';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {ADMIN,privateHeaders,sameOrigin} from '@/lib/customers';
import {menu} from '@/lib/menu';
export const dynamic='force-dynamic';
export async function GET(){return Response.json(await getComboRules(),{headers:{'Cache-Control':'no-store'}})}
export async function PATCH(req:Request){
 const user=await getChatGPTUser();if(user?.email.toLowerCase()!==ADMIN||!sameOrigin(req))return new Response(null,{status:403});
 try{const b=await req.json() as {id:string,minPerFlavor:number};const item=menu.find(i=>i.id===b.id&&i.category==='Combos');
 if(!item||!Number.isInteger(b.minPerFlavor)||b.minPerFlavor<1||b.minPerFlavor>item.count!)throw Error('O mínimo por sabor deve ser um número inteiro entre 1 e a quantidade do combo.');
 await getDb().insert(comboRules).values(b).onConflictDoUpdate({target:comboRules.id,set:{minPerFlavor:b.minPerFlavor}});
 return Response.json({ok:true},{headers:privateHeaders});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Não foi possível salvar a regra.'},{status:400,headers:privateHeaders})}
}
