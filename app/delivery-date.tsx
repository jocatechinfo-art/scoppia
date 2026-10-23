'use client';
import {useEffect,useState} from 'react';
import {minimumDeliveryDate} from '@/lib/delivery';
const months=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
export default function DeliveryDate(){
 const [min,setMin]=useState(''),[month,setMonth]=useState(''),[value,setValue]=useState(''),[open,setOpen]=useState(false);
 useEffect(()=>{const update=()=>{const m=minimumDeliveryDate();setMin(m);setMonth(old=>old&&old>=m.slice(0,7)?old:m.slice(0,7));setValue(old=>old&&old<m?'':old)};update();const t=setInterval(update,60000);return()=>clearInterval(t)},[]);
 const date=month?new Date(month+'-01T12:00:00Z'):null;const days=date?new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate():0;
 const choose=(day:string)=>{if(day<minimumDeliveryDate())return;setValue(day);setOpen(false)};
 const move=(delta:number)=>{if(!date)return;const next=new Date(date);next.setUTCMonth(next.getUTCMonth()+delta);setMonth(next.toISOString().slice(0,7))};
 return <fieldset className="delivery-date"><legend>Preferência de entrega <span className="muted">(opcional)</span></legend><input type="hidden" name="date" value={value}/><button type="button" className="date-trigger" aria-expanded={open} aria-controls="delivery-calendar" onClick={()=>{const m=minimumDeliveryDate();setMin(m);if(!month||month<m.slice(0,7))setMonth(m.slice(0,7));setOpen(!open)}}>{value?value.split('-').reverse().join('/'):'Escolher uma data disponível'}</button><p className="muted">{min?`Datas a partir de ${min.split('-').reverse().join('/')}, com 7 dias de antecedência.`:'Carregando datas disponíveis…'} A previsão será confirmada pela equipe.</p>
 {open&&date?<section className="delivery-calendar" id="delivery-calendar" aria-label="Calendário de entrega"><div className="calendar-head"><button type="button" aria-label="Mês anterior" disabled={month<=min.slice(0,7)} onClick={()=>move(-1)}>←</button><b aria-live="polite">{months[date.getUTCMonth()]} {date.getUTCFullYear()}</b><button type="button" aria-label="Próximo mês" onClick={()=>move(1)}>→</button></div><div className="calendar-grid">{['D','S','T','Q','Q','S','S'].map((d,i)=><span key={'w'+i} aria-hidden="true">{d}</span>)}{Array.from({length:date.getUTCDay()},(_,i)=><span key={'blank'+i}/>)}{Array.from({length:days},(_,i)=>{const day=month+'-'+String(i+1).padStart(2,'0');return day<min?<span key={day}/>:<button type="button" key={day} aria-label={'Entrega em '+day.split('-').reverse().join('/')} aria-pressed={value===day} onClick={()=>choose(day)}>{i+1}</button>})}</div><button type="button" className="access-help" onClick={()=>{setValue('');setOpen(false)}}>Deixar para combinar no atendimento</button></section>:null}
 </fieldset>
}
