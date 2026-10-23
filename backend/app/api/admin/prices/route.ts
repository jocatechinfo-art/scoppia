import {env} from 'cloudflare:workers';
import {getAdminUser} from '@/lib/admin-auth';
import {catalogSnapshot,findPriceMatches} from '@/lib/catalog';
import {menu} from '@/lib/menu';
import {ADMIN,privateHeaders,sameOrigin} from '@/lib/customers';
export const dynamic='force-dynamic';
export async function POST(req:Request){const raw=await req.text();
 const u=await getAdminUser();if(u?.email.toLowerCase()!==ADMIN)return Response.json({error:'Acesso restrito ao administrador.'},{status:403,headers:privateHeaders});if(!sameOrigin(req))return new Response(null,{status:403});
 try{const b=JSON.parse(raw) as {action:string,scope:string,fromCents:number,toCents:number,revision?:number,fingerprint?:string};
 if(!['preview','apply'].includes(b.action)||!['marmitas','todos',...menu.map(i=>i.category)].includes(b.scope)||!Number.isInteger(b.fromCents)||!Number.isInteger(b.toCents)||b.fromCents<1||b.toCents<1||b.fromCents>999999||b.toCents>999999||b.fromCents===b.toCents)throw Error('Informe valores diferentes e válidos, maiores que zero.');
 const current=await catalogSnapshot(),matches=findPriceMatches(current.items,b.scope,b.fromCents,b.toCents);
 if(b.action==='preview')return Response.json({revision:current.revision,fingerprint:current.fingerprint,matches},{headers:privateHeaders});
 if(b.revision!==current.revision||b.fingerprint!==current.fingerprint)return Response.json({error:'Os preços mudaram desde a prévia. Confira uma nova prévia antes de aplicar.'},{status:409,headers:privateHeaders});
 if(!matches.length)throw Error('Nenhuma opção encontrada com esse preço.');
 if(!env.DB)throw Error('Banco indisponível.');const id=crypto.randomUUID(),details=JSON.stringify(matches),now=new Date().toISOString();
 const result=await env.DB.batch([
 env.DB.prepare("INSERT INTO menu_price_state (id, revision, last_batch_id) VALUES ('catalog', 0, NULL) ON CONFLICT(id) DO NOTHING"),
 env.DB.prepare("UPDATE menu_price_state SET revision=revision+1, last_batch_id=? WHERE id='catalog' AND revision=?").bind(id,current.revision),
 env.DB.prepare("INSERT INTO menu_prices (id,item_id,size_index,cents) SELECT json_extract(value,'$.key'),json_extract(value,'$.itemId'),json_extract(value,'$.sizeIndex'),json_extract(value,'$.toCents') FROM json_each(?) WHERE (SELECT last_batch_id FROM menu_price_state WHERE id='catalog')=? ON CONFLICT(id) DO UPDATE SET cents=excluded.cents").bind(details,id),
 env.DB.prepare("INSERT INTO menu_price_changes (id,admin_email,created_at,scope,from_cents,to_cents,changed_count,details) SELECT ?,?,?,?,?,?,?,? WHERE (SELECT last_batch_id FROM menu_price_state WHERE id='catalog')=?").bind(id,u.email,now,b.scope,b.fromCents,b.toCents,matches.length,details,id)
 ]);
 if(result[1].meta.changes!==1)return Response.json({error:'Outra alteração foi aplicada. Gere uma nova prévia.'},{status:409,headers:privateHeaders});return Response.json({ok:true,count:matches.length,revision:current.revision+1},{headers:privateHeaders});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Não foi possível atualizar os preços.'},{status:400,headers:privateHeaders})}
}
