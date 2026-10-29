import {whatsappPhone} from './input-masks';
import type {Order} from '../app/customer-account';
import {paymentLabel} from './payments';
import {orderLabel} from './order-number';
type NoticeOrder={id:string,orderNumber?:number|null,customerName:string,phone:string,status:string,deliveryDate?:string|null};
export function orderWhatsapp(order:NoticeOrder,ready=false){const phone=whatsappPhone(order.phone);if(!phone)return null;const states:Record<string,string>={confirmado:'Seu pedido está confirmado.',em_producao:'Seu pedido está em produção.',pronto:'Suas marmitas estão prontas.',saiu_entrega:'Seu pedido saiu para entrega.',aguardando_confirmacao:'Recebemos seu pedido e ele está aguardando confirmação da equipe.',entregue:'Seu pedido foi marcado como entregue.',cancelado:'Seu pedido foi cancelado.'};const text=`Olá, ${order.customerName}! Aqui é da Scoppia Gourmet.\nPedido ${orderLabel(order)}: ${ready?'Suas marmitas estão prontas.':states[order.status]||'Temos uma atualização do seu pedido.'}${order.deliveryDate&&order.status!=='cancelado'?'\nPrevisão de entrega: '+order.deliveryDate.split('-').reverse().join('/')+'.':''}\nQualquer dúvida, fale com a nossa equipe por aqui.`;return {text,url:'https://wa.me/'+phone+'?text='+encodeURIComponent(text)}}

/** Build the customer review from the saved order, without changing its status. */
export function orderConfirmationWhatsapp(order:Order){
 if(order.entrySource!=='admin'||order.status!=='aguardando_confirmacao')return null;
 const contact=orderWhatsapp(order);if(!contact)return null;
 const money=(cents:number)=>(cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 const pending=order.items.some(i=>i.pricePending)&&order.commerce?.quote?.status!=='accepted';
 const lines=order.items.map(i=>[
  `• ${i.qty} × ${i.name} (${i.size}) — ${i.pricePending?'valor a confirmar':money(i.unitCents*i.qty)}`,
  ...(i.customDescription?['  Composição: '+i.customDescription]:[]),
  ...(i.flavors||[]).map(f=>`  ${f.qty*i.qty} × ${f.name}`)
 ].join('\n'));
 const pickup=order.commerce?.deliveryMode==='retirada',shipping=order.shippingFeeCents;
 const subtotal=order.commerce?.subtotalCents??order.totalCents;
 const total=pending?null:order.commerce?.totalCents??(shipping==null?null:subtotal+shipping);
 const date=order.deliveryDate||order.preferredDate;
 const text=[`Olá, ${order.customerName}! Aqui é da Scoppia Gourmet.`,
  `Confira o pedido ${orderLabel(order)} registrado no atendimento:`, '',...lines,'',
  `${pending?'Subtotal dos valores definidos':'Subtotal'}: ${money(subtotal)}`,
  pickup?'Modalidade: Retirada':`Modalidade: Entrega\nFrete: ${shipping==null?'a combinar':money(shipping)}`,
  `Total: ${total==null?'a confirmar'+(!pending&&shipping==null?' (frete a combinar)':''):money(total)}`,
  ...(!pickup?['Endereço: '+(order.address||'a combinar')]:[]),
  `Data prevista para ${pickup?'retirada':'entrega'}: ${date?date.split('-').reverse().join('/'):'a combinar'}`,
  ...(!pickup?['Caso seja possível antecipar a entrega, entraremos em contato para combinar a realização da entrega antes da data prevista.']:[]),
  'Pagamento: '+(paymentLabel(order.paymentMethod)||'a combinar'),
  ...(order.notes?['Observações: '+order.notes]:[]),'',
  'Está tudo correto? Responda por aqui para confirmar o pedido ou informar os ajustes.',
  'A equipe registrará a confirmação após conferir sua resposta.'
 ].join('\n');
 return {text,url:contact.url.split('?')[0]+'?text='+encodeURIComponent(text)};
}
