import type {CostItem,CostRecord} from './commerce-types';
export type PackagingItem={id:string,name:string,quantity:number,unitCostCents:number,version:string,updatedAt:string};
export type PackagingLink={id:string,target:string,packagingId:string,qty:number,version:string,updatedAt:string};
export type PackagingData={stock:PackagingItem[],links:PackagingLink[]};
export function packagingTarget(item:CostItem){return (item.count?'combo:':'portion:')+item.size}
export function packagingLinksFor(item:CostItem,links:PackagingLink[]){const exact=links.filter(l=>l.target===item.key&&l.qty>0);return exact.length?exact:links.filter(l=>l.target===packagingTarget(item)&&l.qty>0)}
export function applyPackagingCosts(records:CostRecord[],items:CostItem[],data?:PackagingData){if(!data)return records;return records.map(r=>{const item=items.find(i=>i.key===r.key),links=item?packagingLinksFor(item,data.links):[];return links.length?{...r,packagingCents:links.reduce((sum,l)=>sum+(data.stock.find(s=>s.id===l.packagingId)?.unitCostCents||0)*l.qty,0)}:r})}
export function packagingNumbers(quantity:unknown,totalCents:unknown){if(!Number.isSafeInteger(quantity)||Number(quantity)<1||Number(quantity)>1000000||!Number.isSafeInteger(totalCents)||Number(totalCents)<0||Number(totalCents)>10000000)throw Error('Informe unidades inteiras e o valor total pago.');return {quantity:Number(quantity),totalCents:Number(totalCents),unitCostCents:Math.round(Number(totalCents)/Number(quantity))}}
