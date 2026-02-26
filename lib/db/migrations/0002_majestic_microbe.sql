CREATE TYPE "public"."payment_method" AS ENUM('mpesa', 'airtel', 'card', 'wallet');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'sub_admin', 'agent', 'professional', 'secretary', 'client', 'shopkeeper');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended', 'deleted');--> statement-breakpoint
ALTER TABLE "airtel_callbacks" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "analytics_events" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audit_logs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "availability" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "certifications" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chatbot_conversations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chatbot_messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "commission_tiers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "content_moderation" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "customers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "disputes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "favorites" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invoices" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mpesa_callbacks" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "order_items" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payment_methods" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payouts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "promotions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "provider_skills" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reports" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "saved_addresses" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "shop_reviews" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "shopkeepers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "support_tickets" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "airtel_callbacks" CASCADE;--> statement-breakpoint
DROP TABLE "analytics_events" CASCADE;--> statement-breakpoint
DROP TABLE "audit_logs" CASCADE;--> statement-breakpoint
DROP TABLE "availability" CASCADE;--> statement-breakpoint
DROP TABLE "certifications" CASCADE;--> statement-breakpoint
DROP TABLE "chatbot_conversations" CASCADE;--> statement-breakpoint
DROP TABLE "chatbot_messages" CASCADE;--> statement-breakpoint
DROP TABLE "commission_tiers" CASCADE;--> statement-breakpoint
DROP TABLE "content_moderation" CASCADE;--> statement-breakpoint
DROP TABLE "customers" CASCADE;--> statement-breakpoint
DROP TABLE "disputes" CASCADE;--> statement-breakpoint
DROP TABLE "favorites" CASCADE;--> statement-breakpoint
DROP TABLE "invoices" CASCADE;--> statement-breakpoint
DROP TABLE "mpesa_callbacks" CASCADE;--> statement-breakpoint
DROP TABLE "order_items" CASCADE;--> statement-breakpoint
DROP TABLE "orders" CASCADE;--> statement-breakpoint
DROP TABLE "payment_methods" CASCADE;--> statement-breakpoint
DROP TABLE "payouts" CASCADE;--> statement-breakpoint
DROP TABLE "product_categories" CASCADE;--> statement-breakpoint
DROP TABLE "products" CASCADE;--> statement-breakpoint
DROP TABLE "promotions" CASCADE;--> statement-breakpoint
DROP TABLE "provider_skills" CASCADE;--> statement-breakpoint
DROP TABLE "reports" CASCADE;--> statement-breakpoint
DROP TABLE "saved_addresses" CASCADE;--> statement-breakpoint
DROP TABLE "shop_reviews" CASCADE;--> statement-breakpoint
DROP TABLE "shopkeepers" CASCADE;--> statement-breakpoint
DROP TABLE "support_tickets" CASCADE;--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_customer_id_customers_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_receiver_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "transaction_logs" DROP CONSTRAINT "transaction_logs_wallet_id_wallets_id_fk";
--> statement-breakpoint
ALTER TABLE "verification_requests" DROP CONSTRAINT "verification_requests_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."booking_status";--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."booking_status";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE "public"."booking_status" USING "status"::"public"."booking_status";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."payment_status";--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'refunded');--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE "public"."payment_status" USING "status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "professional_profiles" ALTER COLUMN "verification_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."verification_status";--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('unverified', 'pending', 'verified', 'rejected');--> statement-breakpoint
ALTER TABLE "professional_profiles" ALTER COLUMN "verification_status" SET DATA TYPE "public"."verification_status" USING "verification_status"::"public"."verification_status";--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."verification_status";--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "status" SET DATA TYPE "public"."verification_status" USING "status"::"public"."verification_status";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "professional_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "professional_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "service_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "service_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "booking_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "total_amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "sender_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "sender_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ALTER COLUMN "user_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ALTER COLUMN "provider" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "oauth_accounts" ALTER COLUMN "provider" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ALTER COLUMN "provider_account_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_sessions" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "oauth_sessions" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "oauth_sessions" ALTER COLUMN "user_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "oauth_sessions" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_sessions" ALTER COLUMN "expires_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "booking_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "booking_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "professional_profiles" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "professional_profiles" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "professional_profiles" ALTER COLUMN "user_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "professional_profiles" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "professional_profiles" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "booking_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "booking_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "rating" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "professional_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "professional_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_logs" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "transaction_logs" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "transaction_logs" ALTER COLUMN "amount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "transaction_logs" ALTER COLUMN "amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_logs" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::text::"public"."role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'client';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "user_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_requests" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "user_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "balance" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "balance" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "balance" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "booking_code" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "client_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "duration" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "conversation_id" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "recipient_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "is_read" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD COLUMN "access_token" text;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD COLUMN "refresh_token" text;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD COLUMN "expires_at" integer;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD COLUMN "token_type" varchar(50);--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD COLUMN "scope" text;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD COLUMN "id_token" text;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_sessions" ADD COLUMN "session_token" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_sessions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "transaction_id" varchar(100);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "user_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "method" "payment_method" NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "mpesa_code" varchar(50);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "airtel_reference" varchar(100);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "phone_number" varchar(20);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "failure_reason" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "title" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "specializations" jsonb;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "experience" integer;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "certifications" jsonb;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "verification_type" varchar(50);--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "verification_status" "verification_status";--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "total_reviews" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "completed_jobs" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "response_time" integer;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "reviewer_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "professional_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "is_anonymous" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "category" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "base_price" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "duration" integer;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "availability" jsonb;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_logs" ADD COLUMN "user_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_logs" ADD COLUMN "type" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_logs" ADD COLUMN "related_id" varchar(100);--> statement-breakpoint
ALTER TABLE "transaction_logs" ADD COLUMN "balance_before" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "transaction_logs" ADD COLUMN "balance_after" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "first_name" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_name" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_phone_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "google_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "apple_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "oauth_provider" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD COLUMN "professional_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD COLUMN "document_type" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD COLUMN "submitted_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD COLUMN "review_notes" text;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "last_updated" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_professional_id_professional_profiles_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_logs" ADD CONSTRAINT "transaction_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_professional_id_professional_profiles_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_client_id_idx" ON "bookings" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "bookings_prof_id_idx" ON "bookings" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bookings_date_idx" ON "bookings" USING btree ("booking_date");--> statement-breakpoint
CREATE INDEX "messages_conv_id_idx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_recipient_idx" ON "messages" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "oauth_accounts_user_id_idx" ON "oauth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "oauth_accounts_provider_idx" ON "oauth_accounts" USING btree ("provider");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_accounts_provider_account_id_idx" ON "oauth_accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "oauth_sessions_user_id_idx" ON "oauth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_sessions_token_idx" ON "oauth_sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "payments_booking_id_idx" ON "payments" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "payments_user_id_idx" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_method_idx" ON "payments" USING btree ("method");--> statement-breakpoint
CREATE INDEX "prof_profiles_user_id_idx" ON "professional_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_booking_id_idx" ON "reviews" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "reviews_prof_id_idx" ON "reviews" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "services_prof_id_idx" ON "services" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "services_category_idx" ON "services" USING btree ("category");--> statement-breakpoint
CREATE INDEX "trans_log_user_id_idx" ON "transaction_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trans_log_type_idx" ON "transaction_logs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "trans_log_date_idx" ON "transaction_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_google_id_idx" ON "users" USING btree ("google_id");--> statement-breakpoint
CREATE INDEX "users_apple_id_idx" ON "users" USING btree ("apple_id");--> statement-breakpoint
CREATE INDEX "verif_req_user_id_idx" ON "verification_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verif_req_status_idx" ON "verification_requests" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "wallets_user_id_idx" ON "wallets" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "customer_id";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "receiver_id";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "transaction_reference";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "bio";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "experience_years";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "hourly_rate";--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP COLUMN "verified";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "transaction_logs" DROP COLUMN "wallet_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "full_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_hash";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "verification_requests" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "wallets" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booking_code_unique" UNIQUE("booking_code");--> statement-breakpoint
ALTER TABLE "oauth_sessions" ADD CONSTRAINT "oauth_sessions_session_token_unique" UNIQUE("session_token");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_transaction_id_unique" UNIQUE("transaction_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_phone_unique" UNIQUE("phone");--> statement-breakpoint
DROP TYPE "public"."user_role";