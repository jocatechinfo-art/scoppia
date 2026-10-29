'use client';
import {useState} from 'react';
import {MessageCircle} from 'lucide-react';
import {orderWhatsapp,orderConfirmationWhatsapp} from '@/lib/order-whatsapp';
import {maskPhone} from '@/lib/input-masks';
import MaskedInput from './masked-input';
import type {Order} from './customer-account';
export default function OrderWhatsapp({order}:{order:Order}){
 const confirmation=order.entrySource==='admin'&&order.status==='aguardando_confirmacao';
 const [kind,setKind]=useState(''),[phoneOverride,setPhone]=useState<string|null>(null),[notice,setNotice]=useState('');
 const selected=kind==='confirmation'&&!confirmation?'status':kind==='ready'&&order.status!=='confirmado'?'status':kind||(confirmation?'confirmation':'status');
 const phone=phoneOverride===null?maskPhone(order.phone):phoneOverride;
 const recipient={...order,phone};
 const message=selected==='confirmation'?orderConfirmationWhatsapp(recipient):orderWhatsapp(recipient,selected==='ready');
 async function copy(){if(!message)return;try{await navigator.clipboard.writeText(message.text);setNotice('Mensagem copiada. Cole na conversa do cliente no WhatsApp.')}catch{setNotice('Não foi possível copiar automaticamente. Selecione e copie o texto da mensagem abaixo.')}}
 return <details className="order-whatsapp report-controls"><summary><MessageCircle size={16}/> {confirmation?'Enviar pedido pelo WhatsApp para confirmação':'Avisar cliente pelo WhatsApp'}</summary><div>
 <label>WhatsApp do cliente com DDD<MaskedInput mask="phone" type="tel" autoComplete="tel" value={phone} onValueChange={value=>{setPhone(value);setNotice('')}} placeholder="(11) 99999-9999"/></label>
 <p className="muted">Confira o número antes de abrir a conversa. Alterar este campo vale apenas para este envio; para salvar o contato, edite os dados do pedido.</p>
 {message?<><label>Mensagem<select value={selected} onChange={e=>{setKind(e.target.value);setNotice('')}}>{confirmation?<option value="confirmation">Resumo do pedido para o cliente confirmar</option>:null}<option value="status">Status salvo do pedido</option>{order.status==='confirmado'?<option value="ready">Marmitas prontas</option>:null}</select></label><p className="whatsapp-preview">{message.text}</p><p className="muted">Confira o texto. O envio é feito pela equipe no WhatsApp. {confirmation?'Após a resposta do cliente, registre a confirmação na gestão de pedidos. Abrir o WhatsApp não altera o status.':''}</p><div className="commerce-actions"><a className="secondary" href={message.url} target="_top">{selected==='confirmation'?'Enviar pedido para confirmação no WhatsApp':'Abrir conversa no WhatsApp'}</a><button type="button" className="secondary" onClick={()=>void copy()}>Copiar mensagem</button></div><p className="muted">Se a conversa não abrir, copie a mensagem e cole no WhatsApp do cliente.</p></>:<p role="status">Informe um telefone válido com DDD acima para preparar a mensagem e abrir o WhatsApp.</p>}
 {notice?<p role="status">{notice}</p>:null}
 </div></details>
}
