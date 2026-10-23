import type {Order} from '@/app/customer-account';
import {orderLabel} from './order-number';
export type OrderFilters={search:string,from:string,to:string,payment:string,status:string,month?:string};
export function orderDate(value:string){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value));return ['year','month','day'].map(type=>parts.find(p=>p.type===type)?.value).join('-')}
export function filterOrders<T extends Order>(rows:T[],filters:OrderFilters){const term=filters.search.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return rows.filter(o=>{const text=(o.customerName+' '+orderLabel(o)).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),day=orderDate(o.createdAt);return (!filters.month||day.slice(0,7)===filters.month)&&(!term||text.includes(term))&&(!filters.from||day>=filters.from)&&(!filters.to||day<=filters.to)&&(!filters.payment||o.paymentMethod===filters.payment)&&(!filters.status||o.status===filters.status)})}
export function orderUnits(order:Order){return order.items.reduce((n,i)=>n+i.qty*(i.flavors?.length?i.flavors.reduce((s,f)=>s+f.qty,0):1),0)}
export function orderItemsText(order:Order){return order.items.map(i=>`${i.qty} × ${i.name} (${i.size})${i.flavors?.map(f=>` · ${f.qty*i.qty} × ${f.name}`).join('')||''}${i.customDescription?' · '+i.customDescription:''}`).join(' | ')}
export function csvCell(value:unknown){return '"'+String(value??'').replace(/^[\s=+@-]/,"'$&").replaceAll('"','""')+'"'}

export function monthLabel(month:string){const names=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];return names[Number(month.slice(5,7))-1]+' '+month.slice(0,4)}
