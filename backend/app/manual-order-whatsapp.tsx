'use client';
import {useState} from 'react';
import type {Order} from './customer-account';
import OrderWhatsapp from './order-whatsapp';
export default function ManualOrderWhatsapp({orderId,customerId}:{orderId:string,customerId:string}){
 const [order,setOrder]=useState<Order|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function load(){setBusy(true);setError('');try{const r=await fetch('/api/admin/orders?customerId='+encodeURIComponent(customerId),{cache:'no-store'});if(!r.ok)throw Error('Não foi possível carregar o pedido salvo.');const items=await r.json() as Order[],saved=items.find(o=>o.id===orderId);if(!saved)throw Error('Pedido não encontrado. Consulte a gestão de pedidos.');setOrder(saved)}catch(e){setError(e instanceof Error?e.message:'Não foi possível preparar a mensagem.')}finally{setBusy(false)}}
 return <div className="manual-order-whatsapp">{order?<OrderWhatsapp order={order}/>:<button type="button" className="secondary" disabled={busy} onClick={()=>void load()}>{busy?'Carregando pedido salvo…':'Preparar envio pelo WhatsApp para confirmação'}</button>}{error?<p role="alert">{error}</p>:null}<p className="muted">O resumo usa os dados salvos. Se faltar o telefone, informe o número no campo do aviso ou salve o contato em Abrir pedido.</p></div>
}
