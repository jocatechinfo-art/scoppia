'use client';
import {useState} from 'react';
import {statuses} from '@/lib/order-status';
import {orderLabel} from '@/lib/order-number';
type StatusOrder={id:string,orderNumber?:number|null,status:string,deliveryDate:string|null};
export type StatusUpdate={id:string,status:string,deliveryDate:string|null};
export default function OrderStatusEditor({order:o,disabled=false,onSaved}:{order:StatusOrder,disabled?:boolean,onSaved:(update:StatusUpdate)=>Promise<boolean>}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 async function save(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(busy||disabled)return;const f=new FormData(e.currentTarget),status=String(f.get('status')),deliveryDate=String(f.get('deliveryDate')||'');setBusy(true);setError('');setNotice('');try{
  const r=await fetch('/api/admin/orders',{method:'PATCH',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(20000),body:JSON.stringify({id:o.id,status,deliveryDate,expectedStatus:o.status})}),body=await r.json().catch(()=>({})) as {error?:string,id?:string,status?:string,deliveryDate?:string|null};
  if(!r.ok)throw Error(body.error||(r.status===403?'A sessão expirou. Entre novamente para salvar o status.':'Não foi possível salvar a atualização.'));
  if(body.id!==o.id||body.status!==status)throw Error('Não foi possível confirmar a atualização. Atualize a lista antes de repetir.');
  const refreshed=await onSaved({id:o.id,status,deliveryDate:body.deliveryDate??null});
  setNotice(`${orderLabel(o)} salvo como ${statuses[status]}.`+(refreshed?'':' O status foi salvo, mas a lista não recarregou. Use Atualizar.'));
 }catch(e){setError(e instanceof Error?e.message:'Não foi possível confirmar o salvamento. Atualize a lista antes de repetir.')}finally{setBusy(false)}}
 return <details className="order-status-actions report-controls"><summary>Atualizar status e entrega · {statuses[o.status]||o.status}</summary><form className="statusform" onSubmit={save} onInput={()=>{if(!busy){setError('');setNotice('')}}}><label>Status<select name="status" key={o.status} defaultValue={o.status} disabled={busy||disabled}>{Object.entries(statuses).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Previsão de entrega<input key={o.deliveryDate||''} name="deliveryDate" type="date" defaultValue={o.deliveryDate||''} disabled={busy||disabled}/></label><button className="primary" disabled={busy||disabled}>{busy?'Salvando…':'Salvar atualização'}</button></form>{error?<div className="order-status-feedback is-error" role="alert"><b>Atualização não salva</b><p>{error}</p><p>Para marcar Pronto, conclua a produção. Para saída ou entrega, salve também a conferência dos itens, contato e embalagem.</p><a href="/admin/producao">Abrir produção</a></div>:null}{notice?<p className="order-status-feedback is-success" role="status">{notice}</p>:null}</details>
}
