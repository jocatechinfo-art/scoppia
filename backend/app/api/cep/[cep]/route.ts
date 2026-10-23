export const dynamic='force-dynamic';
export async function GET(_req:Request,{params}:{params:Promise<{cep:string}>}){
 const {cep}=await params;if(!/^\d{8}$/.test(cep))return Response.json({error:'Informe um CEP com 8 números.'},{status:400});
 try{const r=await fetch('https://viacep.com.br/ws/'+cep+'/json/',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(5000)});
 if(!r.ok)throw Error();const data=await r.json() as Record<string,unknown>;
 if(data.erro===true||data.erro==='true')return Response.json({error:'CEP não encontrado. Confira os números ou preencha o endereço manualmente.'},{status:404,headers:{'Cache-Control':'no-store'}});
 if(typeof data.uf!=='string'||!/^[A-Z]{2}$/.test(data.uf)||typeof data.localidade!=='string'||!data.localidade)throw Error();
 const field=(key:string)=>typeof data[key]==='string'?(data[key] as string).slice(0,120):'';
 return Response.json({cep,street:field('logradouro'),neighborhood:field('bairro'),city:field('localidade'),state:field('uf')},{headers:{'Cache-Control':'public, max-age=86400'}});
 }catch{return Response.json({error:'A consulta de CEP está indisponível agora. Você pode preencher o endereço manualmente.'},{status:503,headers:{'Cache-Control':'no-store'}})}
}
