import {env} from 'cloudflare:workers';
import {eq} from 'drizzle-orm';
import {getDb} from '@/db';
import {customers,authUser} from '@/db/schema';
import {normalizeCpf} from './cpf';
import {validateAddress,formatAddress} from './delivery';
export const ADMIN='scoppiagourmet@gmail.com';
export const privateHeaders={'Cache-Control':'private, no-store, max-age=0','Vary':'Cookie'};
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}
export async function cpfHash(value:unknown){const cpf=normalizeCpf(value);const secret=(env as unknown as {CUSTOMER_CPF_KEY?:string}).CUSTOMER_CPF_KEY;if(!secret)throw Error('Cadastro temporariamente indisponível. Tente novamente mais tarde.');const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const bytes=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(cpf));return {hash:Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join(''),last:cpf.slice(-2)};}
export function profileFields(b:{name:unknown,phone:unknown,address:unknown,addressDetails?:unknown}){
 if(typeof b.name!=='string'||b.name.trim().length<2||b.name.length>100)throw Error('Informe seu nome completo.');if(typeof b.phone!=='string'||b.phone.length>25||!/^[\d()+\s-]+$/.test(b.phone))throw Error('Informe seu WhatsApp com DDD.');const phone=b.phone.replace(/\D/g,'');if(phone.length<10||phone.length>13)throw Error('Informe seu WhatsApp com DDD.');const delivery=validateAddress(b.addressDetails);return {name:b.name.trim(),phone,address:formatAddress(delivery),addressDetails:JSON.stringify(delivery)};
}
export async function saveCustomer(userId:string,b:{cpf?:unknown,name:unknown,phone:unknown,address:unknown,addressDetails?:unknown}){
 const db=getDb();const fields=profileFields(b);const [existing]=await db.select().from(customers).where(eq(customers.userId,userId));const now=new Date().toISOString();
 if(existing){if(b.cpf){const c=await cpfHash(b.cpf);if(c.hash!==existing.cpfHash)throw Error('O CPF está vinculado ao cadastro. Para corrigir, fale com a Scoppia.');}await db.update(customers).set({...fields,updatedAt:now}).where(eq(customers.id,existing.id));return {...existing,...fields,updatedAt:now};}
 const c=await cpfHash(b.cpf);const [credential]=await db.select().from(authUser).where(eq(authUser.id,userId));if(!credential||credential.email!==c.hash+'@cpf.scoppia.invalid')throw Error('Use o CPF informado na criação da sua conta.');const row={id:crypto.randomUUID(),userId,cpfHash:c.hash,cpfLast:c.last,...fields,createdAt:now,updatedAt:now};
 try{await db.insert(customers).values(row)}catch{throw Error('Não foi possível vincular este CPF à conta. Entre com o CPF e a senha do cadastro ou fale com a Scoppia.');}return row;
}
export function publicProfile(c:typeof customers.$inferSelect){return {name:c.name,phone:c.phone,address:c.address,addressDetails:c.addressDetails?JSON.parse(c.addressDetails):null,cpfMasked:'***.***.***-'+c.cpfLast};}
