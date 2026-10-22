import { getDb } from "@/db";
import { availability } from "@/db/schema";
import { menu } from "@/lib/menu";
import { getChatGPTUser } from "@/app/chatgpt-auth";
export const dynamic = "force-dynamic";
export async function GET(){ const rows=await getDb().select().from(availability); const states=new Map(rows.map(r=>[r.id,r.active])); return Response.json(menu.map(i=>({...i,active:states.get(i.id)??true})),{headers:{"Cache-Control":"no-store"}}); }
export async function PATCH(req:Request){
 const u=await getChatGPTUser(); if(u?.email.toLowerCase()!=="scoppiagourmet@gmail.com") return Response.json({error:"Acesso restrito ao administrador."},{status:403});
 if(req.headers.get("origin")!==new URL(req.url).origin) return new Response(null,{status:403});
 const b=await req.json() as {id:string,active:boolean}; if(!menu.some(i=>i.id===b.id)||typeof b.active!=="boolean")return new Response(null,{status:400});
 await getDb().insert(availability).values({id:b.id,active:b.active}).onConflictDoUpdate({target:availability.id,set:{active:b.active}});return Response.json({ok:true});
}
