import {inventoryDb} from './inventory';
import {supplyCatalog} from './cost-estimates';
import type {PurchasePrice} from './commerce-types';

export async function purchasePrices():Promise<PurchasePrice[]>{
 const rows=await inventoryDb().prepare(`SELECT p.supply_key AS supplyKey,p.unit_price_cents AS unitPriceCents,p.shopping_id AS shoppingId,s.name AS sourceName,s.purchased_at AS purchasedAt FROM shopping_purchases p JOIN shopping_items s ON s.id=p.shopping_id WHERE s.purchased=1 ORDER BY s.purchased_at DESC,p.updated_at DESC,p.shopping_id DESC`).all<Omit<PurchasePrice,'unit'>>();
 const result:PurchasePrice[]=[],seen=new Set<string>(),supplies=supplyCatalog();
 for(const row of rows.results){const supply=supplies.find(s=>s.key===row.supplyKey);if(supply&&!seen.has(row.supplyKey)){seen.add(row.supplyKey);result.push({...row,unit:supply.unit})}}
 return result;
}
