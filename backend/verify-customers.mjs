import assert from 'node:assert/strict';
const b='http://127.0.0.1:5173';
const login=await fetch(b+'/signin-with-chatgpt?return_to=%2Fminha-conta',{redirect:'manual'});const cookie=login.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);
const headers={'Content-Type':'application/json',Origin:b,Cookie:cookie};const post=(path,body,h=headers)=>fetch(b+path,{method:'POST',headers:h,body:JSON.stringify(body)});
assert.equal((await fetch(b+'/api/orders')).status,401);assert.equal((await fetch(b+'/api/admin/orders',{headers:{Cookie:cookie}})).status,403);assert.equal((await post('/api/checkout',{}, {'Content-Type':'application/json',Origin:b})).status,401);
let r=await post('/api/customer',{cpf:'11111111111',name:'Cliente teste',phone:'11999999999',address:'Rua de teste, 123, São Paulo'});assert.equal(r.status,400);
// Synthetic checksum-valid identifier for local fixture only.
let digits='987654320';for(let n=9;n<11;n++){let sum=0;for(let i=0;i<n;i++)sum+=Number(digits[i])*(n+1-i);digits+=String((sum*10)%11%10)}
r=await post('/api/customer',{cpf:digits,name:'Cliente de teste local',phone:'11999999999',address:'Rua de teste, 123, bairro teste, São Paulo'});let profile=await r.json();assert.equal(r.status,200,JSON.stringify(profile));assert.equal(profile.profile.cpfMasked,'***.***.***-'+digits.slice(-2));assert.ok(!JSON.stringify(profile).includes(digits));
const requestId=crypto.randomUUID();const body={name:'Cliente de teste local',phone:'11999999999',address:'Rua de teste, 123, bairro teste, São Paulo',date:'',notes:'Fixture local. Nenhuma mensagem será enviada.',requestId,cart:[{id:'1',size:0,qty:2}]};
r=await post('/api/checkout',body);const saved=await r.json();assert.equal(r.status,200,JSON.stringify(saved));assert.ok(saved.orderId);const message=new URL(saved.url).searchParams.get('text');assert.ok(!message.includes(digits));assert.ok(message.includes(saved.orderId));assert.match(message,/33.80/);
r=await post('/api/checkout',body);const retry=await r.json();assert.equal(retry.orderId,saved.orderId);
let history=await(await fetch(b+'/api/orders',{headers:{Cookie:cookie}})).json();assert.equal(history.filter(o=>o.id===saved.orderId).length,1);const order=history.find(o=>o.id===saved.orderId);assert.equal(order.status,'aguardando_confirmacao');assert.equal(order.items[0].unitCents,1690);assert.equal(order.totalCents,3380);assert.ok(!JSON.stringify(history).includes('cpfHash'));
r=await post('/api/customer',{name:'Nome atualizado de teste',phone:'11888888888',address:'Outro endereço de teste, 456, São Paulo'});assert.equal(r.status,200);
history=await(await fetch(b+'/api/orders',{headers:{Cookie:cookie}})).json();assert.equal(history.find(o=>o.id===saved.orderId).customerName,'Cliente de teste local');
assert.equal((await post('/api/customer',{name:'Teste',phone:'11999999999',address:'Rua de teste, 123'}, {...headers,Origin:'https://example.invalid'})).status,403);
console.log('OK: CPF inválido, cadastro e atualização, histórico persistente, snapshot imutável, pedido idempotente, CPF ausente do WhatsApp, bloqueio anônimo/admin e origem externa.');
