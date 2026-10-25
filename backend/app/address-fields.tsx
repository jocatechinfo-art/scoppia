'use client';
import DeliveryQuote from './delivery-quote';
import {useCallback,useEffect,useRef,useState} from 'react';
import {emptyAddress,formatAddress,type DeliveryAddress} from '@/lib/delivery';
export default function AddressFields({initial=null}:{initial?:DeliveryAddress|null}){
 const [value,setValue]=useState<DeliveryAddress>(initial||{...emptyAddress}),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[failed,setFailed]=useState(false);
 const request=useRef<AbortController|null>(null),version=useRef(0),last=useRef(initial?.cep||'');
 useEffect(()=>{version.current++;request.current?.abort();last.current=initial?.cep||'';setValue(initial||{...emptyAddress});setNotice('');setBusy(false);setFailed(false)},[initial]);
 useEffect(()=>()=>request.current?.abort(),[]);
 const lookup=useCallback(async(cep:string)=>{
 if(!/^\d{8}$/.test(cep))return;const serial=++version.current;request.current?.abort();const controller=new AbortController();request.current=controller;last.current=cep;setBusy(true);setFailed(false);setNotice('Buscando endereço pelo CEP…');
 const timeout=setTimeout(()=>controller.abort(),10000);
 try{const r=await fetch('/api/cep/'+cep,{signal:controller.signal});const data=await r.json() as {street:string,neighborhood:string,city:string,state:string,error?:string};if(!r.ok)throw Error(data.error||'Não foi possível consultar o CEP.');if(serial!==version.current)return;
 setValue(current=>current.cep===cep?{...current,street:data.street,neighborhood:data.neighborhood,city:data.city,state:data.state}:current);
 setNotice(data.street?'Endereço encontrado. Informe o número e confira os dados.':'CEP encontrado. Complete rua, número e os demais campos que faltarem.');
 }catch(e){if(serial!==version.current)return;setFailed(true);setNotice(controller.signal.aborted?'A consulta demorou mais que o esperado. Preencha manualmente ou tente novamente.':e instanceof Error?e.message:'Não foi possível consultar. Preencha o endereço manualmente.')}
 finally{clearTimeout(timeout);if(serial===version.current)setBusy(false)}
 },[]);
 useEffect(()=>{if(value.cep.length!==8||last.current===value.cep)return;const t=setTimeout(()=>void lookup(value.cep),400);return()=>clearTimeout(t)},[value.cep,lookup]);
 const update=(key:keyof DeliveryAddress,v:string)=>{
 if(key==='cep'){const cep=v.replace(/\D/g,'').slice(0,8);if(cep===value.cep)return;version.current++;request.current?.abort();last.current='';setBusy(false);setNotice('');setFailed(false);setValue({...emptyAddress,cep});return}
 if(!['number','complement'].includes(key)){version.current++;request.current?.abort();setBusy(false);setNotice('');setFailed(false)}
 setValue(a=>({...a,[key]:key==='state'?v.toUpperCase():v}));
 };
 const displayCep=value.cep.length>5?value.cep.slice(0,5)+'-'+value.cep.slice(5):value.cep;
 return <fieldset className="address-fields"><legend>Endereço de entrega</legend><p className="muted">Digite o CEP para buscar o endereço. Número e complemento são preenchidos por você.</p><input type="hidden" name="addressDetails" value={JSON.stringify(value)}/><input type="hidden" name="address" value={formatAddress(value)}/><div className="address-grid">
 <div className="cep-lookup address-wide"><label>CEP<input name="cep" inputMode="numeric" autoComplete="postal-code" required pattern="[0-9]{5}-?[0-9]{3}" maxLength={9} placeholder="00000-000" value={displayCep} onChange={e=>update('cep',e.target.value)}/></label><button type="button" className="secondary" disabled={value.cep.length!==8||busy} onClick={()=>void lookup(value.cep)}>{busy?'Buscando…':'Buscar endereço'}</button></div>
 {notice?<p className={'cep-notice address-wide'+(failed?' is-error':'')} role={failed?'alert':'status'} aria-live="polite">{notice}</p>:null}
 <label className="address-wide">Rua / avenida<input name="street" autoComplete="address-line1" required minLength={2} maxLength={120} value={value.street} onChange={e=>update('street',e.target.value)}/></label>
 <label>Número<input name="number" required maxLength={20} placeholder="Ex.: 123 ou S/N" value={value.number} onChange={e=>update('number',e.target.value)}/></label>
 <label>Complemento <span className="muted">(opcional)</span><input name="complement" autoComplete="address-line2" maxLength={120} placeholder="Apto., bloco, referência" value={value.complement} onChange={e=>update('complement',e.target.value)}/></label>
 <label>Bairro<input name="neighborhood" autoComplete="address-level3" required minLength={2} maxLength={100} value={value.neighborhood} onChange={e=>update('neighborhood',e.target.value)}/></label>
 <label>Cidade<input name="city" autoComplete="address-level2" required minLength={2} maxLength={100} value={value.city} onChange={e=>update('city',e.target.value)}/></label>
 <label>Estado<select name="state" autoComplete="address-level1" required value={value.state} onChange={e=>update('state',e.target.value)}><option value="">Selecione</option>{['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf=><option key={uf}>{uf}</option>)}</select></label>
 </div><DeliveryQuote cep={value.cep}/></fieldset>
}
