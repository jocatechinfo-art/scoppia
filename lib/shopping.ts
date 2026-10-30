import {supplyCatalog} from './cost-estimates';
export type PurchaseUnit='kg'|'g'|'L'|'ml'|'un';
export type ShoppingPurchase={shoppingId:string,supplyKey:string,quantity:string,unit:string,totalCents:number,unitPriceCents:number,updatedAt:string};
export type ShoppingItem={id:string,name:string,quantity:string,unit:string,ingredientKey:string|null,purchased:boolean,purchasedAt:string|null,version:string,createdAt:string,updatedAt:string,purchase?:ShoppingPurchase|null};
export function purchaseFields(body:{supplyKey?:unknown,quantity?:unknown,unit?:unknown,totalCents?:unknown}){
 const supply=supplyCatalog().find(s=>s.key===body.supplyKey);
 if(body.supplyKey!==undefined&&body.supplyKey!==''&&!supply)throw Error('Selecione um ingrediente válido ou deixe sem vínculo.');
 const raw=String(body.quantity??'').trim().replace(',','.');
 if(!/^\d{1,7}(?:\.\d{1,3})?$/.test(raw)||Number(raw)<=0||Number(raw)>1000000)throw Error('Informe a quantidade realmente comprada, com até três casas decimais.');
 const unit=typeof body.unit==='string'?body.unit.trim():'',allowed=supply?.unit==='g'?['kg','g']:supply?.unit==='ml'?['L','ml']:['un'];
 if(!unit||unit.length>30)throw Error('Informe a unidade comprada (até 30 caracteres).');
 if(supply&&!allowed.includes(unit))throw Error('A unidade da compra deve corresponder à medida do ingrediente. Converta pacotes/caixas em kg, litros ou unidades.');
 if(!Number.isSafeInteger(body.totalCents)||Number(body.totalCents)<=0||Number(body.totalCents)>10000000)throw Error('Informe o valor total pago, maior que zero.');
 const quantity=Number(raw),baseQuantity=supply&&(unit==='g'||unit==='ml')?quantity/1000:quantity,unitPriceCents=Math.round(Number(body.totalCents)/baseQuantity);
 if(unitPriceCents<1||unitPriceCents>10000000)throw Error('Confira quantidade e valor: o preço por kg/litro/unidade ficou fora do limite.');
 return {supplyKey:supply?.key||'',quantity:String(quantity),unit,totalCents:Number(body.totalCents),unitPriceCents};
}
export function shoppingFields(body:{name?:unknown,quantity?:unknown,unit?:unknown}){
 if(typeof body.name!=='string'||body.name.trim().length<2||body.name.trim().length>120)throw Error('Informe o nome do item (2 a 120 caracteres).');
 if(typeof body.unit!=='string'||!body.unit.trim()||body.unit.trim().length>30)throw Error('Informe a unidade (até 30 caracteres).');
 const q=String(body.quantity??'').trim().replace(',','.');if(!/^\d{1,7}(?:\.\d{1,3})?$/.test(q)||Number(q)<=0||Number(q)>1000000)throw Error('Informe uma quantidade maior que zero, com até três casas decimais.');
 return {name:body.name.trim(),quantity:String(Number(q)),unit:body.unit.trim()};
}
