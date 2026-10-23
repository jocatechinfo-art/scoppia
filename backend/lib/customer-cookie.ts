// Better Auth adds __Secure- automatically when its base URL uses HTTPS.
export const customerCookie='scoppia_customer_session';
export function customerCookieName(origin:string){return (new URL(origin).protocol==='https:'?'__Secure-':'')+customerCookie;}
export function proxyCustomerSetCookie(header:string,backendOrigin:string,clientOrigin:string){
 const upstream=customerCookieName(backendOrigin),client=customerCookieName(clientOrigin);
 if(!header.startsWith(upstream+'='))return null;
 let value=client+header.slice(upstream.length);
 if(new URL(clientOrigin).protocol==='https:'&&!/;\s*secure(?:;|$)/i.test(value))value+='; Secure';
 return value;
}
