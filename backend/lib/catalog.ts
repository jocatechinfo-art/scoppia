import {getDb} from '@/db';
import {availability,menuPrices,menuPriceState} from '@/db/schema';
import {menu} from './menu';
import {digest} from './bridge-session';
export const mealCategories=['Tradicionais','Fit','Vegetarianas','Peixes','Low carb'];
export async function catalogSnapshot(){
 const db=getDb();const [states,prices,revisions]=await db.batch([db.select().from(availability),db.select().from(menuPrices),db.select().from(menuPriceState)]);
 const active=new Map(states.map(s=>[s.id,s.active]));const amounts=new Map(prices.map(p=>[p.id,p.cents]));
 const items=menu.map(i=>({...i,active:active.get(i.id)??true,prices:i.prices.map((p,j)=>(amounts.get(i.id+':'+j)??Math.round(p*100))/100)}));
 const revision=revisions.find(s=>s.id==='catalog')?.revision??0;
 const fingerprint=await digest(JSON.stringify(items.map(i=>({id:i.id,prices:i.prices.map(p=>Math.round(p*100))}))));return {items,revision,fingerprint};
}
export function findPriceMatches(items:Awaited<ReturnType<typeof catalogSnapshot>>['items'],scope:string,fromCents:number,toCents:number){
 return items.filter(i=>scope==='todos'||(scope==='marmitas'?mealCategories.includes(i.category):scope===i.category)).flatMap(i=>i.prices.flatMap((price,sizeIndex)=>Math.round(price*100)===fromCents?[{key:i.id+':'+sizeIndex,itemId:i.id,name:i.name,category:i.category,sizeIndex,size:i.sizes[sizeIndex],fromCents,toCents}]:[]));
}
