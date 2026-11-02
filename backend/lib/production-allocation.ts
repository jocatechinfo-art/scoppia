export type ProductionDemand={orderId:string,key:string,qty:number,date:string};
/** Allocate only outstanding units; respect expiry and prioritize the nearest delivery. */
export function allocateProduction(quantity:number,expiresOn:string,demands:ProductionDemand[]){
 let remaining=quantity;
 const allocations=demands.filter(d=>d.qty>0&&d.date<=expiresOn).sort((a,b)=>a.date.localeCompare(b.date)||a.orderId.localeCompare(b.orderId)).flatMap(d=>{const qty=Math.min(remaining,d.qty);remaining-=qty;return qty?[{...d,qty}]:[]});
 return {allocations,allocatedQty:quantity-remaining,stockQty:remaining};
}
