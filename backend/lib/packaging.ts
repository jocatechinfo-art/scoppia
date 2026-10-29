import {inventoryDb} from './inventory';
import type {PackagingItem,PackagingLink} from './packaging-costs';
export async function packagingData(){const db=inventoryDb();const [stock,links]=await Promise.all([db.prepare('SELECT id,name,quantity,unit_cost_cents AS unitCostCents,version,updated_at AS updatedAt FROM packaging_stock ORDER BY name').all<PackagingItem>(),db.prepare('SELECT id,target,packaging_id AS packagingId,qty,version,updated_at AS updatedAt FROM packaging_links').all<PackagingLink>()]);return {stock:stock.results,links:links.results}}
