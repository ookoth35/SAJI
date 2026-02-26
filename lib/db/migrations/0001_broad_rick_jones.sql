CREATE TYPE "public"."user_role" AS ENUM('admin', 'sub_admin', 'agent', 'professional', 'secretary', 'client', 'shopkeeper');--> statement-breakpoint
ALTER TYPE "public"."booking_status" ADD VALUE 'disputed';--> statement-breakpoint
CREATE TABLE "airtel_callbacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" varchar(255),
	"phone_number" varchar(20),
	"amount" numeric(12, 2),
	"status" varchar(50),
	"raw_payload" text,
	"received_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"event_type" varchar(100),
	"metadata" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"performed_by" uuid,
	"action" varchar(255),
	"entity_type" varchar(100),
	"entity_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professional_id" uuid,
	"day_of_week" integer,
	"start_time" varchar(10),
	"end_time" varchar(10)
);
--> statement-breakpoint
CREATE TABLE "certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professional_id" uuid,
	"title" varchar(255),
	"issued_by" varchar(255),
	"issue_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "chatbot_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"started_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chatbot_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid,
	"sender" varchar(50),
	"message" text,
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commission_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "user_role",
	"percentage" numeric(5, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_moderation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" varchar(100),
	"content_id" uuid,
	"status" varchar(50) DEFAULT 'pending',
	"reviewed_by" uuid,
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid,
	"raised_by" uuid,
	"reason" text,
	"status" varchar(50) DEFAULT 'open',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"service_id" uuid
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"reference" varchar(255),
	"amount" numeric(12, 2),
	"issued_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mpesa_callbacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" varchar(255),
	"phone_number" varchar(20),
	"amount" numeric(12, 2),
	"status" varchar(50),
	"raw_payload" text,
	"received_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid,
	"product_id" uuid,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"total_amount" numeric(12, 2),
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"type" varchar(50),
	"details" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"amount" numeric(12, 2),
	"status" varchar(50) DEFAULT 'pending',
	"requested_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shopkeeper_id" uuid,
	"category_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"stock" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(100) NOT NULL,
	"discount_percent" integer,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "provider_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professional_id" uuid,
	"skill_name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reported_user_id" uuid,
	"reported_by" uuid,
	"reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"label" varchar(100),
	"address_line" text NOT NULL,
	"city" varchar(100),
	"state" varchar(100),
	"postal_code" varchar(20),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shop_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shopkeeper_id" uuid,
	"customer_id" uuid,
	"rating" integer,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shopkeepers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"shop_name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"subject" varchar(255),
	"message" text,
	"status" varchar(50) DEFAULT 'open',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_booking_code_unique";--> statement-breakpoint
ALTER TABLE "oauth_sessions" DROP CONSTRAINT "oauth_sessions_session_token_unique";--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_transaction_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_phone_unique";--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_client_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_recipient_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_reviewer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_professional_id_professional_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "transaction_logs" DROP CONSTRAINT "transaction_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "verification_requests" DROP CONSTRAINT "verification_requests_professional_id_professional_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "verification_requests" DROP CONSTRAINT "verification_requests_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."payment_status";--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE "public"."payment_status" USING "status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."verification_status";--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."verification_status";--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "status" SET DATA TYPE "public"."verification_status" USING "status"::"public"."verification_status";--> statement-breakpoint
DROP INDEX "bookings_client_id_idx";--> statement-breakpoint
DROP INDEX "bookings_prof_id_idx";--> statement-breakpoint
DROP INDEX "bookings_status_idx";--> statement-breakpoint
DROP INDEX "bookings_date_idx";--> statement-breakpoint
DROP INDEX "messages_conv_id_idx";--> statement-breakpoint
DROP INDEX "messages_sender_idx";--> statement-breakpoint
DROP INDEX "messages_recipient_idx";--> statement-breakpoint
DROP INDEX "oauth_accounts_user_id_idx";--> statement-breakpoint
DROP INDEX "oauth_accounts_provider_idx";--> statement-breakpoint
DROP INDEX "oauth_accounts_provider_account_id_idx";--> statement-breakpoint
DROP INDEX "oauth_sessions_user_id_idx";--> statement-breakpoint
DROP INDEX "oauth_sessions_token_idx";--> statement-breakpoint
DROP INDEX "payments_booking_id_idx";--> statement-breakpoint
DROP INDEX "payments_user_id_idx";--> statement-breakpoint
DROP INDEX "payments_status_idx";--> statement-breakpoint
DROP INDEX "payments_method_idx";--> statement-breakpoint
DROP INDEX "prof_profiles_user_id_idx";--> statement-breakpoint
DROP INDEX "reviews_booking_id_idx";--> statement-breakpoint
DROP INDEX "reviews_prof_id_idx";--> statement-breakpoint
DROP INDEX "services_prof_id_idx";--> statement-breakpoint
DROP INDEX "services_category_idx";--> statement-breakpoint
DROP INDEX "trans_log_user_id_idx";--> statement-breakpoint
DROP INDEX "trans_log_type_idx";--> statement-breakpoint
DROP INDEX "trans_log_date_idx";--> statement-breakpoint
DROP INDEX "users_email_idx";--> statement-breakpoint
DROP INDEX "users_phone_idx";--> statement-breakpoint
DROP INDEX "users_role_idx";--> statement-breakpoint
DROP INDEX "users_google_id_idx";--> statement-breakpoint
DROP INDEX "users_apple_id_idx";--> statement-breakpoint
DROP INDEX "verif_req_user_id_idx";--> statement-breakpoint
DROP INDEX "verif_req_status_idx";--> statement-breakpoint
DROP INDEX "wallets_user_id_idx";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "professional_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "professional_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "service_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "service_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "booking_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "total_amount" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "sender_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "sender_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "oauth_accounts" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ALTER COLUMN "provider" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "oauth_accounts" ALTER COLUMN "provider" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ALTER COLUMN "provider_account_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_sessions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "oauth_sessions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "oauth_sessions" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "oauth_sessions" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_sessions" ALTER COLUMN "expires_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "booking_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "booking_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "amount" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "professional_profiles" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "professional_profiles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "professional_profiles" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "professional_profiles" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "professional_profiles" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "booking_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "booking_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "rating" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "professional_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "professional_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_logs" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "transaction_logs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "transaction_logs" ALTER COLUMN "amount" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "transaction_logs" ALTER COLUMN "amount" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_logs" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::text::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'client';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "balance" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "balance" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "balance" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "customer_id" uuid;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "receiver_id" uuid;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "transaction_reference" varchar(255);--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "experience_years" integer;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "hourly_rate" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "title" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "price" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_logs" ADD COLUMN "wallet_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "full_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability" ADD CONSTRAINT "availability_professional_id_professional_profiles_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_professional_id_professional_profiles_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot_conversations" ADD CONSTRAINT "chatbot_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot_messages" ADD CONSTRAINT "chatbot_messages_conversation_id_chatbot_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chatbot_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_moderation" ADD CONSTRAINT "content_moderation_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raised_by_users_id_fk" FOREIGN KEY ("raised_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_shopkeeper_id_shopkeepers_id_fk" FOREIGN KEY ("shopkeeper_id") REFERENCES "public"."shopkeepers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_skills" ADD CONSTRAINT "provider_skills_professional_id_professional_profiles_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_user_id_users_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_addresses" ADD CONSTRAINT "saved_addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_reviews" ADD CONSTRAINT "shop_reviews_shopkeeper_id_shopkeepers_id_fk" FOREIGN KEY ("shopkeeper_id") REFERENCES "public"."shopkeepers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_reviews" ADD CONSTRAINT "shop_reviews_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopkeepers" ADD CONSTRAINT "shopkeepers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_logs" ADD CONSTRAINT "transaction_logs_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "booking_code";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "client_id";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "duration";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "conversation_id";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "recipient_id";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "is_read";--> statement-breakpoint
ALTER TABLE "oauth_accounts" DROP COLUMN "access_token";--> statement-breakpoint
ALTER TABLE "oauth_accounts" DROP COLUMN "refresh_token";--> statement-breakpoint
ALTER TABLE "oauth_accounts" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "oauth_accounts" DROP COLUMN "token_type";--> statement-breakpoint
ALTER TABLE "oauth_accounts" DROP COLUMN "scope";--> statement-breakpoint
ALTER TABLE "oauth_accounts" DROP COLUMN "id_token";--> statement-breakpoint
ALTER TABLE "oauth_accounts" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "oauth_accounts" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "oauth_sessions" DROP COLUMN "session_token";--> statement-breakpoint
ALTER TABLE "oauth_sessions" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "transaction_id";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "method";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "mpesa_code";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "airtel_reference";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "phone_number";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "failure_reason";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "specializations";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "experience";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "certifications";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "verification_type";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "verification_status";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "total_reviews";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "completed_jobs";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "response_time";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "reviewer_id";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "professional_id";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "is_anonymous";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "base_price";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "duration";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "availability";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "transaction_logs" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "transaction_logs" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "transaction_logs" DROP COLUMN "related_id";--> statement-breakpoint
ALTER TABLE "transaction_logs" DROP COLUMN "balance_before";--> statement-breakpoint
ALTER TABLE "transaction_logs" DROP COLUMN "balance_after";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "bio";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "is_email_verified";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "is_phone_verified";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "google_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "apple_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "oauth_provider";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "profile_completed_at";--> statement-breakpoint
ALTER TABLE "verification_requests" DROP COLUMN "professional_id";--> statement-breakpoint
ALTER TABLE "verification_requests" DROP COLUMN "document_type";--> statement-breakpoint
ALTER TABLE "verification_requests" DROP COLUMN "submitted_at";--> statement-breakpoint
ALTER TABLE "verification_requests" DROP COLUMN "reviewed_at";--> statement-breakpoint
ALTER TABLE "verification_requests" DROP COLUMN "review_notes";--> statement-breakpoint
ALTER TABLE "wallets" DROP COLUMN "last_updated";--> statement-breakpoint
DROP TYPE "public"."payment_method";--> statement-breakpoint
DROP TYPE "public"."role";--> statement-breakpoint
DROP TYPE "public"."user_status";