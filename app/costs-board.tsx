'use client';
import {useEffect,useRef,useState} from 'react';
import {money} from '@/lib/operations';
import {recipeCost} from '@/lib/commerce-math';
import {initialCostEstimates,ingredientAmount,usesEstimates,supplyCatalog,ingredientSupplyKey,priceRecipes} from '@/lib/cost-estimates';
import type {CostItem,CostRecord,CostUnit,Ingredient,PurchasePrice} from '@/lib/commerce-types';
import {csvCell} from '@/lib/order-report';

type Data={items:CostItem[],recipes:CostRecord[],mealCategories:string[],purchasePrices:PurchasePrice[]};
type IngredientDraft={name:string,cost:string,quantity:string,unit:CostUnit,price:string,yield:string,detailed:boolean,estimated:boolean,supplyKey:string};
const decimal=(n:number)=>String(n);
const fromIngredient=(i:Ingredient):IngredientDraft=>({name:i.name,cost:decimal(i.cents/100),quantity:decimal(i.quantity??1),unit:i.unit||'un',price:decimal((i.unitPriceCents??i.cents)/100),yield:decimal(i.yieldFactor??1),detailed:i.quantity!==undefined,estimated:!!i.estimated,supplyKey:ingredientSupplyKey(i)});
const blankIngredient=():IngredientDraft=>({name:'',cost:'',quantity:'',unit:'g',price:'',yield:'1',detailed:true,estimated:false,supplyKey:''});
const supplies=supplyCatalog();
const cents=(s:string)=>Math.round(Number(s)*100);
const quantityText=(n:number)=>n.toLocaleString('pt-BR',{maximumFractionDigits:1});

function CostEditor({item,record,data,saved,onSaved,onBusy}:{item:CostItem,record?:CostRecord,data:Data,saved:boolean,onSaved:()=>void,onBusy:(busy:boolean)=>void}){
 const [ingredients,setIngredients]=useState<IngredientDraft[]>(record?.ingredients.map(fromIngredient)||[blankIngredient()]);
 const [components,setComponents]=useState(record?.components||[]);
 const [packaging,setPackaging]=useState(decimal((record?.packagingCents||0)/100));
 const [labor,setLabor]=useState(decimal((record?.laborCents||0)/100));
 const [other,setOther]=useState(decimal((record?.otherCents||0)/100));
 const [editingVersion]=useState(record?.version||'');
 const [reviewed,setReviewed]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const draft:CostRecord={key:item.key,ingredients:item.count?[]:ingredients.filter(i=>i.name.trim()).map(i=>i.detailed?{name:i.name,quantity:Number(i.quantity),unit:i.unit,unitPriceCents:cents(i.price),yieldFactor:Number(i.yield),cents:ingredientAmount(Number(i.quantity),i.unit,cents(i.price)),estimated:i.estimated&&!reviewed,supplyKey:i.supplyKey}:{name:i.name,cents:cents(i.cost),estimated:i.estimated&&!reviewed}),components:item.count?components:[],packagingCents:cents(packaging),laborCents:cents(labor),otherCents:cents(other),version:editingVersion,updatedAt:''};
 draft.ingredients=priceRecipes([draft],data.purchasePrices||[])[0].ingredients;
 const cost=recipeCost(draft,data.recipes),margin=cost==null||item.priceCents==null?null:item.priceCents-cost;
 const options=data.items.filter(i=>data.mealCategories.includes(i.category)&&i.size===item.size);
 function update(index:number,patch:Partial<IngredientDraft>){setIngredients(old=>old.map((i,j)=>j===index?{...i,...patch}:i))}
 async function save(e:React.FormEvent){
  e.preventDefault();setBusy(true);onBusy(true);setNotice('');
  try{const r=await fetch('/api/admin/costs',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)}),b=await r.json() as {error?:string};if(!r.ok)throw Error(b.error||'Não foi possível salvar.');onSaved()}
  catch(e){setNotice(e instanceof Error?e.message:'Não foi possível salvar.')}
  finally{setBusy(false);onBusy(false)}
 }
 return <form className="cost-editor commerce-order" onSubmit={save}>
  <div className="cost-editor-heading"><div><span className="eyebrow">FICHA DE CUSTO</span><h3>{item.name} · {item.size}</h3></div><span className="cost-basis">{!saved?'Estimativa inicial · não salva':usesEstimates(record,data.recipes)?'Salva com estimativas':'Ficha cadastrada'}</span></div>
  <p>{item.count?'Simule os sabores do combo completo. O custo muda conforme a escolha do cliente.':'Edite a quantidade de ingrediente de compra por porção e o preço por kg, litro ou unidade. O custo é recalculado automaticamente.'}</p>
  {!saved?<p className="cost-assumptions">Ponto de partida ilustrativo, sem pesagem da sua cozinha ou cotação de fornecedor. Confira a composição e os preços antes de usar a margem para decidir valores.</p>:null}
  {item.count?<>
   <h4>Composição do combo · {components.reduce((n,c)=>n+c.qty,0)} de {item.count} marmitas</h4>
   {!saved?<p>Mix inicial de sabores para simulação. Substitua pela composição que deseja avaliar.</p>:null}
   {components.map((c,index)=><div className="cost-line" key={index}>
    <label>Sabor / porção<select aria-label={'Sabor '+(index+1)} value={c.key} onChange={e=>setComponents(old=>old.map((x,j)=>j===index?{...x,key:e.target.value}:x))} required disabled={busy}><option value="">Selecione o sabor</option>{options.map(i=><option key={i.key} value={i.key}>{i.name} · {i.size}</option>)}</select></label>
    <label>Quantidade<input aria-label={'Quantidade do sabor '+(index+1)} type="number" min="1" max={item.count} value={c.qty} onChange={e=>setComponents(old=>old.map((x,j)=>j===index?{...x,qty:Number(e.target.value)}:x))} required disabled={busy}/></label>
    <button type="button" className="secondary" disabled={busy} onClick={()=>setComponents(old=>old.filter((_,j)=>j!==index))}>Remover sabor {index+1}</button>
   </div>)}
   <button type="button" className="secondary" disabled={busy||components.length>=40} onClick={()=>setComponents(old=>[...old,{key:'',qty:1}])}>Adicionar sabor ao combo</button>
   <p className="muted">Embalagem, trabalho e despesas das marmitas entram uma única vez pelos componentes. Abaixo, informe somente custos adicionais do conjunto. Sabores sem ficha salva usam a estimativa inicial identificada no relatório.</p>
  </>:<>
   <h4>Ingredientes por porção</h4>
   <p className="muted">Quantidade de compra × preço ÷ 1.000 para g/ml; para unidade, quantidade × preço. Rendimento = peso pronto ÷ peso de compra. A quantidade pronta é uma referência de montagem; ajuste ambos após pesar a receita.</p>
   {ingredients.map((i,index)=><fieldset className="cost-ingredient" key={index}><legend>Ingrediente {index+1}{i.estimated&&!reviewed?' · estimado':''}</legend>
    {i.detailed?<label className="cost-supply-link">Vínculo com ingrediente de compras<select value={i.supplyKey} onChange={e=>{const supply=supplies.find(s=>s.key===e.target.value);update(index,supply?{supplyKey:supply.key,name:supply.name,unit:supply.unit,price:String((data.purchasePrices.find(p=>p.supplyKey===supply.key)?.unitPriceCents??supply.price)/100),yield:String(supply.yield)}:{supplyKey:'',price:String((data.purchasePrices.find(p=>p.supplyKey===i.supplyKey)?.unitPriceCents??cents(i.price))/100)})}} disabled={busy}><option value="">Preço manual · sem atualização por compras</option>{supplies.map(s=><option key={s.key} value={s.key}>{s.name}</option>)}</select></label>:null}
    <label>Ingrediente<input value={i.name} required maxLength={80} onChange={e=>update(index,{name:e.target.value})} disabled={busy}/></label>
    {i.detailed?<div className="cost-ingredient-fields">
     <label>Quantidade de compra<input type="number" min="0.001" max="100000" step="0.001" required value={i.quantity} onChange={e=>update(index,{quantity:e.target.value})} disabled={busy}/></label>
     <label>Unidade<select value={i.unit} onChange={e=>update(index,{unit:e.target.value as CostUnit})} disabled={busy||!!i.supplyKey}><option value="g">g</option><option value="ml">ml</option><option value="un">unidade</option></select></label>
     <label>Preço de compra (R$/{i.unit==='g'?'kg':i.unit==='ml'?'L':'un'})<input type="number" min="0" max="100000" step="0.01" required value={String((data.purchasePrices.find(p=>p.supplyKey===i.supplyKey)?.unitPriceCents??cents(i.price))/100)} readOnly={data.purchasePrices.some(p=>p.supplyKey===i.supplyKey)} onChange={e=>update(index,{price:e.target.value})} disabled={busy}/></label>
     <label>Rendimento<input type="number" min="0.001" max="10" step="0.001" required value={i.yield} onChange={e=>update(index,{yield:e.target.value})} disabled={busy}/></label>
    </div>:<label>Custo da porção (R$)<input type="number" min="0" max="100000" step="0.01" required value={i.cost} onChange={e=>update(index,{cost:e.target.value})} disabled={busy}/></label>}
    {i.supplyKey?<p className="purchase-source">{data.purchasePrices.find(p=>p.supplyKey===i.supplyKey)?<>Preço confirmado pela última compra registrada em {new Date(data.purchasePrices.find(p=>p.supplyKey===i.supplyKey)!.purchasedAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})}. Novas compras deste ingrediente atualizam o cálculo. Para usar outro preço, selecione Preço manual.</>:<>Vinculado à lista de compras. Sem preço de compra registrado; o valor inicial permanece editável.</>}</p>:null}
    <div className="cost-ingredient-result"><span>{i.detailed?<>Pronto: aproximadamente {quantityText(Number(i.quantity)*Number(i.yield))} {i.unit}</>:<>Custo informado diretamente</>} · <b>{money(i.detailed?ingredientAmount(Number(i.quantity),i.unit,data.purchasePrices.find(p=>p.supplyKey===i.supplyKey)?.unitPriceCents??cents(i.price)):cents(i.cost))}</b></span><button type="button" className="secondary" disabled={busy} onClick={()=>setIngredients(old=>old.filter((_,j)=>j!==index))}>Remover ingrediente {index+1}</button></div>
   </fieldset>)}
   <button type="button" className="secondary" disabled={busy||ingredients.length>=80} onClick={()=>setIngredients(old=>[...old,blankIngredient()])}>Adicionar ingrediente</button>
   {ingredients.some(i=>i.estimated)?<label className="cost-reviewed"><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)} disabled={busy}/> Revisei as quantidades e os preços; retirar a marca de estimativa dos ingredientes ao salvar.</label>:null}
  </>}
  <div className="commerce-form">
   <label>{item.count?'Embalagem adicional do combo (R$)':'Embalagem (R$)'}<input type="number" min="0" max="100000" step="0.01" value={packaging} onChange={e=>setPackaging(e.target.value)} required disabled={busy}/></label>
   <label>Mão de obra (R$)<input type="number" min="0" max="100000" step="0.01" value={labor} onChange={e=>setLabor(e.target.value)} required disabled={busy}/></label>
   <label>Outros custos rateados (R$)<input type="number" min="0" max="100000" step="0.01" value={other} onChange={e=>setOther(e.target.value)} required disabled={busy}/></label>
  </div>
  <div className="commerce-metrics"><p>Custo estimado <b>{cost==null?'Faltam custos dos componentes':money(cost)}</b></p><p>Preço de venda atual <b>{item.priceCents==null?'Porção usada em combos':money(item.priceCents)}</b></p><p>Resultado estimado por unidade <b className={margin!=null&&margin<0?'cost-negative':''}>{margin==null?'A calcular':money(margin)}</b></p><p>Margem sobre venda <b>{margin==null||!item.priceCents?'—':(margin/item.priceCents*100).toFixed(1).replace('.',',')+'%'}</b></p></div>
  <p className="muted">Resultado = venda − custos desta ficha. Não representa lucro líquido apurado. Some taxas, impostos, aluguel e demais despesas em Outros custos. O frete não entra nesta simulação.</p>
  <button className="primary" disabled={busy}>{busy?'Salvando…':'Salvar ficha de custo'}</button><p role="status">{notice}</p>
 </form>
}

export default function CostsBoard(){
 const [data,setData]=useState<Data|null>(null),[revision,setRevision]=useState(0),[notice,setNotice]=useState(''),[search,setSearch]=useState(''),[category,setCategory]=useState(''),[selected,setSelected]=useState('');
 useEffect(()=>{const c=new AbortController();const load=()=>fetch('/api/admin/costs',{cache:'no-store',signal:c.signal}).then(async r=>{if(!r.ok)throw Error('Não foi possível carregar os custos.');setData(await r.json() as Data)}).catch(e=>{if(!c.signal.aborted)setNotice(e.message)});const changed=(e:StorageEvent)=>{if(e.key==='scoppia:purchase-prices')void load()};void load();const timer=setInterval(load,30000);window.addEventListener('focus',load);window.addEventListener('scoppia:purchase-prices',load);window.addEventListener('storage',changed);return()=>{c.abort();clearInterval(timer);window.removeEventListener('focus',load);window.removeEventListener('scoppia:purchase-prices',load);window.removeEventListener('storage',changed)}},[revision]);
 const initial=data?initialCostEstimates(data.items):[],savedKeys=new Set(data?.recipes.map(r=>r.key)),baseRecipes=[...(data?.recipes||[]),...initial.filter(r=>!savedKeys.has(r.key))],recipes=priceRecipes(baseRecipes,data?.purchasePrices||[]);
 const dialog=useRef<HTMLDialogElement>(null),[editorBusy,setEditorBusy]=useState(false);
 useEffect(()=>{if(selected&&!dialog.current?.open)dialog.current?.showModal();else if(!selected&&dialog.current?.open)dialog.current.close()},[selected]);
 const items=data?.items.filter(i=>(!category||i.category===category)&&(!search||(i.name+' '+i.size).toLocaleLowerCase().includes(search.toLocaleLowerCase())))||[],item=data?.items.find(i=>i.key===selected);
 function basis(key:string){const r=recipes.find(r=>r.key===key),linked=r?.ingredients.some(i=>data?.purchasePrices.some(p=>p.supplyKey===ingredientSupplyKey(i)))||r?.components.some(c=>recipes.find(r=>r.key===c.key)?.ingredients.some(i=>data?.purchasePrices.some(p=>p.supplyKey===ingredientSupplyKey(i))));return (!savedKeys.has(key)?'Estimativa inicial':usesEstimates(r,recipes)?'Salva com estimativas':'Ficha cadastrada')+(linked?' · preço de compra':'') }
 function download(){
  if(!data)return;
  const lines=[['Item','Porção','Categoria','Ativo','Base do cálculo','Preço de venda','Custo estimado','Resultado estimado','Margem %'],...items.map(i=>{const cost=recipeCost(recipes.find(r=>r.key===i.key),recipes),margin=cost==null||i.priceCents==null?null:i.priceCents-cost;return [i.name,i.size,i.category,i.active?'Sim':'Não',basis(i.key),i.priceCents==null?'Sem venda individual':(i.priceCents/100).toFixed(2),cost==null?'Custo incompleto':(cost/100).toFixed(2),margin==null?'A calcular':(margin/100).toFixed(2),margin==null||!i.priceCents?'':(margin/i.priceCents*100).toFixed(2)]})];
  const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.map(r=>r.map(csvCell).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='custos-margens-scoppia.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <section className="commerce-board costs-board"><span className="eyebrow">GESTÃO INTERNA</span><h2>Custos e margem</h2>
  <p>As fichas sem cadastro começam com ingredientes e quantidades aproximadas para cada porção. Edite os valores, confira o resultado e salve sua ficha. Custos já cadastrados são preservados. Clique em Revisar estimativa ou Editar para abrir o pop-up. Ingredientes vinculados usam automaticamente o preço da última compra registrada.</p>
  <details className="cost-assumptions"><summary>Como foram feitas as estimativas iniciais</summary><p>Receitas ilustrativas baseadas no nome e na descrição do cardápio, sem pesagem da cozinha. Preços de compra e rendimentos são hipóteses de simulação, não cotações atuais. Preparações como massas e molhos usam um custo composto por kg; abra a composição em mais ingredientes se necessário.</p><p>Porção dimensionada em g/ml prontos. Quantidade de compra = quantidade pronta ÷ rendimento. Rendimento de exemplo: arroz 2,7; frango 0,75; carne bovina 0,70. Confirme na sua produção.</p><p>Hipóteses adicionais: embalagem R$ 1,20 (suco R$ 0,80); trabalho R$ 2,50 por 300 g (suco R$ 1,00); Outros = R$ 0,70 por 300 g (suco R$ 0,35) + reserva de 8% dos ingredientes. Esses rateios iniciais não se recalculam após editar ingredientes; ajuste-os na ficha. Combo: R$ 1,50 de embalagem adicional, além das marmitas.</p><p>Taxas de cartão, impostos, aluguel e frete não estão presumidos nos valores iniciais. Inclua suas despesas reais para aproximar o lucro. Os sucos não incluem adoçantes opcionais. As estimativas iniciais são exibidas para simulação; só entram como ficha cadastrada quando você salva.</p></details>
  <div className="commerce-toolbar"><label>Buscar item / porção<input type="search" value={search} onChange={e=>setSearch(e.target.value)}/></label><label>Categoria<select value={category} onChange={e=>setCategory(e.target.value)}><option value="">Todas as categorias</option>{[...new Set(data?.items.map(i=>i.category))].map(c=><option key={c}>{c}</option>)}</select></label><button className="secondary" onClick={()=>{setNotice('');setRevision(n=>n+1)}}>Atualizar custos</button><button className="secondary" disabled={!data} onClick={download}>Baixar CSV</button></div>
  <p role="status">{notice||(!data?'Carregando fichas…':'')}</p>
  {data?<><label className="cost-picker">Editar ficha de custo<select value={selected} onChange={e=>{setSelected(e.target.value);setNotice('')}}><option value="">Selecione um item ou combo</option>{items.map(i=><option key={i.key} value={i.key}>{i.name} · {i.size}{i.count?' · combo':''}</option>)}</select></label>
  <dialog ref={dialog} className="cost-review-dialog" aria-labelledby="cost-dialog-title" onCancel={e=>{if(editorBusy)e.preventDefault()}} onClose={()=>setSelected('')}><div className="cost-dialog-heading"><h2 id="cost-dialog-title">Revisar ficha de custo</h2><button type="button" className="secondary" disabled={editorBusy} onClick={()=>{dialog.current?.close();setSelected('')}}>Fechar revisão</button></div>{item?<CostEditor key={item.key} item={item} record={baseRecipes.find(r=>r.key===item.key)} data={{...data,recipes}} saved={savedKeys.has(item.key)} onBusy={setEditorBusy} onSaved={()=>{setSelected('');setNotice('Ficha de custo salva.');setRevision(n=>n+1)}}/>:null}</dialog>
  <p className="muted">Resultado estimado antes das despesas não informadas. Combos usam o mix ilustrativo da ficha e os custos atuais dos sabores. Nenhum custo interno é exibido ao cliente.</p>
  <div className="report-table"><table className="cost-table"><thead><tr><th>Item / porção</th><th>Venda</th><th>Custo</th><th>Resultado estimado</th><th>Margem</th><th>Ficha</th></tr></thead><tbody>{items.map(i=>{const record=recipes.find(r=>r.key===i.key),cost=recipeCost(record,recipes),profit=cost==null||i.priceCents==null?null:i.priceCents-cost;return <tr key={i.key}><td><b>{i.name}</b><small>{i.size} · {i.category}{!i.active?' · inativo':''}</small><small className="cost-basis">{basis(i.key)}</small></td><td>{i.priceCents==null?'Uso em combos':money(i.priceCents)}</td><td>{cost==null?'Não definido':money(cost)}</td><td className={profit!=null&&profit<0?'cost-negative':''}>{profit==null?'A calcular':money(profit)}</td><td>{profit==null||!i.priceCents?'—':(profit/i.priceCents*100).toFixed(1).replace('.',',')+'%'}</td><td><button className="secondary" onClick={()=>setSelected(i.key)}>{savedKeys.has(i.key)?'Editar':'Revisar estimativa'}</button></td></tr>})}</tbody></table></div>{!items.length?<p>Nenhum item encontrado.</p>:null}</>:null}
 </section>
}
