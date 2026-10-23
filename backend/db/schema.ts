import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const availability=sqliteTable('availability',{id:text('id').primaryKey(),active:integer('active',{mode:'boolean'}).notNull().default(true)});
export const customers=sqliteTable('customers',{
 id:text('id').primaryKey(),userId:text('user_id').notNull().unique(),cpfHash:text('cpf_hash').notNull().unique(),cpfLast:text('cpf_last').notNull(),name:text('name').notNull(),phone:text('phone').notNull(),address:text('address').notNull(),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()
});
export const orders=sqliteTable('orders',{
 id:text('id').primaryKey(),customerId:text('customer_id').notNull().references(()=>customers.id),requestId:text('request_id').notNull().unique(),items:text('items').notNull(),totalCents:integer('total_cents').notNull(),customerName:text('customer_name').notNull(),phone:text('phone').notNull(),address:text('address').notNull(),preferredDate:text('preferred_date').notNull(),notes:text('notes').notNull(),status:text('status').notNull().default('aguardando_confirmacao'),deliveryDate:text('delivery_date'),createdAt:text('created_at').notNull()
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
