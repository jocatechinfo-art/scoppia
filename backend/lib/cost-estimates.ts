import type {CostItem,CostRecord,Ingredient,CostUnit,PurchasePrice} from './commerce-types';

// Hypothetical purchase prices and cooking yields for an editable starting scenario.
// These are not supplier quotations or measured Scoppia recipes.
type Supply={name:string,price:number,yield:number,unit?:CostUnit};
const supplies:Record<string,Supply>={
 rice:{name:'Arroz cru',price:650,yield:2.7},beans:{name:'Feijão cru',price:850,yield:2.5},lentil:{name:'Lentilha seca',price:1800,yield:2.4},quinoa:{name:'Quinoa seca',price:3200,yield:2.7},
 beef:{name:'Carne bovina',price:3800,yield:.7},ground:{name:'Carne bovina moída',price:3200,yield:.75},flank:{name:'Fraldinha',price:4600,yield:.7},round:{name:'Lagarto bovino',price:3800,yield:.7},chicken:{name:'Peito de frango',price:2000,yield:.75},thigh:{name:'Sobrecoxa sem osso',price:1800,yield:.75},pork:{name:'Pernil suíno',price:2200,yield:.7},tender:{name:'Mignon suíno',price:2800,yield:.75},fish:{name:'Filé de tilápia',price:4200,yield:.8},sausage:{name:'Calabresa',price:2400,yield:.85},bacon:{name:'Bacon',price:3200,yield:.7},
 potato:{name:'Batata',price:600,yield:.85},sweet:{name:'Batata-doce',price:650,yield:.85},cassava:{name:'Mandioca descascada',price:850,yield:1.1},arracacha:{name:'Mandioquinha',price:1400,yield:.85},pumpkin:{name:'Abóbora cabotiá',price:600,yield:.7},vegetables:{name:'Mix de legumes',price:1000,yield:.85},broccoli:{name:'Brócolis',price:1400,yield:.8},kale:{name:'Couve',price:1200,yield:.7},escarole:{name:'Escarola',price:1000,yield:.7},carrot:{name:'Cenoura',price:600,yield:.85},cabbage:{name:'Repolho',price:500,yield:.85},eggplant:{name:'Berinjela',price:800,yield:.8},zucchini:{name:'Abobrinha',price:700,yield:.8},shimeji:{name:'Shimeji',price:4500,yield:.7},
 pasta:{name:'Massa seca',price:1000,yield:2.3},wholepasta:{name:'Massa integral seca',price:1600,yield:2.3},gnocchi:{name:'Nhoque preparado (batata, farinha e ovos)',price:1400,yield:1},arragnocchi:{name:'Nhoque preparado de mandioquinha',price:2000,yield:1},pancake:{name:'Massa de panqueca (farinha, leite e ovos)',price:1000,yield:1},dough:{name:'Massa de torta (farinha, leite, ovos e óleo)',price:1200,yield:1},risotto:{name:'Arroz para risoto cru',price:2000,yield:2.7},flour:{name:'Farinha para farofa / empanar',price:900,yield:1},
 sauce:{name:'Molho de tomate preparado',price:1000,yield:1},cream:{name:'Creme de leite / molho branco',price:1800,yield:1},milk:{name:'Leite',price:550,yield:1,unit:'ml'},cheese:{name:'Queijo muçarela',price:3200,yield:1},ricotta:{name:'Creme de ricota',price:2500,yield:1},ham:{name:'Presunto',price:2400,yield:1},mustard:{name:'Molho de mostarda e iogurte',price:1800,yield:1},oil:{name:'Óleo / azeite (mistura estimada)',price:1800,yield:1,unit:'ml'},seasoning:{name:'Cebola, alho, sal e temperos',price:1200,yield:1},water:{name:'Água / caldo de preparo',price:10,yield:1,unit:'ml'},peppers:{name:'Pimentões e cebola',price:1000,yield:.85},olive:{name:'Azeitona',price:2600,yield:1},raisin:{name:'Uva-passa',price:2200,yield:1},
 apple:{name:'Maçã',price:1000,yield:.9},lemon:{name:'Limão inteiro (rendimento em suco)',price:600,yield:.4},ginger:{name:'Gengibre',price:2000,yield:.9},coconut:{name:'Água de coco',price:1000,yield:1,unit:'ml'},pineapple:{name:'Abacaxi inteiro',price:700,yield:.55},mint:{name:'Hortelã',price:3000,yield:.8},orange:{name:'Laranja inteira (rendimento em suco)',price:600,yield:.5},melon:{name:'Melancia inteira',price:350,yield:.6},strawberry:{name:'Morango',price:2000,yield:.9},hibiscus:{name:'Chá de hibisco preparado',price:100,yield:1,unit:'ml'},cucumber:{name:'Pepino',price:500,yield:.9},passion:{name:'Maracujá inteiro (rendimento em polpa)',price:1200,yield:.35},grape:{name:'Uva roxa',price:1400,yield:.9},beet:{name:'Beterraba',price:600,yield:.85},
};
// Shares are prepared g/ml before the size multiplier. They are normalized per portion.
type Share=[string,number];
const recipes:Record<string,Share[]>={
 '1':[['potato',185],['kale',25],['sausage',45],['water',35],['oil',4],['seasoning',6]],
 '2':[['arracacha',180],['chicken',65],['water',45],['oil',4],['seasoning',6]],
 '3':[['vegetables',180],['beef',65],['water',45],['oil',4],['seasoning',6]],
 '4':[['beans',190],['sausage',35],['bacon',15],['water',50],['oil',4],['seasoning',6]],
 '5':[['rice',150],['flank',110],['flour',25],['oil',5],['seasoning',10]],
 '6':[['rice',115],['beans',65],['ground',110],['oil',4],['seasoning',6]],
 '7':[['rice',115],['beans',65],['chicken',110],['oil',4],['seasoning',6]],
 '8':[['pasta',120],['ham',50],['cheese',45],['sauce',75],['oil',4],['seasoning',6]],
 '9':[['tender',105],['bacon',10],['rice',110],['flour',25],['kale',40],['oil',4],['seasoning',6]],
 '10':[['chicken',110],['cream',55],['sauce',20],['rice',105],['oil',4],['seasoning',6]],
 '11':[['beans',100],['pork',45],['sausage',20],['rice',85],['kale',25],['flour',15],['oil',4],['seasoning',6]],
 '12':[['round',110],['sauce',40],['rice',115],['flour',25],['oil',4],['seasoning',6]],
 '13':[['pasta',110],['ground',65],['sauce',65],['cheese',35],['cream',15],['oil',4],['seasoning',6]],
 '14':[['eggplant',150],['sauce',65],['cheese',55],['cream',20],['oil',4],['seasoning',6]],
 '15':[['gnocchi',210],['sauce',65],['cheese',15],['oil',4],['seasoning',6]],
 '16':[['pancake',120],['ground',95],['sauce',60],['cheese',15],['oil',4],['seasoning',6]],
 '17':[['pancake',120],['chicken',95],['sauce',60],['cheese',15],['oil',4],['seasoning',6]],
 '18':[['pancake',120],['cheese',110],['sauce',60],['oil',4],['seasoning',6]],
 '19':[['beef',100],['cheese',30],['sauce',40],['flour',15],['rice',105],['oil',4],['seasoning',6]],
 '20':[['chicken',100],['cheese',30],['sauce',40],['flour',15],['rice',105],['oil',4],['seasoning',6]],
 '21':[['pork',100],['rice',100],['flour',25],['potato',65],['oil',4],['seasoning',6]],
 '22':[['beef',110],['rice',100],['vegetables',80],['oil',4],['seasoning',6]],
 '23':[['pasta',120],['beef',45],['chicken',45],['vegetables',70],['sauce',10],['oil',4],['seasoning',6]],
 '24':[['pasta',125],['sauce',55],['chicken',110],['oil',4],['seasoning',6]],
 '25':[['beef',110],['arracacha',90],['milk',10],['vegetables',80],['oil',4],['seasoning',6]],
 '26':[['beef',110],['rice',100],['vegetables',80],['oil',4],['seasoning',6]],
 '27':[['ground',110],['rice',90],['arracacha',80],['milk',10],['oil',4],['seasoning',6]],
 '28':[['ground',110],['quinoa',100],['broccoli',80],['oil',4],['seasoning',6]],
 '29':[['ground',110],['pumpkin',110],['escarole',70],['oil',4],['seasoning',6]],
 '30':[['ground',110],['arracacha',90],['milk',10],['vegetables',80],['oil',4],['seasoning',6]],
 '31':[['ground',110],['rice',100],['vegetables',80],['oil',4],['seasoning',6]],
 '32':[['chicken',110],['rice',100],['vegetables',80],['oil',4],['seasoning',6]],
 '33':[['potato',160],['beef',100],['milk',15],['cheese',15],['oil',4],['seasoning',6]],
 '34':[['potato',160],['chicken',100],['milk',15],['cheese',15],['oil',4],['seasoning',6]],
 '35':[['sweet',160],['ground',100],['milk',15],['cheese',15],['oil',4],['seasoning',6]],
 '36':[['sweet',160],['chicken',100],['milk',15],['cheese',15],['oil',4],['seasoning',6]],
 '37':[['cassava',160],['beef',100],['milk',15],['cheese',15],['oil',4],['seasoning',6]],
 '38':[['cassava',160],['chicken',100],['milk',15],['cheese',15],['oil',4],['seasoning',6]],
 '39':[['chicken',120],['sweet',155],['milk',15],['oil',4],['seasoning',6]],
 '40':[['chicken',120],['potato',170],['oil',4],['seasoning',6]],
 '41':[['chicken',110],['rice',100],['carrot',40],['cabbage',40],['oil',4],['seasoning',6]],
 '42':[['chicken',110],['mustard',25],['rice',100],['vegetables',55],['oil',4],['seasoning',6]],
 '43':[['pork',120],['potato',170],['oil',4],['seasoning',6]],
 '44':[['beef',110],['rice',100],['vegetables',80],['oil',4],['seasoning',6]],
 '45':[['risotto',180],['shimeji',65],['cheese',25],['cream',20],['oil',4],['seasoning',6]],
 '46':[['eggplant',120],['rice',100],['ricotta',55],['cheese',15],['oil',4],['seasoning',6]],
 '47':[['wholepasta',175],['cream',65],['broccoli',50],['oil',4],['seasoning',6]],
 '48':[['shimeji',90],['rice',110],['lentil',90],['oil',4],['seasoning',6]],
 '49':[['arragnocchi',215],['sauce',60],['cheese',15],['oil',4],['seasoning',6]],
 '50':[['fish',110],['rice',100],['eggplant',65],['cheese',15],['oil',4],['seasoning',6]],
 '51':[['ground',165],['kale',125],['oil',4],['seasoning',6]],
 '52':[['fish',140],['eggplant',125],['cheese',25],['oil',4],['seasoning',6]],
 '53':[['thigh',145],['vegetables',145],['oil',4],['seasoning',6]],
 '54':[['zucchini',150],['ground',100],['sauce',40],['oil',4],['seasoning',6]],
 '55':[['eggplant',170],['peppers',65],['olive',20],['raisin',15],['oil',20],['seasoning',10]],
 '56':[['beef',220],['peppers',60],['sauce',10],['oil',4],['seasoning',6]],
 '57':[['beans',185],['pork',55],['sausage',30],['bacon',20],['oil',4],['seasoning',6]],
 '58':[['beef',270],['sauce',20],['oil',4],['seasoning',6]],
 '59':[['kale',15],['lemon',15],['apple',40],['ginger',3],['coconut',127]],
 '60':[['pineapple',65],['mint',2],['lemon',10],['water',123]],
 '61':[['orange',150],['carrot',25],['ginger',3],['water',22]],
 '62':[['melon',115],['strawberry',35],['hibiscus',50]],
 '63':[['lemon',20],['cucumber',35],['mint',2],['water',143]],
 '64':[['passion',35],['kale',10],['water',155]],
 '65':[['grape',95],['beet',25],['ginger',3],['water',77]],
 '66':[['dough',115],['chicken',65],['ricotta',10],['seasoning',10]],
 '67':[['chicken',150],['ricotta',25],['cheese',15],['seasoning',10]],
 '68':[['pumpkin',95],['flour',20],['chicken',55],['cheese',20],['seasoning',10]],
};

export function supplyCatalog(){return Object.entries(supplies).map(([key,s])=>({key,name:s.name,unit:s.unit||'g' as CostUnit,price:s.price,yield:s.yield})).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'))}
export function ingredientSupplyKey(i:Ingredient){if(i.supplyKey!==undefined)return i.supplyKey;if(!i.estimated||i.quantity===undefined)return '';return supplyCatalog().find(s=>s.name===i.name&&s.unit===i.unit)?.key||''}
export function priceRecipes(records:CostRecord[],prices:PurchasePrice[]):CostRecord[]{return records.map(r=>({...r,ingredients:r.ingredients.map(i=>{const key=ingredientSupplyKey(i),p=prices.find(p=>p.supplyKey===key&&p.unit===i.unit);return key?{...i,supplyKey:key,...(p&&i.quantity!==undefined?{unitPriceCents:p.unitPriceCents,cents:ingredientAmount(i.quantity,i.unit!,p.unitPriceCents)}:{})}:i})}))}
export function ingredientAmount(quantity:number,unit:CostUnit,priceCents:number){return Math.round(quantity*priceCents/(unit==='un'?1:1000))}
export function normalizeIngredient(input:Ingredient):Ingredient{
 if(!input||typeof input.name!=='string'||!input.name.trim()||input.name.length>80||!Number.isSafeInteger(input.cents)||input.cents<0||input.cents>10000000)throw Error('Confira o ingrediente e seu custo.');
 const detailed=input.quantity!==undefined||input.unit!==undefined||input.unitPriceCents!==undefined||input.yieldFactor!==undefined;
 if(input.supplyKey!==undefined&&input.supplyKey!==''&&(typeof input.supplyKey!=='string'||!supplies[input.supplyKey]||!detailed||(supplies[input.supplyKey].unit||'g')!==input.unit))throw Error('Vincule um ingrediente com a mesma unidade de medida.');
 const base:Ingredient={name:input.name.trim(),cents:input.cents,...(input.supplyKey!==undefined?{supplyKey:input.supplyKey}:{}),...(input.estimated===true?{estimated:true}:{})};
 if(!detailed)return base;
 if(typeof input.quantity!=='number'||!Number.isFinite(input.quantity)||input.quantity<=0||input.quantity>100000||!['g','ml','un'].includes(input.unit||'')||!Number.isSafeInteger(input.unitPriceCents)||input.unitPriceCents!<0||input.unitPriceCents!>10000000||input.yieldFactor!==undefined&&(!Number.isFinite(input.yieldFactor)||input.yieldFactor<=0||input.yieldFactor>10))throw Error('Confira quantidade, unidade, preço de compra e rendimento.');
 const cents=ingredientAmount(input.quantity,input.unit!,input.unitPriceCents!);
 if(!Number.isSafeInteger(cents)||cents>10000000)throw Error('O custo do ingrediente ultrapassa o limite.');
 return {...base,quantity:input.quantity,unit:input.unit,unitPriceCents:input.unitPriceCents,yieldFactor:input.yieldFactor,cents};
}

export function initialCostEstimates(items:CostItem[]):CostRecord[]{
 const initial:CostRecord[]=[];
 for(const item of items.filter(i=>!i.count)){
  const shares=recipes[item.itemId],size=Number.parseFloat(item.size);
  if(!shares||!Number.isFinite(size)||size<=0)continue;
  const total=shares.reduce((n,[,amount])=>n+amount,0);
  const ingredients:Ingredient[]=shares.map(([id,amount])=>{const s=supplies[id],quantity=Math.round(amount/total*size/s.yield*1000)/1000,unit=s.unit||'g';return {name:s.name,quantity,unit,unitPriceCents:s.price,yieldFactor:s.yield,cents:ingredientAmount(quantity,unit,s.price),estimated:true,supplyKey:id}});
  const food=ingredients.reduce((n,i)=>n+i.cents,0),juice=item.category==='Sucos';
  initial.push({key:item.key,ingredients,components:[],packagingCents:juice?80:120,laborCents:juice?100:Math.round(250*size/300),otherCents:Math.round((juice?35:70*size/300)+food*.08),version:'',updatedAt:''});
 }
 for(const item of items.filter(i=>i.count)){
  const preferred=['6','7','10','26','31'];
  const options=preferred.map(id=>items.find(i=>i.itemId===id&&i.size===item.size&&i.active)).filter((i):i is CostItem=>!!i);
  if(!options.length)continue;
  const components=options.map((i,index)=>({key:i.key,qty:Math.floor(item.count/options.length)+(index<item.count%options.length?1:0)})).filter(c=>c.qty>0);
  initial.push({key:item.key,ingredients:[],components,packagingCents:150,laborCents:0,otherCents:0,version:'',updatedAt:''});
 }
 return initial;
}
export function usesEstimates(record:CostRecord|undefined,records:CostRecord[]):boolean{return !!record&&(record.ingredients.some(i=>i.estimated)||record.components.some(c=>records.find(r=>r.key===c.key)?.ingredients.some(i=>i.estimated)))}
