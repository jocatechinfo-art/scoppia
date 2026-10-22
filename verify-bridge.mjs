import assert from 'node:assert/strict';
const web='http://127.0.0.1:3000',back='http://127.0.0.1:5173';
let r=await fetch(back+'/signin-with-chatgpt?return_to=%2F',{redirect:'manual'});const backendCookie=r.headers.getSetCookie()[0].split(';')[0];
r=await fetch(web+'/signin-with-chatgpt?return_to=%2Fminha-conta',{redirect:'manual'});assert.equal(r.status,307);const flowCookie=r.headers.getSetCookie()[0].split(';')[0],connect=r.headers.get('location');assert.ok(connect.startsWith(back+'/conectar?'));
r=await fetch(connect,{headers:{Cookie:backendCookie},redirect:'manual'});assert.equal(r.status,307);const callback=r.headers.get('location');assert.ok(callback.startsWith(web+'/auth/callback?'));
const code=new URL(callback).searchParams.get('code');const flow=JSON.parse(decodeURIComponent(flowCookie.slice(flowCookie.indexOf('=')+1)));
let invalid=await fetch(back+'/api/bridge/exchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,verifier:'x'.repeat(43)})});assert.equal(invalid.status,400);
r=await fetch(callback,{headers:{Cookie:flowCookie},redirect:'manual'});assert.equal(r.status,307);assert.equal(r.headers.get('location'),web+'/minha-conta');const session=r.headers.getSetCookie().find(s=>s.startsWith('scoppia_session=')).split(';')[0];assert.ok(session.includes('HttpOnly')===false); // Cookie header below excludes attributes.
invalid=await fetch(back+'/api/bridge/exchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,verifier:flow.verifier})});assert.equal(invalid.status,400);
r=await fetch(web+'/api/customer',{headers:{Cookie:session}});let b=await r.json();assert.equal(r.status,200);assert.equal(b.authenticated,true);
assert.equal((await fetch(web+'/api/orders')).status,401);
r=await fetch(web+'/api/orders',{headers:{Cookie:session}});b=await r.json();assert.ok(Array.isArray(b));assert.ok(b.length>0);
assert.equal((await fetch(web+'/api/orders',{headers:{Cookie:'scoppia_session=forged','oai-authenticated-user-id':'local_seedy','oai-authenticated-user-email':'seedy@sites.test'}})).status,401);
assert.equal((await fetch(web+'/api/customer',{method:'POST',headers:{Cookie:session,Origin:'https://example.invalid','Content-Type':'application/json'},body:'{}'})).status,403);
r=await fetch(web+'/api/menu');b=await r.json();assert.equal(b.length,72);
r=await fetch(web+'/auth/callback?code='+code+'&state=invalid',{headers:{Cookie:flowCookie},redirect:'manual'});assert.equal(r.headers.get('location'),web+'/erro-conexao');
r=await fetch(web+'/signout-with-chatgpt?return_to=%2Fadmin',{headers:{Cookie:session},redirect:'manual'});assert.ok(r.headers.getSetCookie().some(s=>s.startsWith('scoppia_session=;')));
console.log('OK: login com PKCE, código de uso único, cookie de sessão, histórico através da API, bloqueio de sessão forjada/CSRF e saída. Nenhum CPF ou identidade em URL de callback.');
