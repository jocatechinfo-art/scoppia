export function orderLabel(order:{id:string,orderNumber?:number|null}){return order.orderNumber!=null?'SG_'+String(order.orderNumber).padStart(3,'0'):order.id.slice(0,8).toUpperCase()}
