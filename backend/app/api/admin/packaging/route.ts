import {getAdminUser} from '@/lib/admin-auth';
import {privateHeaders,sameOrigin} from '@/lib/customers';
import {inventoryDb} from '@/lib/inventory';
import {packagingData} from '@/lib/packaging';
import {packagingNumbers,packagingTarget} from '@/lib/packaging-costs';
import {costData} from '@/lib/costs';
export const dynamic='force-dynamic';
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:privateHeaders});
const validId=(s:unknown)=>typeof s==='string'&&/^[-a-zA-Z0-9]{16,80}$/.test(s);
export async function GET(){if(!await getAdminUser())return new Response(null,{status:403,headers:privateHeaders});const [data,costs,history]=await Promise.all([packagingData(),costData(),inventoryDb().prepare('SELECT m.id,m.packaging_id AS packagingId,m.kind,m.delta,m.total_cents AS totalCents,m.balance,m.note,m.created_at AS createdAt,p.name FROM packaging_movements m JOIN packaging_stock p ON p.id=m.packaging_id ORDER BY m.created_at DESC,m.id DESC LIMIT 100').all()]);return reply({...data,items:costs.items,history:history.results})}
async function mutate(req:Request,action:'create'|'move'|'link'){
 const user=await getAdminUser();if(!user||!sameOrigin(req))return new Response(null,{status:403,headers:privateHeaders});
 try{const raw=await req.text();if(raw.length>4000)throw Error('Registro muito longo.');const b=JSON.parse(raw),db=inventoryDb(),now=new Date().toISOString(),token=crypto.randomUUID();
 if(action==='create'){
  if(!validId(b.id)||typeof b.name!=='string'||b.name.trim().length<2||b.name.length>100)throw Error('Informe o nome da embalagem.');
  const f=packagingNumbers(b.quantity,b.totalCents);
  const r=await db.batch([db.prepare('INSERT INTO packaging_stock(id,name,quantity,unit_cost_cents,version,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(b.id,b.name.trim(),f.quantity,f.unitCostCents,token,now),db.prepare("INSERT INTO packaging_movements(id,packaging_id,kind,delta,total_cents,balance,note,actor,created_at) SELECT ?,id,'entrada',quantity,?,quantity,'Estoque inicial',?,? FROM packaging_stock WHERE id=? AND version=?").bind(token,f.totalCents,user.email,now,b.id,token)]);
  if(!r[0].meta.changes)return reply({error:'Cadastro já recebido. Atualize para conferir.'},409);
 }else if(action==='move'){
  if(!validId(b.id)||!validId(b.requestId)||typeof b.version!=='string'||!['entrada','saida'].includes(b.kind)||typeof b.note!=='string'||b.note.length>200)throw Error('Confira a movimentação.');
  const f=packagingNumbers(b.quantity,b.kind==='entrada'?b.totalCents:0),delta=b.kind==='entrada'?f.quantity:-f.quantity;
  const prior=await db.prepare('SELECT packaging_id,kind,delta,total_cents,note FROM packaging_movements WHERE id=?').bind(b.requestId).first<{packaging_id:string,kind:string,delta:number,total_cents:number,note:string}>();
  if(prior){if(prior.packaging_id!==b.id||prior.kind!==b.kind||prior.delta!==delta||prior.total_cents!==f.totalCents||prior.note!==b.note.trim())return reply({error:'Identificador já usado por outra movimentação.'},409);return reply({ok:true,replayed:true})}
  const r=await db.batch([db.prepare(`UPDATE packaging_stock SET quantity=quantity+?,unit_cost_cents=CASE WHEN ?='entrada' THEN ? ELSE unit_cost_cents END,version=?,updated_at=? WHERE id=? AND version=? AND quantity+? BETWEEN 0 AND 1000000 AND NOT EXISTS(SELECT 1 FROM packaging_movements WHERE id=?)`).bind(delta,b.kind,f.unitCostCents,token,now,b.id,b.version,delta,b.requestId),db.prepare('INSERT INTO packaging_movements(id,packaging_id,kind,delta,total_cents,balance,note,actor,created_at) SELECT ?,id,?,?,?,quantity,?,?,? FROM packaging_stock WHERE id=? AND version=?').bind(b.requestId,b.kind,delta,f.totalCents,b.note.trim(),user.email,now,b.id,token)]);
  if(!r[0].meta.changes)return reply({error:'Saldo insuficiente ou estoque alterado em outro acesso. Atualize antes de registrar.'},409);
 }else{
  const costs=await costData(),targets=new Set(costs.items.flatMap(i=>[i.key,packagingTarget(i)]));
  if(!validId(b.packagingId)||typeof b.target!=='string'||!targets.has(b.target)||!Number.isSafeInteger(b.qty)||b.qty<0||b.qty>100||typeof b.version!=='string')throw Error('Escolha a porção ou item e as unidades utilizadas.');
  const id=JSON.stringify([b.target,b.packagingId]);const r=await db.prepare(`INSERT INTO packaging_links(id,target,packaging_id,qty,version,updated_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM packaging_stock WHERE id=?) AND ?=COALESCE((SELECT version FROM packaging_links WHERE id=?),'') ON CONFLICT(id) DO UPDATE SET qty=excluded.qty,version=excluded.version,updated_at=excluded.updated_at WHERE packaging_links.version=?`).bind(id,b.target,b.packagingId,b.qty,token,now,b.packagingId,b.version,id,b.version).run();if(!r.meta.changes)return reply({error:'O vínculo mudou. Atualize e tente novamente.'},409);
 }
 return reply({ok:true});
 }catch(e){return reply({error:e instanceof Error?e.message:'Não foi possível salvar a embalagem.'},400)}
}
export const POST=(req:Request)=>mutate(req,'create');
export const PATCH=(req:Request)=>mutate(req,'move');
export const PUT=(req:Request)=>mutate(req,'link');
