'use client';
import {useState,useEffect,useCallback} from 'react';
export type Flavor={id:string,qty:number};
export type Line={id:string,size:number,qty:number,key?:string,flavors?:Flavor[]};
const KEY='scoppia:cart:v1';
export function useCart(){
 const [cart,setCart]=useState<Line[]>([]),[ready,setReady]=useState(false);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(saved))setCart(saved.filter(c=>c&&typeof c.id==='string'&&Number.isInteger(c.size)&&c.size>=0&&Number.isInteger(c.qty)&&c.qty>0&&c.qty<=99).slice(0,150).map(c=>({...c,key:typeof c.key==='string'?c.key:undefined,flavors:Array.isArray(c.flavors)?c.flavors.filter((f:Flavor)=>f&&typeof f.id==='string'&&Number.isInteger(f.qty)&&f.qty>0&&f.qty<=20):undefined})));}catch{}setReady(true)},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem(KEY,JSON.stringify(cart))}catch{}},[cart,ready]);
 const change=useCallback((id:string,size:number,delta:number,key?:string)=>setCart(old=>{const found=old.find(c=>key?c.key===key:c.id===id&&c.size===size&&!c.key);return found?old.map(c=>c===found?{...c,qty:Math.min(99,c.qty+delta)}:c).filter(c=>c.qty>0):delta>0?[...old,{id,size,qty:1}]:old}),[]);
 const saveCombo=useCallback((id:string,flavors:Flavor[],key?:string)=>setCart(old=>key?old.map(c=>c.key===key?{...c,flavors}:c):[...old,{id,size:0,qty:1,key:crypto.randomUUID(),flavors}]),[]);
 const remove=useCallback((line:Line)=>setCart(old=>old.filter(c=>line.key?c.key!==line.key:!(c.id===line.id&&c.size===line.size&&!c.key))),[]);
 return {cart,change,saveCombo,remove,ready};
}
