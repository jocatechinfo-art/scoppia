import {orderDate} from './order-report';
export function today(){return orderDate(new Date().toISOString())}
export function validDay(v:unknown):v is string{return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v}
export function daysAfter(day:string,n:number){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
export function money(c:number){return(c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
