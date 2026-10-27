import type {CostItem,CostRecord} from './commerce-types';
import {recipeCost} from './commerce-math';
import {usesEstimates} from './cost-estimates';

export type ProfitSoldItem={id?:string,name:string,size:string,qty:number,customDescription?:string,pricePending?:boolean,flavors?:{id?:string,name:string,qty:number}[]};
export type ProfitLine={key:string,name:string,size:string,qty:number,recipeKey:string,kind:'meal'|'combo-extra'|'unknown',description?:string};
export type ProfitOverride={key:string,mode:'recipe'|'manual',recipeKey?:string,unitCostCents?:number};
export type ProfitInputs={lines:ProfitOverride[],goodsTotalCents:number|null,feesCents:number,deliveryCostCents:number,extraCents:number,expensesReviewed:boolean,note:string};
export type ResolvedProfitLine=ProfitLine&{unitCostCents:number|null,totalCents:number|null,source:string,estimated:boolean};
export type ProfitSnapshot={lines:ResolvedProfitLine[],goodsCents:number|null,totalCostCents:number|null,revenueCents:number|null,profitCents:number|null,margin:number|null,missing:string[],estimated:boolean};
export type ProfitRecord={version:string,fingerprint:string,inputs:ProfitInputs,snapshot:ProfitSnapshot,updatedAt:string};
export type ProfitOrder={id:string,orderNumber:number|null,customerName:string,status:string,createdAt:string,items:ProfitSoldItem[],revenueCents:number|null,fingerprint:string,record:ProfitRecord|null,stale:boolean,result:ProfitSnapshot};
export type ProfitData={orders:ProfitOrder[],items:CostItem[],recipes:CostRecord[]};
export const emptyProfitInputs=():ProfitInputs=>({lines:[],goodsTotalCents:null,feesCents:0,deliveryCostCents:0,extraCents:0,expensesReviewed:false,note:''});

export function soldCostLines(sold:ProfitSoldItem[],items:CostItem[]):ProfitLine[]{
 const result:ProfitLine[]=[];
 sold.forEach((item,index)=>{
  const menu=items.find(i=>i.itemId===item.id&&i.size===item.size),key=String(index),isCombo=!!menu?.count;
  if(item.flavors?.length){
   const count=item.flavors.reduce((n,f)=>n+f.qty,0);
   if(isCombo&&count!==menu.count){result.push({key,name:item.name+' · confira os sabores',size:item.size,qty:item.qty,recipeKey:'',kind:'unknown'});return}
   item.flavors.forEach((f,j)=>result.push({key:key+':'+j,name:f.name,size:item.size,qty:f.qty*item.qty,recipeKey:f.id?JSON.stringify([f.id,item.size]):'',kind:'meal'}));
   result.push({key:key+':extra',name:'Embalagem adicional · '+item.name,size:item.size,qty:item.qty,recipeKey:menu?.key||'',kind:menu?'combo-extra':'unknown'});
  }else result.push({key,name:item.name,size:item.size,qty:item.qty,recipeKey:!isCombo&&item.id!=='personalizada'&&!item.pricePending?menu?.key||'':'',kind:isCombo?'unknown':'meal',description:item.customDescription});
 });
 return result;
}
const validCents=(value:unknown)=>Number.isSafeInteger(value)&&Number(value)>=0&&Number(value)<=10000000;
export function validateProfitInputs(raw:ProfitInputs,lines:ProfitLine[],items:CostItem[]):ProfitInputs{
 if(!raw||!Array.isArray(raw.lines)||raw.lines.length>400||typeof raw.expensesReviewed!=='boolean'||typeof raw.note!=='string'||raw.note.length>1000||![raw.feesCents,raw.deliveryCostCents,raw.extraCents].every(validCents)||raw.goodsTotalCents!==null&&!validCents(raw.goodsTotalCents))throw Error('Confira os custos e as despesas do pedido.');
 const seen=new Set<string>();
 for(const line of raw.lines){
  if(!line||typeof line.key!=='string'||seen.has(line.key)||!lines.some(l=>l.key===line.key))throw Error('Atualize os itens do pedido antes de salvar.');seen.add(line.key);
  if(line.mode==='manual'){if(!validCents(line.unitCostCents))throw Error('Informe o custo por unidade dos itens ajustados.');}
  else if(line.mode==='recipe'){if(typeof line.recipeKey!=='string'||!items.some(i=>i.key===line.recipeKey))throw Error('Selecione uma ficha de custo válida.');}
  else throw Error('Forma de cálculo inválida.');
 }
 return {lines:raw.lines.map(l=>l.mode==='manual'?{key:l.key,mode:l.mode,unitCostCents:l.unitCostCents}:{key:l.key,mode:l.mode,recipeKey:l.recipeKey}),goodsTotalCents:raw.goodsTotalCents,feesCents:raw.feesCents,deliveryCostCents:raw.deliveryCostCents,extraCents:raw.extraCents,expensesReviewed:raw.expensesReviewed,note:raw.note.trim()};
}
export function resolveOrderProfit(sold:ProfitSoldItem[],revenueCents:number|null,input:ProfitInputs,items:CostItem[],recipes:CostRecord[],frozen?:ProfitRecord|null):ProfitSnapshot{
 const lines=soldCostLines(sold,items).map((line):ResolvedProfitLine=>{
  const override=input.lines.find(i=>i.key===line.key),old=frozen?.inputs.lines.find(i=>i.key===line.key),prior=frozen?.snapshot.lines.find(i=>i.key===line.key);
  if(prior?.unitCostCents!=null&&JSON.stringify(override||null)===JSON.stringify(old||null))return {...prior,...line,totalCents:prior.unitCostCents*line.qty};
  if(override?.mode==='manual'){const cost=validCents(override.unitCostCents)?override.unitCostCents!:null;return {...line,unitCostCents:cost,totalCents:cost===null?null:cost*line.qty,source:cost===null?'Informe o custo por unidade':'Custo informado neste pedido',estimated:false};}
  const key=override?.mode==='recipe'?override.recipeKey:line.recipeKey,record=recipes.find(r=>r.key===key),item=items.find(i=>i.key===key);
  let cost=recipeCost(record,recipes);
  if(line.kind==='combo-extra'&&!override)cost=record?record.packagingCents+record.laborCents+record.otherCents:null;
  if(record&&cost===0&&!record.ingredients.length&&!record.components.length&&line.kind!=='combo-extra')cost=null;
  return {...line,unitCostCents:cost,totalCents:cost==null?null:cost*line.qty,source:cost==null?'Sem ficha equivalente':(override?'Ficha vinculada: ':'Ficha: ')+(item?item.name+' · '+item.size:'custo adicional do combo'),estimated:!!record&&(!record.version||usesEstimates(record,recipes))};
 });
 const missing:string[]=[];
 if(input.goodsTotalCents===null)for(const line of lines)if(line.totalCents===null)missing.push('Informar custo: '+line.name+' · '+line.size);
 if(!input.expensesReviewed)missing.push('Conferir taxas, entrega e outros custos');
 if(revenueCents===null)missing.push('Confirmar valores de venda e frete no pedido');
 const goodsCents=input.goodsTotalCents??(lines.some(l=>l.totalCents===null)?null:lines.reduce((n,l)=>n+l.totalCents!,0));
 const totalCostCents=goodsCents===null?null:goodsCents+input.feesCents+input.deliveryCostCents+input.extraCents;
 const profitCents=missing.length||revenueCents===null||totalCostCents===null?null:revenueCents-totalCostCents;
 return {lines,goodsCents,totalCostCents,revenueCents,profitCents,margin:profitCents===null||!revenueCents?null:profitCents/revenueCents*100,missing,estimated:input.goodsTotalCents===null&&lines.some(l=>l.estimated)};
}
