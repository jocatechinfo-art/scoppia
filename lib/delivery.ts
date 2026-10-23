export function minimumDeliveryDate(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const get=(key:string)=>parts.find(p=>p.type===key)!.value;
 const day=new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00Z`);day.setUTCDate(day.getUTCDate()+7);return day.toISOString().slice(0,10);
}
export type DeliveryAddress={cep:string,street:string,number:string,complement:string,neighborhood:string,city:string,state:string};
export const emptyAddress:DeliveryAddress={cep:'',street:'',number:'',complement:'',neighborhood:'',city:'',state:''};
export function formatAddress(a:DeliveryAddress){return `${a.street}, ${a.number}${a.complement?' · '+a.complement:''} · ${a.neighborhood} · ${a.city}/${a.state} · CEP ${a.cep.slice(0,5)}-${a.cep.slice(5)}`;}
export function validateAddress(value:unknown){
 let a:unknown=value;if(typeof a==='string'){try{a=JSON.parse(a)}catch{throw Error('Confira os dados do endereço.')}}
 if(!a||typeof a!=='object')throw Error('Preencha o CEP e o endereço de entrega.');
 const data={...emptyAddress};for(const key of Object.keys(data) as (keyof DeliveryAddress)[]){const v=(a as Record<string,unknown>)[key];if(typeof v!=='string'||v.length>120)throw Error('Confira os campos do endereço.');data[key]=v.trim();}
 data.cep=data.cep.replace(/\D/g,'');data.state=data.state.toUpperCase();
 if(!/^\d{8}$/.test(data.cep))throw Error('Informe um CEP com 8 números.');
 if(data.street.length<2||!data.number||data.neighborhood.length<2||data.city.length<2||!['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].includes(data.state))throw Error('Complete rua, número, bairro, cidade e estado.');
 if(formatAddress(data).length>600)throw Error('O endereço está muito longo.');return data;
}
