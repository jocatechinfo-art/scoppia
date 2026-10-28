import {digest} from '@/lib/bridge-session';
import {getCustomerUser} from '@/lib/customer-auth';
import {inventoryDb} from '@/lib/inventory';
import {privateHeaders,sameOrigin} from '@/lib/customers';
import {cartSnapshot,validCartId} from '@/lib/cart-snapshot';
export async function POST(req:Request){
 if(!sameOrigin(req))return new Response(null,{status:403,headers:privateHeaders});
 const raw=await req.text();if(raw.length>50000)return new Response(null,{status:413,headers:privateHeaders});
 try{const b=JSON.parse(raw);if(!validCartId(b.id))throw Error('Carrinho inválido.');const items=cartSnapshot(b.items),db=inventoryDb(),stamp=new Date().toISOString(),cutoff=new Date(Date.now()-30*86400000).toISOString();
 const bucket='cart:'+await digest(req.headers.get('cf-connecting-ip')||'shared') ,now=Date.now();
 const rate=await db.prepare('INSERT INTO auth_rate_limit(id,key,count,last_request) VALUES(?,?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN last_request<? THEN 1 ELSE count+1 END,last_request=CASE WHEN last_request<? THEN excluded.last_request ELSE last_request END RETURNING count').bind(bucket,bucket,now,now-60000,now-60000).first<{count:number}>();
 if((rate?.count||0)>300)return new Response(null,{status:429,headers:privateHeaders});
 const u=await getCustomerUser();const customer=u?await db.prepare('SELECT id FROM customers WHERE user_id=? AND deleted_at IS NULL').bind(u.userId).first<{id:string}>():null;
 await db.batch([db.prepare('DELETE FROM cart_snapshots WHERE updated_at < ?').bind(cutoff),db.prepare("INSERT INTO cart_snapshots(id,customer_id,items,created_at,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET customer_id=excluded.customer_id,items=excluded.items,updated_at=excluded.updated_at WHERE cart_snapshots.converted_order_id IS NULL").bind(b.id,customer?.id||null,JSON.stringify(items),stamp,stamp)]);
 return Response.json({ok:true},{headers:privateHeaders});
 }catch{return Response.json({error:'Não foi possível atualizar o carrinho.'},{status:400,headers:privateHeaders})}
}
