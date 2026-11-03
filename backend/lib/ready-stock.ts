import {catalogSnapshot} from './catalog';
import {inventoryCatalog,inventoryItems,stockBalances} from './inventory';
export async function readyStock(admin=false){
 const [{items:menu},balances,catalog]=await Promise.all([catalogSnapshot(),stockBalances(),admin?inventoryItems():Promise.resolve(inventoryCatalog)]);
 const items=catalog.flatMap(row=>{const quantity=balances.get(row.key)||0;if(quantity<=0)return [];
  let id='';try{id=JSON.parse(row.key)[0]}catch{return []}
  const item=menu.find(i=>i.id===id);if(!admin&&(!item?.active||id==='personalizada'||item.category==='Combos'))return [];
  const index=item?.sizes.indexOf(row.size)??-1,price=index>=0&&item?item.prices[index]:null;
  return [{key:row.key,name:row.name,size:row.size,quantity,category:item?.category||'Personalizadas',description:id==='personalizada'?'Composição específica do pedido':item?.description||'',price:price&&price>0?price:null,active:item?.active??false}];
 }).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')||a.size.localeCompare(b.size,'pt-BR',{numeric:true}));
 return {items,updatedAt:new Date().toISOString()};
}
