import "./globals.css";
import MobileNav from "./mobile-nav";
export const viewport={width:"device-width",initialScale:1,viewportFit:"cover",themeColor:"#faf7f1"};
export const metadata = {title:"Scoppia Gourmet | Cardápio",description:"Comida boa facilita o seu dia. Escolha suas marmitas e combos."};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}<MobileNav/></body></html>}