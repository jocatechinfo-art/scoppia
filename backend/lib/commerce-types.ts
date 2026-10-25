export type QuoteLine={index:number,unitCents:number};
export type Quote={id:string,status:string,lines:QuoteLine[],shippingCents:number,note:string,createdAt:string,decidedAt:string|null};
export type PaymentEntry={id:string,amountCents:number,method:string,paidOn:string,note:string,actor:string,createdAt:string};
export type Commerce={version:string,quote:Quote|null,subtotalCents:number,totalCents:number|null,paidCents:number,balanceCents:number|null,creditCents:number,paymentStatus:'pendente'|'parcial'|'pago'|'a_definir'|'devolver'|'cancelado',deliveryMode:string,region?:string,driver?:string,sequence?:number,payments?:PaymentEntry[]};
export type Ingredient={name:string,cents:number};
export type CostComponent={key:string,qty:number};
export type CostRecord={key:string,ingredients:Ingredient[],components:CostComponent[],packagingCents:number,laborCents:number,otherCents:number,version:string,updatedAt:string};
export type CostItem={key:string,itemId:string,name:string,size:string,category:string,priceCents:number|null,count:number,active:boolean};

export const financeLabels={pendente:'Pendente',parcial:'Parcial',pago:'Pago',a_definir:'Total a definir',devolver:'Devolução pendente',cancelado:'Cancelado sem saldo'};
