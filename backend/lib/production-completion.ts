type Line={orderId:string,key:string,qty:number};
/** A notification belongs only to an order that changes from pending to complete. */
export function completedProductionOrders<T extends {id:string}>(orders:T[],remaining:Line[],allocations:Line[]):T[]{
 const added=new Map<string,number>();for(const a of allocations){const key=JSON.stringify([a.orderId,a.key]);added.set(key,(added.get(key)||0)+a.qty)}
 return orders.filter(order=>{const lines=remaining.filter(l=>l.orderId===order.id);return lines.some(l=>l.qty>0)&&lines.every(l=>l.qty<=(added.get(JSON.stringify([l.orderId,l.key]))||0))});
}
