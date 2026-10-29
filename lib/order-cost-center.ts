import type {CostItem,CostRecord,CostUnit,PurchasePrice} from './commerce-types';
import {ingredientSupplyKey,priceRecipes} from './cost-estimates';
import {emptyProfitInputs,soldCostLines,type ProfitInputs,type ProfitSoldItem} from './order-profit';
export type CenterIngredient={key:string,name:string,unit:CostUnit|null,quantity:number|null,costCents:number,unitPriceCents:number|null,purchase:PurchasePrice|null};
export type OrderCostCenter={ingredients:CenterIngredient[],ingredientsCents:number,purchasedIngredientsCents:number,packagingCents:number,laborCents:number,otherCents:number,manualCents:number,expensesCents:number,expensesReviewed:boolean,goodsCents:number|null,totalCostCents:number|null,profitCents:number|null,missing:string[],manualTotal:boolean};
/** Live estimate, separate from the explicitly saved order-profit snapshot.
 * Ingredient quantities are already raw purchase quantities (cooking yield included).
 * Allocate only consumption to an order, never the entire shopping receipt.
 */
export function orderCostCenter(sold:ProfitSoldItem[],revenue:number|null,items:CostItem[],records:CostRecord[],prices:PurchasePrice[],inputs:ProfitInputs=emptyProfitInputs()):OrderCostCenter{
 const recipes=priceRecipes(records,prices),rows=new Map<string,CenterIngredient>();
 const missing:string[]=[];let packaging=0,labor=0,other=0,manual=0;
 function walk(key:string,qty:number,extrasOnly=false,trail:string[]=[]){
  const r=recipes.find(r=>r.key===key);
  if(!r||trail.includes(key)||trail.length>10){missing.push('Ficha ausente ou composição inválida: '+(items.find(i=>i.key===key)?.name||key||'item personalizado'));return}
  packaging+=r.packagingCents*qty;labor+=r.laborCents*qty;other+=r.otherCents*qty;
  if(extrasOnly)return;
  if(!r.ingredients.length&&!r.components.length&&!r.packagingCents&&!r.laborCents&&!r.otherCents){missing.push('Ficha sem custos: '+(items.find(i=>i.key===key)?.name||key));return}
  for(const i of r.ingredients){
   const supply=ingredientSupplyKey(i),purchase=prices.find(p=>p.supplyKey===supply&&p.unit===i.unit)||null;
   const rowKey=JSON.stringify([supply||i.name,i.unit||null,i.unitPriceCents??null,purchase?.shoppingId||null]);
   const quantity=i.quantity===undefined?null:i.quantity*qty,old=rows.get(rowKey);
   if(old){old.quantity=old.quantity===null||quantity===null?null:old.quantity+quantity;old.costCents+=i.cents*qty}
   else rows.set(rowKey,{key:rowKey,name:i.name,unit:i.unit||null,quantity,costCents:i.cents*qty,unitPriceCents:i.unitPriceCents??null,purchase});
  }
  for(const child of r.components)walk(child.key,qty*child.qty,false,[...trail,key]);
 }
 if(inputs.goodsTotalCents!==null)manual=inputs.goodsTotalCents;
 else for(const line of soldCostLines(sold,items)){
  const override=inputs.lines.find(l=>l.key===line.key);
  if(override?.mode==='manual'){if(override.unitCostCents===undefined)missing.push('Informar custo: '+line.name);else manual+=override.unitCostCents*line.qty;continue}
  const key=override?.mode==='recipe'?override.recipeKey||'':line.recipeKey;
  if(!key){missing.push('Vincular ficha ou informar custo: '+line.name+' · '+line.size);continue}
  walk(key,line.qty,line.kind==='combo-extra'&&!override);
 }
 const ingredients=[...rows.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
 const ingredientsCents=ingredients.reduce((n,i)=>n+i.costCents,0),goodsCents=missing.length?null:ingredientsCents+packaging+labor+other+manual;
 const expensesCents=inputs.feesCents+inputs.deliveryCostCents+inputs.extraCents,totalCostCents=goodsCents===null?null:goodsCents+expensesCents;
 return {ingredients,ingredientsCents,purchasedIngredientsCents:ingredients.filter(i=>i.purchase).reduce((n,i)=>n+i.costCents,0),packagingCents:packaging,laborCents:labor,otherCents:other,manualCents:manual,expensesCents,expensesReviewed:inputs.expensesReviewed,goodsCents,totalCostCents,profitCents:revenue===null||totalCostCents===null?null:revenue-totalCostCents,missing:[...new Set(missing)],manualTotal:inputs.goodsTotalCents!==null};
}
