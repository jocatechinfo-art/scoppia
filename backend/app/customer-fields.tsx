'use client';
import {useEffect,useState} from 'react';
export type Profile={name:string,phone:string,address:string,cpfMasked:string};
export default function CustomerFields({returnTo='/pedido',onReady}:{returnTo?:string,onReady?:(ready:boolean)=>void}){
 const [data,setData]=useState<{authenticated:boolean,profile:Profile|null}|null>(null),[error,setError]=useState('');
 useEffect(()=>{fetch('/api/customer',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error();setData(await r.json() as {authenticated:boolean,profile:Profile|null})}).catch(()=>setError('Não foi possível carregar seu cadastro. Atualize a página.'))},[]);
 useEffect(()=>{onReady?.(data?.authenticated===true)},[data,onReady]);
 if(error)return <p role="alert">{error}</p>;
 if(!data)return <p>Carregando cadastro…</p>;
 if(!data.authenticated)return <div className="customerlogin"><h3>Salve seus dados e seus pedidos</h3><p>Entre para vincular seu CPF ao cadastro e consultar seu histórico com segurança.</p><a className="primary" target="_top" href={'/signin-with-chatgpt?return_to='+encodeURIComponent(returnTo)}>Entrar com ChatGPT →</a></div>;
 return <fieldset className="customerfields"><legend>Seus dados</legend>{data.profile?<p className="muted">CPF vinculado: {data.profile.cpfMasked}. <a href="/minha-conta">Ver meu histórico →</a></p>:<label>CPF<input name="cpf" inputMode="numeric" autoComplete="off" required maxLength={14} placeholder="000.000.000-00"/><span className="muted">Usado para identificar seu cadastro. Não será enviado na mensagem do WhatsApp.</span></label>}<label>Nome completo<input name="name" autoComplete="name" required minLength={2} maxLength={100} defaultValue={data.profile?.name||''}/></label><label>WhatsApp com DDD<input name="phone" type="tel" autoComplete="tel" required maxLength={25} defaultValue={data.profile?.phone||''} placeholder="(11) 99999-9999"/></label><label>Endereço de entrega<textarea name="address" autoComplete="street-address" required minLength={8} maxLength={400} defaultValue={data.profile?.address||''} placeholder="Rua, número, complemento, bairro e cidade"/></label><p className="muted">Seu cadastro e os pedidos ficam salvos na sua conta. O CPF aparece mascarado e o histórico exige login.</p></fieldset>;
}
