'use client';
import {useState,useEffect,useCallback} from 'react';
type Line={id:string,size:number,qty:number};
const KEY='scoppia:cart:v1';
export function useCart(){
 const [cart,setCart]=useState<Line[]>([]),[ready,setReady]=useState(false);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(saved))setCart(saved.filter(c=>c&&typeof c.id==='string'&&Number.isInteger(c.size)&&c.size>=0&&Number.isInteger(c.qty)&&c.qty>0&&c.qty<=99).slice(0,150));}catch{}setReady(true)},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem(KEY,JSON.stringify(cart))}catch{}},[cart,ready]);
 const change=useCallback((id:string,size:number,delta:number)=>setCart(old=>{const found=old.find(c=>c.id===id&&c.size===size);return found?old.map(c=>c===found?{...c,qty:Math.min(99,c.qty+delta)}:c).filter(c=>c.qty>0):delta>0?[...old,{id,size,qty:1}]:old}),[]);
 return {cart,change,ready};
}
