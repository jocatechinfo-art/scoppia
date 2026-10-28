'use client';
import {useState,useEffect,useCallback} from 'react';
export type Flavor={id:string,qty:number};
export type Line={id:string,size:number,qty:number,key?:string,flavors?:Flavor[],customDescription?:string};
const KEY='scoppia:cart:v1';
const TRACK='scoppia:cart:tracking:v1';
let pending=Promise.resolve();
const retired=new Set<string>();
export function cartTrackingId(){try{let id=localStorage.getItem(TRACK);if(!id){id=crypto.randomUUID();localStorage.setItem(TRACK,id)}return id}catch{return null}}
export function syncCart(cart:Line[],id=cartTrackingId()){if(!id||cart.length&&retired.has(id))return;const items=cart.map(({id,size,qty,flavors})=>({id,size,qty,flavors}));pending=pending.catch(()=>{}).then(async()=>{await fetch('/api/cart',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,items}),keepalive:true})}).catch(()=>{});}

export function useCart(){
 const [cart,setCart]=useState<Line[]>([]),[ready,setReady]=useState(false);
 useEffect(()=>{const load=()=>{try{const saved=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(saved))setCart(saved.filter(c=>c&&typeof c.id==='string'&&Number.isInteger(c.size)&&c.size>=0&&Number.isInteger(c.qty)&&c.qty>0&&c.qty<=99).slice(0,150).map(c=>({...c,key:typeof c.key==='string'?c.key:undefined,customDescription:typeof c.customDescription==='string'?c.customDescription.slice(0,1000):undefined,flavors:Array.isArray(c.flavors)?c.flavors.filter((f:Flavor)=>f&&typeof f.id==='string'&&Number.isInteger(f.qty)&&f.qty>0&&f.qty<=20):undefined})));}catch{}setReady(true)};load();const onShow=(event:PageTransitionEvent)=>{if(event.persisted)load()};const onStorage=(event:StorageEvent)=>{if(event.key===KEY||event.key===null)load()};window.addEventListener('pageshow',onShow);window.addEventListener('storage',onStorage);return()=>{window.removeEventListener('pageshow',onShow);window.removeEventListener('storage',onStorage)}},[]);
 useEffect(()=>{if(!ready)return;try{localStorage.setItem(KEY,JSON.stringify(cart))}catch{}let existing:string|null=null;try{existing=localStorage.getItem(TRACK)}catch{}const id=cart.length?cartTrackingId():existing;const timer=setTimeout(()=>{if(id)syncCart(cart,id)},900);const flush=()=>{if(id)syncCart(cart,id)};const visible=()=>{if(document.visibilityState==='hidden')flush()};window.addEventListener('focus',flush);window.addEventListener('pagehide',flush);document.addEventListener('visibilitychange',visible);return()=>{clearTimeout(timer);window.removeEventListener('focus',flush);window.removeEventListener('pagehide',flush);document.removeEventListener('visibilitychange',visible)}},[cart,ready]);
 const change=useCallback((id:string,size:number,delta:number,key?:string)=>setCart(old=>{const found=old.find(c=>key?c.key===key:c.id===id&&c.size===size&&!c.key);return found?old.map(c=>c===found?{...c,qty:Math.min(99,c.qty+delta)}:c).filter(c=>c.qty>0):delta>0?[...old,{id,size,qty:1}]:old}),[]);
 const saveCombo=useCallback((id:string,flavors:Flavor[],key?:string)=>setCart(old=>key?old.map(c=>c.key===key?{...c,flavors}:c):[...old,{id,size:0,qty:1,key:crypto.randomUUID(),flavors}]),[]);
 const remove=useCallback((line:Line)=>setCart(old=>old.filter(c=>line.key?c.key!==line.key:!(c.id===line.id&&c.size===line.size&&!c.key))),[]);
 const saveCustom=useCallback((description:string,qty:number)=>setCart(old=>[...old,{id:'personalizada',size:0,qty,key:crypto.randomUUID(),customDescription:description.trim()}]),[]);
 const clear=useCallback(()=>{const id=cartTrackingId();if(id){retired.add(id);syncCart([],id)}try{localStorage.removeItem(TRACK);localStorage.setItem(KEY,'[]')}catch{}setCart([])},[]);
 return {cart,change,saveCombo,remove,clear,saveCustom,ready};
}
