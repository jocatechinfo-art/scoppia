'use client';
import {useState} from 'react';
import {MessageCircle} from 'lucide-react';
import {orderWhatsapp,orderConfirmationWhatsapp} from '@/lib/order-whatsapp';
import type {Order} from './customer-account';
export default function OrderWhatsapp({order}:{order:Order}){
 const confirmation=order.entrySource==='admin'&&order.status==='aguardando_confirmacao';
 const [kind,setKind]=useState('');
 const selected=kind==='confirmation'&&!confirmation?'status':kind==='ready'&&order.status!=='confirmado'?'status':kind||(confirmation?'confirmation':'status');
 const message=selected==='confirmation'?orderConfirmationWhatsapp(order):orderWhatsapp(order,selected==='ready');
 return <details className="order-whatsapp report-controls"><summary><MessageCircle size={16}/> {confirmation?'Enviar pedido pelo WhatsApp para confirmação':'Avisar cliente pelo WhatsApp'}</summary>{message?<div><label>Mensagem<select value={selected} onChange={e=>setKind(e.target.value)}>{confirmation?<option value="confirmation">Resumo do pedido para o cliente confirmar</option>:null}<option value="status">Status salvo do pedido</option>{order.status==='confirmado'?<option value="ready">Marmitas prontas</option>:null}</select></label><p className="whatsapp-preview">{message.text}</p><p className="muted">Confira o texto. O WhatsApp será aberto com a mensagem; o envio é feito pela equipe. {confirmation?'Após a resposta do cliente, registre a confirmação na gestão de pedidos. Abrir o WhatsApp não altera o status.':''}</p><a className="secondary" href={message.url} target="_blank" rel="noopener noreferrer">{selected==='confirmation'?'Enviar pedido para confirmação no WhatsApp':'Abrir conversa no WhatsApp'}</a></div>:<p>Informe um telefone válido com DDD nos dados deste pedido para abrir o WhatsApp.</p>}</details>
}
