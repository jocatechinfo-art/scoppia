import {menu} from './menu';
export type CartInput={id:string,size:number,qty:number,flavors?:{id:string,qty:number}[]};
// Only catalog choices are mirrored. Free text, dietary restrictions and checkout fields stay private until ordering.
export function cartSnapshot(value:unknown){
 if(!Array.isArray(value)||value.length>150)throw Error('Carrinho inválido.');
 return value.map(c=>{if(!c||typeof c.id!=='string'||!Number.isInteger(c.size)||!Number.isInteger(c.qty)||c.qty<1||c.qty>99)throw Error('Item inválido.');const m=menu.find(m=>m.id===c.id);if(!m||c.size<0||c.size>=m.sizes.length)throw Error('Item inválido.');
 let flavors:{id:string,name:string,qty:number}[]|undefined;
 if(c.flavors!==undefined){if(m.category!=='Combos'||!Array.isArray(c.flavors)||c.flavors.length>20)throw Error('Sabores inválidos.');flavors=c.flavors.map((f:CartInput)=>{const i=menu.find(i=>i.id===f?.id);if(!i||i.category==='Combos'||!Number.isInteger(f.qty)||f.qty<1||f.qty>20)throw Error('Sabor inválido.');return {id:i.id,name:i.name,qty:f.qty}})}
 return {id:m.id,name:m.name,size:m.sizes[c.size],sizeIndex:c.size,qty:c.qty,...(flavors?{flavors}:{}),personalized:m.id==='personalizada'};
 });
}
export const validCartId=(id:unknown):id is string=>typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
