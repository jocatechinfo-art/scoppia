import {getChatGPTUser,chatGPTSignInPath} from '../chatgpt-auth';
import CustomerAccount from '../customer-account';
export const dynamic='force-dynamic';
export default async function Page(){const u=await getChatGPTUser();if(!u)return <main className="login"><a className="brand" href="/">Scoppia <small>GOURMET</small></a><div className="loginbox"><span className="eyebrow">MINHA CONTA</span><h1>Seus sabores,<br/>sua história.</h1><p>Entre para salvar seus dados pelo CPF e acompanhar seus pedidos anteriores.</p><a className="primary" target="_top" href={chatGPTSignInPath('/minha-conta')}>Entrar com ChatGPT →</a><p className="muted">Seu histórico só pode ser consultado na sua conta.</p><a href="/cardapio">← Voltar ao cardápio</a></div></main>;return <CustomerAccount/>}
