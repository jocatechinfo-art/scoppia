export type ShoppingItem={id:string,name:string,quantity:string,unit:string,purchased:boolean,purchasedAt:string|null,version:string,createdAt:string,updatedAt:string};
export function shoppingFields(body:{name?:unknown,quantity?:unknown,unit?:unknown}){
 if(typeof body.name!=='string'||body.name.trim().length<2||body.name.trim().length>120)throw Error('Informe o nome do item (2 a 120 caracteres).');
 if(typeof body.unit!=='string'||!body.unit.trim()||body.unit.trim().length>30)throw Error('Informe a unidade (até 30 caracteres).');
 const q=String(body.quantity??'').trim().replace(',','.');if(!/^\d{1,7}(?:\.\d{1,3})?$/.test(q)||Number(q)<=0||Number(q)>1000000)throw Error('Informe uma quantidade maior que zero, com até três casas decimais.');
 return {name:body.name.trim(),quantity:String(Number(q)),unit:body.unit.trim()};
}
