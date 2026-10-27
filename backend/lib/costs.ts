import {inventoryDb,inventoryCatalog} from './inventory';
import {mealCategories} from './catalog';
import {menu} from './menu';
import type {CostItem,CostRecord} from './commerce-types';
import {purchasePrices} from './purchase-prices';
export async function costData(){
 const db=inventoryDb();
 const [priceRows,stateRows,stored]=await db.batch([db.prepare('SELECT id,cents FROM menu_prices'),db.prepare('SELECT id,active FROM availability'),db.prepare('SELECT * FROM menu_costs')]);
 const prices=new Map((priceRows.results as {id:string,cents:number}[]).map(p=>[p.id,p.cents]));
 const states=new Map((stateRows.results as {id:string,active:number}[]).map(p=>[p.id,!!p.active]));
 const items:CostItem[]=menu.filter(i=>i.id!=='personalizada').flatMap(i=>{
  const sizes=i.category==='Combos'?i.sizes:inventoryCatalog.filter(c=>JSON.parse(c.key)[0]===i.id).map(c=>c.size);
  return sizes.map(size=>{const index=i.sizes.indexOf(size);return {key:JSON.stringify([i.id,size]),itemId:i.id,name:i.name,size,category:i.category,count:i.count||0,active:states.get(i.id)??true,priceCents:index<0?null:prices.get(i.id+':'+index)??Math.round(i.prices[index]*100)}});
 });
 const rows=stored.results as {key:string,ingredients:string,components:string,packaging_cents:number,labor_cents:number,other_cents:number,version:string,updated_at:string}[];
 const recipes:CostRecord[]=rows.map(r=>({key:r.key,ingredients:JSON.parse(r.ingredients),components:JSON.parse(r.components),packagingCents:r.packaging_cents,laborCents:r.labor_cents,otherCents:r.other_cents,version:r.version,updatedAt:r.updated_at}));
 return {items,recipes,mealCategories,purchasePrices:await purchasePrices()};
}
