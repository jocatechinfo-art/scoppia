import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const availability=sqliteTable('availability',{id:text('id').primaryKey(),active:integer('active',{mode:'boolean'}).notNull().default(true)});
export const customers=sqliteTable('customers',{
 id:text('id').primaryKey(),userId:text('user_id').notNull().unique(),cpfHash:text('cpf_hash').notNull().unique(),cpfLast:text('cpf_last').notNull(),name:text('name').notNull(),phone:text('phone').notNull(),address:text('address').notNull(),addressDetails:text('address_details'),deletedAt:text('deleted_at'),source:text('source').notNull().default('site'),adminVersion:text('admin_version').notNull().default(''),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()
});
export const orderNumbers=sqliteTable('order_numbers',{id:integer('id').primaryKey({autoIncrement:true}),requestId:text('request_id').notNull().unique()});
export const orders=sqliteTable('orders',{
 id:text('id').primaryKey(),orderNumber:integer('order_number').unique(),deletedAt:text('deleted_at'),stockBatchId:text('stock_batch_id'),customerId:text('customer_id').notNull().references(()=>customers.id),requestId:text('request_id').notNull().unique(),entrySource:text('entry_source').notNull().default('site'),entryActor:text('entry_actor'),entryFingerprint:text('entry_fingerprint'),items:text('items').notNull(),totalCents:integer('total_cents').notNull(),customerName:text('customer_name').notNull(),phone:text('phone').notNull(),address:text('address').notNull(),addressDetails:text('address_details'),preferredDate:text('preferred_date').notNull(),notes:text('notes').notNull(),paymentMethod:text('payment_method'),status:text('status').notNull().default('aguardando_confirmacao'),deliveryDate:text('delivery_date'),shippingFeeCents:integer('shipping_fee_cents'),shippingRule:text('shipping_rule'),createdAt:text('created_at').notNull()
},t=>[index('orders_customer_created').on(t.customerId,t.createdAt)]);

export const bridgeCodes=sqliteTable('bridge_codes',{
 codeHash:text('code_hash').primaryKey(),challenge:text('challenge').notNull(),userId:text('user_id').notNull(),email:text('email').notNull(),displayName:text('display_name').notNull(),fullName:text('full_name'),expiresAt:integer('expires_at').notNull()
});

export const menuPrices=sqliteTable('menu_prices',{
 id:text('id').primaryKey(),itemId:text('item_id').notNull(),sizeIndex:integer('size_index').notNull(),cents:integer('cents').notNull()
});
export const menuPriceState=sqliteTable('menu_price_state',{
 id:text('id').primaryKey(),revision:integer('revision').notNull().default(0),lastBatchId:text('last_batch_id')
});
export const menuPriceChanges=sqliteTable('menu_price_changes',{
 id:text('id').primaryKey(),adminEmail:text('admin_email').notNull(),createdAt:text('created_at').notNull(),scope:text('scope').notNull(),fromCents:integer('from_cents').notNull(),toCents:integer('to_cents').notNull(),changedCount:integer('changed_count').notNull(),details:text('details').notNull()
});

export const comboRules=sqliteTable('combo_rules',{id:text('id').primaryKey(),minPerFlavor:integer('min_per_flavor').notNull()});

// Customer credentials are separate from administrator authentication.
export const authUser=sqliteTable('auth_user',{
 id:text('id').primaryKey(),name:text('name').notNull(),email:text('email').notNull().unique(),emailVerified:integer('email_verified',{mode:'boolean'}).notNull().default(false),image:text('image'),createdAt:integer('created_at',{mode:'timestamp_ms'}).notNull(),updatedAt:integer('updated_at',{mode:'timestamp_ms'}).notNull()
});
export const authSession=sqliteTable('auth_session',{
 id:text('id').primaryKey(),expiresAt:integer('expires_at',{mode:'timestamp_ms'}).notNull(),token:text('token').notNull().unique(),createdAt:integer('created_at',{mode:'timestamp_ms'}).notNull(),updatedAt:integer('updated_at',{mode:'timestamp_ms'}).notNull(),ipAddress:text('ip_address'),userAgent:text('user_agent'),userId:text('user_id').notNull().references(()=>authUser.id,{onDelete:'cascade'})
},t=>[index('auth_session_user').on(t.userId)]);
export const authAccount=sqliteTable('auth_account',{
 id:text('id').primaryKey(),accountId:text('account_id').notNull(),providerId:text('provider_id').notNull(),userId:text('user_id').notNull().references(()=>authUser.id,{onDelete:'cascade'}),accessToken:text('access_token'),refreshToken:text('refresh_token'),idToken:text('id_token'),accessTokenExpiresAt:integer('access_token_expires_at',{mode:'timestamp_ms'}),refreshTokenExpiresAt:integer('refresh_token_expires_at',{mode:'timestamp_ms'}),scope:text('scope'),password:text('password'),createdAt:integer('created_at',{mode:'timestamp_ms'}).notNull(),updatedAt:integer('updated_at',{mode:'timestamp_ms'}).notNull()
},t=>[index('auth_account_user').on(t.userId)]);
export const authVerification=sqliteTable('auth_verification',{
 id:text('id').primaryKey(),identifier:text('identifier').notNull(),value:text('value').notNull(),expiresAt:integer('expires_at',{mode:'timestamp_ms'}).notNull(),createdAt:integer('created_at',{mode:'timestamp_ms'}).notNull(),updatedAt:integer('updated_at',{mode:'timestamp_ms'}).notNull()
},t=>[index('auth_verification_identifier').on(t.identifier)]);
export const authRateLimit=sqliteTable('auth_rate_limit',{id:text('id').primaryKey(),key:text('key').notNull().unique(),count:integer('count').notNull(),lastRequest:integer('last_request').notNull()});
export const customerAccessCodes=sqliteTable('customer_access_codes',{hash:text('hash').primaryKey(),customerId:text('customer_id').notNull().references(()=>customers.id),expiresAt:integer('expires_at').notNull()});
export const customerAuthAttempts=sqliteTable('customer_auth_attempts',{key:text('key').primaryKey(),count:integer('count').notNull(),expiresAt:integer('expires_at').notNull()});

export const productionProgress=sqliteTable('production_progress',{
 id:text('id').primaryKey(),orderId:text('order_id').notNull().references(()=>orders.id),itemKey:text('item_key').notNull(),readyQty:integer('ready_qty').notNull().default(0),updatedAt:text('updated_at').notNull()
},t=>[index('production_progress_order').on(t.orderId)]);

export const inventory=sqliteTable('inventory',{itemKey:text('item_key').primaryKey(),quantity:integer('quantity').notNull().default(0),updatedAt:text('updated_at').notNull()});
export const stockAllocations=sqliteTable('stock_allocations',{id:text('id').primaryKey(),orderId:text('order_id').notNull().references(()=>orders.id),itemKey:text('item_key').notNull(),qty:integer('qty').notNull()},t=>[index('stock_allocations_item').on(t.itemKey),index('stock_allocations_order').on(t.orderId)]);

export const stockLots=sqliteTable('stock_lots',{id:text('id').primaryKey(),itemKey:text('item_key').notNull(),code:text('code').notNull(),producedOn:text('produced_on').notNull(),expiresOn:text('expires_on').notNull(),quantity:integer('quantity').notNull(),createdAt:text('created_at').notNull()},t=>[index('stock_lots_item_expiry').on(t.itemKey,t.expiresOn)]);
export const stockLotAllocations=sqliteTable('stock_lot_allocations',{id:text('id').primaryKey(),orderId:text('order_id').notNull().references(()=>orders.id),itemKey:text('item_key').notNull(),lotId:text('lot_id').notNull().references(()=>stockLots.id),qty:integer('qty').notNull()},t=>[index('stock_lot_allocations_lot').on(t.lotId),index('stock_lot_allocations_order').on(t.orderId)]);
export const inventoryMovements=sqliteTable('inventory_movements',{id:text('id').primaryKey(),itemKey:text('item_key').notNull(),lotId:text('lot_id'),orderId:text('order_id'),kind:text('kind').notNull(),delta:integer('delta').notNull(),actor:text('actor').notNull(),reason:text('reason').notNull(),createdAt:text('created_at').notNull()},t=>[index('inventory_movements_created').on(t.createdAt)]);
export const orderChecks=sqliteTable('order_checks',{orderId:text('order_id').primaryKey().references(()=>orders.id),itemsChecked:text('items_checked').notNull().default('[]'),addressChecked:integer('address_checked',{mode:'boolean'}).notNull().default(false),packageChecked:integer('package_checked',{mode:'boolean'}).notNull().default(false),actor:text('actor').notNull(),updatedAt:text('updated_at').notNull()});
export const deliveryRules=sqliteTable('delivery_rules',{id:text('id').primaryKey(),name:text('name').notNull(),cepStart:text('cep_start').notNull(),cepEnd:text('cep_end').notNull(),feeCents:integer('fee_cents').notNull(),active:integer('active',{mode:'boolean'}).notNull().default(true)});
export const deliverySettings=sqliteTable('delivery_settings',{id:text('id').primaryKey(),enabled:integer('enabled',{mode:'boolean'}).notNull().default(false)});

export const orderCommercial=sqliteTable('order_commercial',{orderId:text('order_id').primaryKey().references(()=>orders.id),version:text('version').notNull(),quoteId:text('quote_id'),deliveryMode:text('delivery_mode').notNull().default('entrega'),region:text('region').notNull().default(''),driver:text('driver').notNull().default(''),sequence:integer('sequence').notNull().default(0),updatedAt:text('updated_at').notNull()});
export const orderQuotes=sqliteTable('order_quotes',{id:text('id').primaryKey(),orderId:text('order_id').notNull().references(()=>orders.id),lines:text('lines').notNull(),shippingCents:integer('shipping_cents').notNull(),note:text('note').notNull(),status:text('status').notNull(),actor:text('actor').notNull(),createdAt:text('created_at').notNull(),decidedAt:text('decided_at')},t=>[index('order_quotes_order').on(t.orderId)]);
export const orderPayments=sqliteTable('order_payments',{id:text('id').primaryKey(),orderId:text('order_id').notNull().references(()=>orders.id),amountCents:integer('amount_cents').notNull(),method:text('method').notNull(),paidOn:text('paid_on').notNull(),note:text('note').notNull(),actor:text('actor').notNull(),createdAt:text('created_at').notNull()},t=>[index('order_payments_order').on(t.orderId)]);
export const menuCosts=sqliteTable('menu_costs',{key:text('key').primaryKey(),ingredients:text('ingredients').notNull(),components:text('components').notNull(),packagingCents:integer('packaging_cents').notNull(),laborCents:integer('labor_cents').notNull(),otherCents:integer('other_cents').notNull(),version:text('version').notNull(),actor:text('actor').notNull(),updatedAt:text('updated_at').notNull()});

export const shoppingItems=sqliteTable('shopping_items',{
 id:text('id').primaryKey(),name:text('name').notNull(),quantity:text('quantity').notNull(),unit:text('unit').notNull(),ingredientKey:text('ingredient_key'),purchased:integer('purchased',{mode:'boolean'}).notNull().default(false),purchasedAt:text('purchased_at'),version:text('version').notNull(),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()
});
export const shoppingPurchases=sqliteTable('shopping_purchases',{
 shoppingId:text('shopping_id').primaryKey().references(()=>shoppingItems.id),supplyKey:text('supply_key').notNull(),quantity:text('quantity').notNull(),unit:text('unit').notNull(),totalCents:integer('total_cents').notNull(),unitPriceCents:integer('unit_price_cents').notNull(),updatedAt:text('updated_at').notNull()
},t=>[index('shopping_purchases_supply').on(t.supplyKey)]);
export const orderProfits=sqliteTable('order_profits',{
 orderId:text('order_id').primaryKey().references(()=>orders.id),version:text('version').notNull(),fingerprint:text('fingerprint').notNull(),inputs:text('inputs').notNull(),snapshot:text('snapshot').notNull(),actor:text('actor').notNull(),updatedAt:text('updated_at').notNull()
});
export const orderEdits=sqliteTable('order_edits',{
 id:text('id').primaryKey(),orderId:text('order_id').notNull().references(()=>orders.id),beforeState:text('before_state').notNull(),afterState:text('after_state').notNull(),actor:text('actor').notNull(),createdAt:text('created_at').notNull()
},t=>[index('order_edits_order_created').on(t.orderId,t.createdAt)]);

export const cartSnapshots=sqliteTable('cart_snapshots',{id:text('id').primaryKey(),customerId:text('customer_id'),items:text('items').notNull(),convertedOrderId:text('converted_order_id'),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()},t=>[index('cart_snapshots_updated').on(t.updatedAt)]);

export const packagingStock=sqliteTable('packaging_stock',{id:text('id').primaryKey(),name:text('name').notNull(),quantity:integer('quantity').notNull().default(0),unitCostCents:integer('unit_cost_cents').notNull().default(0),version:text('version').notNull(),updatedAt:text('updated_at').notNull()});
export const packagingMovements=sqliteTable('packaging_movements',{id:text('id').primaryKey(),packagingId:text('packaging_id').notNull().references(()=>packagingStock.id),kind:text('kind').notNull(),delta:integer('delta').notNull(),totalCents:integer('total_cents').notNull(),balance:integer('balance').notNull(),note:text('note').notNull(),actor:text('actor').notNull(),createdAt:text('created_at').notNull()},t=>[index('packaging_movements_item').on(t.packagingId,t.createdAt)]);
export const packagingLinks=sqliteTable('packaging_links',{id:text('id').primaryKey(),target:text('target').notNull(),packagingId:text('packaging_id').notNull().references(()=>packagingStock.id),qty:integer('qty').notNull(),version:text('version').notNull(),updatedAt:text('updated_at').notNull()});
