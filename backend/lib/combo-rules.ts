import {getDb} from '@/db';
import {comboRules} from '@/db/schema';
import {menu} from './menu';
export async function getComboRules(){
 const saved=await getDb().select().from(comboRules);
 return menu.filter(i=>i.category==='Combos').map(i=>({id:i.id,count:i.count!,minPerFlavor:saved.find(r=>r.id===i.id)?.minPerFlavor??(i.count===10?3:4)}));
}
