'use client';
import {useLayoutEffect,useRef,useState,type InputHTMLAttributes} from 'react';
import {applyInputMask,type InputMask} from '@/lib/input-masks';
type Props=Omit<InputHTMLAttributes<HTMLInputElement>,'value'|'defaultValue'|'onChange'> & {mask:InputMask,value?:string,defaultValue?:string,onValueChange?:(value:string)=>void};
export default function MaskedInput({mask,value,defaultValue='',onValueChange,...props}:Props){
 const [draft,setDraft]=useState(()=>applyInputMask(defaultValue,mask));
 const input=useRef<HTMLInputElement>(null),cursor=useRef<number|null>(null);
 const displayed=applyInputMask(value===undefined?draft:value,mask);
 useLayoutEffect(()=>{if(cursor.current!==null&&input.current){input.current.setSelectionRange(cursor.current,cursor.current);cursor.current=null}},[displayed]);
 return <input {...props} ref={input} inputMode={mask==='phone'?'tel':'numeric'} maxLength={mask==='cpf'?14:mask==='cep'?9:19} value={displayed} onChange={e=>{const raw=e.target.value,position=e.target.selectionStart??raw.length,digits=raw.slice(0,position).replace(/\D/g,'').length,next=applyInputMask(raw,mask);let n=0,end=0;while(end<next.length&&n<digits){if(/\d/.test(next[end]))n++;end++}cursor.current=end;setDraft(next);onValueChange?.(next)}}/>;
}
