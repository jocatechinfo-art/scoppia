'use client';
import {ClipboardList,FileText,CalendarDays,ChefHat,Package,Wallet,TrendingUp,Truck,ShoppingBasket,Calculator} from 'lucide-react';
export type OrdersView='cards'|'report'|'production'|'inventory'|'daily'|'delivery'|'finance'|'costs'|'shopping'|'profit'|'carts';
const groups=[
 {id:'orders',label:'Pedidos',icon:ClipboardList,items:[{id:'cards',label:'Gerenciar pedidos',short:'Pedidos',icon:ClipboardList},{id:'daily',label:'Hoje',short:'Hoje',icon:CalendarDays},{id:'delivery',label:'Entregas / frete',short:'Entregas',icon:Truck},{id:'carts',label:'Carrinhos não finalizados',short:'Carrinhos',icon:ShoppingBasket},{id:'report',label:'Relatório dos pedidos',short:'Relatórios',icon:FileText}]},
 {id:'kitchen',label:'Cozinha',icon:ChefHat,items:[{id:'production',label:'Produção',short:'Produção',icon:ChefHat},{id:'inventory',label:'Estoque',short:'Estoque',icon:Package},{id:'shopping',label:'Lista de compras',short:'Compras',icon:ShoppingBasket}]},
 {id:'money',label:'Financeiro',icon:Wallet,items:[{id:'profit',label:'Lucro dos pedidos',short:'Lucro dos pedidos',icon:TrendingUp},{id:'finance',label:'Pagamentos',short:'Pagamentos',icon:Wallet},{id:'costs',label:'Custos e margem',short:'Fichas de custo',icon:Calculator}]}
];
export default function OrdersMenu({view,onChange}:{view:OrdersView,onChange:(view:OrdersView)=>void}){
 const active=groups.find(g=>g.items.some(i=>i.id===view))||groups[0];
 return <nav className="orders-menu report-controls" aria-label="Menu de gestão"><div className="orders-menu-groups" role="group" aria-label="Área de gestão">{groups.map(g=><button key={g.id} type="button" aria-pressed={active.id===g.id} onClick={()=>{if(active.id!==g.id)onChange(g.items[0].id as OrdersView)}}><g.icon size={18}/><span>{g.label}</span></button>)}</div><div className="orders-menu-items" role="group" aria-label={'Funções de '+active.label}>{active.items.map(i=><button key={i.id} type="button" aria-label={i.label} aria-pressed={view===i.id} onClick={()=>onChange(i.id as OrdersView)}><i.icon size={18}/><span>{i.short}</span></button>)}</div></nav>
}
