'use client';
import {usePathname} from 'next/navigation';
import {House,UtensilsCrossed,Package,ShoppingBag,UserRound} from 'lucide-react';
const links=[{href:'/',label:'Início',Icon:House},{href:'/cardapio',label:'Cardápio',Icon:UtensilsCrossed},{href:'/combos',label:'Combos',Icon:Package},{href:'/pedido',label:'Pedido',Icon:ShoppingBag},{href:'/minha-conta',label:'Minha conta',Icon:UserRound}];
export default function MobileNav(){const path=usePathname();if(path.startsWith('/admin')||path.startsWith('/conectar')||path.startsWith('/auth/'))return null;return <nav className="mobile-nav" aria-label="Navegação principal no celular">{links.map(({href,label,Icon})=><a key={href} href={href} aria-current={path===href?'page':undefined}><Icon size={21} strokeWidth={1.7}/><span>{label}</span></a>)}</nav>}
