'use client';
import {useEffect,useState} from 'react';
import {emptyAddress,formatAddress,type DeliveryAddress} from '@/lib/delivery';
export default function AddressFields({initial=null}:{initial?:DeliveryAddress|null}){
 const [value,setValue]=useState<DeliveryAddress>(initial||{...emptyAddress});
 useEffect(()=>setValue(initial||{...emptyAddress}),[initial]);
 const update=(key:keyof DeliveryAddress,v:string)=>setValue(a=>({...a,[key]:key==='cep'?v.replace(/\D/g,'').slice(0,8):key==='state'?v.toUpperCase():v}));
 return <fieldset className="address-fields"><legend>Endereço de entrega</legend><p className="muted">Informe o CEP e confira todos os campos. Complemento é opcional.</p><input type="hidden" name="addressDetails" value={JSON.stringify(value)}/><input type="hidden" name="address" value={formatAddress(value)}/><div className="address-grid">
 <label>CEP<input name="cep" inputMode="numeric" autoComplete="postal-code" required pattern="[0-9]{8}" maxLength={8} placeholder="00000000" value={value.cep} onChange={e=>update('cep',e.target.value)}/></label>
 <label className="address-wide">Rua / avenida<input name="street" autoComplete="address-line1" required minLength={2} maxLength={120} value={value.street} onChange={e=>update('street',e.target.value)}/></label>
 <label>Número<input name="number" required maxLength={20} placeholder="Ex.: 123 ou S/N" value={value.number} onChange={e=>update('number',e.target.value)}/></label>
 <label>Complemento <span className="muted">(opcional)</span><input name="complement" autoComplete="address-line2" maxLength={120} placeholder="Apto., bloco, referência" value={value.complement} onChange={e=>update('complement',e.target.value)}/></label>
 <label>Bairro<input name="neighborhood" autoComplete="address-level3" required minLength={2} maxLength={100} value={value.neighborhood} onChange={e=>update('neighborhood',e.target.value)}/></label>
 <label>Cidade<input name="city" autoComplete="address-level2" required minLength={2} maxLength={100} value={value.city} onChange={e=>update('city',e.target.value)}/></label>
 <label>Estado<select name="state" autoComplete="address-level1" required value={value.state} onChange={e=>update('state',e.target.value)}><option value="">Selecione</option>{['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf=><option key={uf}>{uf}</option>)}</select></label>
 </div></fieldset>
}
