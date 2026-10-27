export type EditableSoldItem={id?:string,name:string,size:string,qty:number,unitCents:number,customDescription?:string,pricePending?:boolean,flavors?:{id?:string,name:string,qty:number}[]};
export type OrderItemEdit={sourceIndex?:number,qty:number,customDescription?:string,size?:string,unitCents?:number|null};
export function isPersonalizedItem(item:{id?:string,customDescription?:string,pricePending?:boolean}){return item.id==='personalizada'||!!item.customDescription||item.pricePending===true}
export function editOrderItems(original:EditableSoldItem[],input:OrderItemEdit[]){
 if(!Array.isArray(input)||!input.length||input.length>100)throw Error('Inclua pelo menos um item no pedido (máximo de 100).');
 const seen=new Set<number>();let totalCents=0;
 const items=input.map(line=>{
  if(!line||!Number.isSafeInteger(line.qty)||line.qty<1||line.qty>99)throw Error('Informe quantidades inteiras entre 1 e 99.');
  let old:EditableSoldItem|undefined;
  if(line.sourceIndex!==undefined){if(!Number.isSafeInteger(line.sourceIndex)||line.sourceIndex<0||line.sourceIndex>=original.length||seen.has(line.sourceIndex))throw Error('A composição do pedido mudou. Atualize e revise os itens.');seen.add(line.sourceIndex);old=original[line.sourceIndex]}
  if(old&&!isPersonalizedItem(old)){
   if(line.customDescription!==undefined||line.size!==undefined||line.unitCents!==undefined)throw Error('O preço e a composição dos itens do cardápio são preservados nesta edição.');
   if(!Number.isSafeInteger(old.unitCents)||old.unitCents<0)throw Error('O valor original deste item precisa ser conferido.');
   totalCents+=old.unitCents*line.qty;return {...old,qty:line.qty};
  }
  if(typeof line.customDescription!=='string'||line.customDescription.trim().length<3||line.customDescription.trim().length>1000||typeof line.size!=='string'||!line.size.trim()||line.size.trim().length>50||line.unitCents!==null&&(!Number.isSafeInteger(line.unitCents)||line.unitCents!<=0||line.unitCents!>1000000))throw Error('Confira composição, porção e preço unitário das personalizadas. Deixe o preço vazio quando estiver a combinar.');
  const price=line.unitCents===null?0:line.unitCents!;totalCents+=price*line.qty;
  return {id:'personalizada',name:old?.name||'Marmita personalizada',size:line.size.trim(),qty:line.qty,unitCents:price,customDescription:line.customDescription.trim(),pricePending:line.unitCents===null};
 });
 if(!Number.isSafeInteger(totalCents)||totalCents>100000000)throw Error('Valor total dos itens fora do limite.');
 return {items,totalCents};
}
