import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const availability=sqliteTable('availability',{id:text('id').primaryKey(),active:integer('active',{mode:'boolean'}).notNull().default(true)});
export const customers=sqliteTable('customers',{
 id:text('id').primaryKey(),userId:text('user_id').notNull().unique(),cpfHash:text('cpf_hash').notNull().unique(),cpfLast:text('cpf_last').notNull(),name:text('name').notNull(),phone:text('phone').notNull(),address:text('address').notNull(),addressDetails:text('address_details'),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()
});
export const orderNumbers=sqliteTable('order_numbers',{id:integer('id').primaryKey({autoIncrement:true}),requestId:text('request_id').notNull().unique()});
export const orders=sqliteTable('orders',{
 id:text('id').primaryKey(),orderNumber:integer('order_number').unique(),deletedAt:text('deleted_at'),stockBatchId:text('stock_batch_id'),customerId:text('customer_id').notNull().references(()=>customers.id),requestId:text('request_id').notNull().unique(),items:text('items').notNull(),totalCents:integer('total_cents').notNull(),customerName:text('customer_name').notNull(),phone:text('phone').notNull(),address:text('address').notNull(),addressDetails:text('address_details'),preferredDate:text('preferred_date').notNull(),notes:text('notes').notNull(),paymentMethod:text('payment_method'),status:text('status').notNull().default('aguardando_confirmacao'),deliveryDate:text('delivery_date'),createdAt:text('created_at').notNull()
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
