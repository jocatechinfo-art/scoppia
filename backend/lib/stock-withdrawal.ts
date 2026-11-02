import {inventoryDb,inventoryItems,lots,legacyBalances,lotReservedSql,reservedSql} from './inventory';
import {today,validDay} from './operations';
type Input={id:string,key:string,quantity:number,withdrawnOn:string,reason:string};
export async function withdrawalHistory(){const rows=await inventoryDb().prepare('SELECT id,name,size,quantity,withdrawn_on AS withdrawnOn,reason,actor,created_at AS createdAt FROM stock_withdrawals ORDER BY created_at DESC,id DESC LIMIT 50').all();return {history:rows.results,today:today()}}
export async function withdrawStock(b:Input,actor:string){
 if(typeof b.id!=='string'||!/^[-a-f0-9]{36}$/i.test(b.id)||typeof b.key!=='string'||b.key.length>3000||!Number.isSafeInteger(b.quantity)||b.quantity<1||b.quantity>100000||!validDay(b.withdrawnOn)||b.withdrawnOn>today()||typeof b.reason!=='string'||b.reason.trim().length<3||b.reason.length>300)throw Error('Confira item, quantidade inteira, data até hoje e motivo da retirada.');
 const db=inventoryDb(),reason=b.reason.trim(),fingerprint=JSON.stringify([b.key,b.quantity,b.withdrawnOn,reason]);
 const previous=await db.prepare('SELECT fingerprint FROM stock_withdrawals WHERE id=?').bind(b.id).first<{fingerprint:string}>();
 if(previous){if(previous.fingerprint!==fingerprint)throw Error('Identificador usado em outra retirada. Feche e abra o formulário.');return {ok:true,quantity:b.quantity}}
 const [catalog,batches,legacy]=await Promise.all([inventoryItems(),lots(),legacyBalances()]),item=catalog.find(i=>i.key===b.key);
 if(!item)throw Error('Item não encontrado. Atualize o estoque.');
 const eligible=batches.filter(l=>l.item_key===b.key&&l.available>0&&l.expires_on>=today()),legacyFree=legacy.get(b.key)||0,total=eligible.reduce((n,l)=>n+l.available,0)+legacyFree;
 if(b.quantity>total)throw Error('Saldo disponível insuficiente. Unidades reservadas para pedidos não podem ser retiradas. Atualize o estoque.');
 let remaining=b.quantity;const selected=eligible.flatMap(l=>{const take=Math.min(remaining,l.available);remaining-=take;return take?[{id:l.id,quantity:l.quantity,available:l.available,take}]:[]});
 const legacyTake=remaining,rawLegacy=legacyTake?await db.prepare('SELECT quantity FROM inventory WHERE item_key=?').bind(b.key).first<{quantity:number}>():null;
 const token=crypto.randomUUID(),now=new Date().toISOString(),guard='EXISTS(SELECT 1 FROM stock_withdrawals WHERE id=? AND token=?)';
 const legacyGuard=legacyTake?`(SELECT COUNT(*) FROM inventory WHERE item_key=? AND quantity=? AND MAX(0,quantity-${reservedSql})=?)=1`:'1=1';
 const initial=db.prepare(`INSERT INTO stock_withdrawals(id,token,fingerprint,item_key,name,size,quantity,withdrawn_on,reason,actor,created_at) SELECT ?,?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM stock_lots JOIN json_each(?) v ON stock_lots.id=json_extract(v.value,'$.id') WHERE stock_lots.quantity=json_extract(v.value,'$.quantity') AND MAX(0,stock_lots.quantity-${lotReservedSql})=json_extract(v.value,'$.available') AND expires_on>=?)=? AND ${legacyGuard} ON CONFLICT(id) DO NOTHING`).bind(b.id,token,fingerprint,b.key,item.name,item.size,b.quantity,b.withdrawnOn,reason,actor,now,JSON.stringify(selected),today(),selected.length,...(legacyTake?[b.key,rawLegacy?.quantity??-1,legacyFree]:[]));
 const queries=[initial];
 for(const l of selected)queries.push(db.prepare(`UPDATE stock_lots SET quantity=quantity-? WHERE id=? AND ${guard}`).bind(l.take,l.id,b.id,token),db.prepare(`INSERT INTO inventory_movements(id,item_key,lot_id,kind,delta,actor,reason,created_at) SELECT ?,?,?,'retirada',?,?,?,? WHERE ${guard}`).bind(b.id+':'+l.id,b.key,l.id,-l.take,actor,'Retirada em '+b.withdrawnOn+': '+reason,now,b.id,token));
 if(legacyTake)queries.push(db.prepare(`UPDATE inventory SET quantity=quantity-?,updated_at=? WHERE item_key=? AND ${guard}`).bind(legacyTake,now,b.key,b.id,token),db.prepare(`INSERT INTO inventory_movements(id,item_key,kind,delta,actor,reason,created_at) SELECT ?,?,'retirada',?,?,?,? WHERE ${guard}`).bind(b.id+':legacy',b.key,-legacyTake,actor,'Retirada em '+b.withdrawnOn+': '+reason,now,b.id,token));
 const result=await db.batch(queries);
 if(!result[0].meta.changes){const retry=await db.prepare('SELECT fingerprint FROM stock_withdrawals WHERE id=?').bind(b.id).first<{fingerprint:string}>();if(retry?.fingerprint===fingerprint)return {ok:true,quantity:b.quantity};throw Error('O saldo mudou durante a retirada. Atualize e tente novamente. Nenhum item foi retirado.')}
 return {ok:true,quantity:b.quantity};
}
