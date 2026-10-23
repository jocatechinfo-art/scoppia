'use client';
import {useState,useEffect} from 'react';
import CustomerAccount from './customer-account';
import CustomerLogin from './customer-login';
export default function AccountGate(){const [state,setState]=useState<'loading'|'in'|'out'|'error'>('loading');useEffect(()=>{const c=new AbortController();fetch('/api/customer',{cache:'no-store',signal:c.signal}).then(async r=>{if(!r.ok)throw Error();const b=await r.json() as {authenticated:boolean};setState(b.authenticated?'in':'out')}).catch(()=>{if(!c.signal.aborted)setState('error')});return()=>c.abort()},[]);return state==='loading'?<main className="accountpage"><p role="status">Carregando sua conta…</p></main>:state==='error'?<main className="accountpage"><p role="alert">Não foi possível carregar sua conta. Atualize a página para tentar novamente.</p></main>:state==='in'?<CustomerAccount/>:<CustomerLogin/>}
