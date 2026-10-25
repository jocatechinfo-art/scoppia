import type {Commerce,Quote,CostRecord} from './commerce-types';
export function amounts(order:{items:{qty:number,pricePending?:boolean}[],totalCents:number,shippingFeeCents?:number|null,status:string},quote:Quote|null,paidCents:number){
 const custom=order.items.flatMap((i,index)=>i.pricePending?[{index,qty:i.qty}]:[]),priced=!!quote&&['pending','accepted'].includes(quote.status)&&custom.every(i=>quote.lines.some(l=>l.index===i.index));
 const subtotalCents=order.totalCents+(priced?custom.reduce((n,i)=>n+quote!.lines.find(l=>l.index===i.index)!.unitCents*i.qty,0):0),finalized=(!custom.length||quote?.status==='accepted')&&order.shippingFeeCents!=null;
 const totalCents=finalized?subtotalCents+order.shippingFeeCents!:null,balanceCents=totalCents==null?null:Math.max(0,totalCents-paidCents),creditCents=order.status==='cancelado'?paidCents:totalCents==null?0:Math.max(0,paidCents-totalCents);
 const paymentStatus:Commerce['paymentStatus']=order.status==='cancelado'?(paidCents>0?'devolver':'cancelado'):totalCents==null?'a_definir':paidCents>=totalCents?'pago':paidCents>0?'parcial':'pendente';
 return {subtotalCents,totalCents,paidCents,balanceCents,creditCents,paymentStatus};
}
export function recipeCost(record:CostRecord|undefined,records:CostRecord[]):number|null{if(!record)return null;let result=record.ingredients.reduce((n,i)=>n+i.cents,0)+record.packagingCents+record.laborCents+record.otherCents;for(const c of record.components){const child=records.find(r=>r.key===c.key);if(!child||child.components.length)return null;const cost=recipeCost(child,records);if(cost==null)return null;result+=cost*c.qty}return result}
