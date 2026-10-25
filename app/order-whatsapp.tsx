'use client';
import {useState} from 'react';
import {MessageCircle} from 'lucide-react';
import {orderWhatsapp} from '@/lib/order-whatsapp';
import type {Order} from './customer-account';
export default function OrderWhatsapp({order}:{order:Order}){const [kind,setKind]=useState('status');const message=orderWhatsapp(order,kind==='ready'&&order.status==='confirmado');return <details className="order-whatsapp report-controls"><summary><MessageCircle size={16}/> Avisar cliente pelo WhatsApp</summary>{message?<div><label>Mensagem<select value={order.status==='confirmado'?kind:'status'} onChange={e=>setKind(e.target.value)}><option value="status">Status salvo do pedido</option>{order.status==='confirmado'?<option value="ready">Marmitas prontas</option>:null}</select></label><p className="whatsapp-preview">{message.text}</p><p className="muted">Confira o texto. O WhatsApp será aberto com a mensagem; o envio é feito pela equipe.</p><a className="secondary" href={message.url} target="_blank" rel="noopener noreferrer">Abrir conversa no WhatsApp</a></div>:<p>Telefone inválido. Confira o número com DDD no cadastro do cliente.</p>}</details>}
