ALTER TABLE `customers` ADD `deleted_at` text;
--> statement-breakpoint
CREATE TRIGGER prevent_orders_for_deleted_customer BEFORE INSERT ON orders
WHEN EXISTS (SELECT 1 FROM customers WHERE id=NEW.customer_id AND deleted_at IS NOT NULL)
BEGIN
 SELECT RAISE(ABORT, 'Cliente excluído: restaure o cadastro antes de registrar novos pedidos.');
END;
