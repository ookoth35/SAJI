import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  pgEnum,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ================================
   ENUMS
================================ */

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "sub_admin",
  "agent",
  "professional",
  "secretary",
  "client",
  "shopkeeper"
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "disputed"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded"
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "approved",
  "rejected"
]);

/* ================================
   USERS
================================ */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").default("client").notNull(),
  profileImage: text("profile_image"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  emailIdx: uniqueIndex("users_email_unique").on(table.email)
}));

/* ================================
   CUSTOMERS
================================ */

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow()
});

export const savedAddresses = pgTable("saved_addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .references(() => customers.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 100 }),
  addressLine: text("address_line").notNull(),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow()
});

export const favorites = pgTable("favorites", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .references(() => customers.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
});

/* ================================
   PROFESSIONALS
================================ */

export const professionalProfiles = pgTable("professional_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  experienceYears: integer("experience_years"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const providerSkills = pgTable("provider_skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  professionalId: uuid("professional_id")
    .references(() => professionalProfiles.id, { onDelete: "cascade" }),
  skillName: varchar("skill_name", { length: 255 }).notNull()
});

export const certifications = pgTable("certifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  professionalId: uuid("professional_id")
    .references(() => professionalProfiles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  issuedBy: varchar("issued_by", { length: 255 }),
  issueDate: timestamp("issue_date")
});

export const availability = pgTable("availability", {
  id: uuid("id").defaultRandom().primaryKey(),
  professionalId: uuid("professional_id")
    .references(() => professionalProfiles.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week"),
  startTime: varchar("start_time", { length: 10 }),
  endTime: varchar("end_time", { length: 10 })
});

/* ================================
   SERVICES
================================ */

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  professionalId: uuid("professional_id")
    .references(() => professionalProfiles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   BOOKINGS
================================ */

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .references(() => customers.id, { onDelete: "cascade" }),
  professionalId: uuid("professional_id")
    .references(() => professionalProfiles.id),
  serviceId: uuid("service_id")
    .references(() => services.id),
  bookingDate: timestamp("booking_date"),
  status: bookingStatusEnum("status").default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   PAYMENTS
================================ */

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .references(() => bookings.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  status: paymentStatusEnum("status").default("pending"),
  transactionReference: varchar("transaction_reference", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   MESSAGES
================================ */

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  senderId: uuid("sender_id").references(() => users.id),
  receiverId: uuid("receiver_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   REVIEWS
================================ */

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .references(() => bookings.id, { onDelete: "cascade" }),
  rating: integer("rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   WALLET
================================ */

export const wallets = pgTable("wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0"),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const transactionLogs = pgTable("transaction_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  walletId: uuid("wallet_id")
    .references(() => wallets.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 12, scale: 2 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   VERIFICATION
================================ */

export const verificationRequests = pgTable("verification_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  status: verificationStatusEnum("status").default("pending"),
  documentUrl: text("document_url"),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   OAUTH
================================ */

export const oauthAccounts = pgTable("oauth_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 100 }),
  providerAccountId: varchar("provider_account_id", { length: 255 })
});

export const oauthSessions = pgTable("oauth_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at")
});

/* ================================
   SHOPKEEPERS
================================ */

export const shopkeepers = pgTable("shopkeepers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  shopName: varchar("shop_name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   PRODUCT CATEGORIES
================================ */

export const productCategories = pgTable("product_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   PRODUCTS
================================ */

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  shopkeeperId: uuid("shopkeeper_id")
    .references(() => shopkeepers.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .references(() => productCategories.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(0),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   ORDERS
================================ */

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .references(() => customers.id, { onDelete: "cascade" }),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull()
});

/* ================================
   PROMOTIONS
================================ */

export const promotions = pgTable("promotions", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 100 }).notNull(),
  discountPercent: integer("discount_percent"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   SHOP REVIEWS
================================ */

export const shopReviews = pgTable("shop_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  shopkeeperId: uuid("shopkeeper_id")
    .references(() => shopkeepers.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .references(() => customers.id),
  rating: integer("rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   COMMISSION TIERS
================================ */

export const commissionTiers = pgTable("commission_tiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  role: userRoleEnum("role"),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   PAYOUTS
================================ */

export const payouts = pgTable("payouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 50 }).default("pending"),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at")
});

/* ================================
   INVOICES
================================ */

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  reference: varchar("reference", { length: 255 }),
  amount: decimal("amount", { precision: 12, scale: 2 }),
  issuedAt: timestamp("issued_at").defaultNow()
});

/* ================================
   PAYMENT METHODS
================================ */

export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }), // mpesa, airtel, card
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   M-PESA CALLBACKS
================================ */

export const mpesaCallbacks = pgTable("mpesa_callbacks", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: varchar("transaction_id", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  amount: decimal("amount", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 50 }),
  rawPayload: text("raw_payload"),
  receivedAt: timestamp("received_at").defaultNow()
});

/* ================================
   AIRTEL CALLBACKS
================================ */

export const airtelCallbacks = pgTable("airtel_callbacks", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: varchar("transaction_id", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  amount: decimal("amount", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 50 }),
  rawPayload: text("raw_payload"),
  receivedAt: timestamp("received_at").defaultNow()
});

/* ================================
   DISPUTES
================================ */

export const disputes = pgTable("disputes", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .references(() => bookings.id, { onDelete: "cascade" }),
  raisedBy: uuid("raised_by")
    .references(() => users.id),
  reason: text("reason"),
  status: varchar("status", { length: 50 }).default("open"),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   REPORTS
================================ */

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportedUserId: uuid("reported_user_id")
    .references(() => users.id),
  reportedBy: uuid("reported_by")
    .references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   CONTENT MODERATION
================================ */

export const contentModeration = pgTable("content_moderation", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentType: varchar("content_type", { length: 100 }),
  contentId: uuid("content_id"),
  status: varchar("status", { length: 50 }).default("pending"),
  reviewedBy: uuid("reviewed_by")
    .references(() => users.id),
  reviewedAt: timestamp("reviewed_at")
});

/* ================================
   SUPPORT TICKETS
================================ */

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id),
  subject: varchar("subject", { length: 255 }),
  message: text("message"),
  status: varchar("status", { length: 50 }).default("open"),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   CHATBOT
================================ */

export const chatbotConversations = pgTable("chatbot_conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id),
  startedAt: timestamp("started_at").defaultNow()
});

export const chatbotMessages = pgTable("chatbot_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .references(() => chatbotConversations.id, { onDelete: "cascade" }),
  sender: varchar("sender", { length: 50 }), // user or bot
  message: text("message"),
  sentAt: timestamp("sent_at").defaultNow()
});

export const supportAgents = pgTable("support_agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  departmentId: uuid("department_id"),
  status: varchar("status", { length: 50 }).default("offline"), // online, offline, busy, on_break
  activeChatsCount: integer("active_chats_count").default(0),
  maxConcurrentChats: integer("max_concurrent_chats").default(5),
  acceptsChat: boolean("accepts_chat").default(true),
  isAvailable: boolean("is_available").default(false),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdIdx: index("support_agents_user_id_idx").on(table.userId),
  statusIdx: index("support_agents_status_idx").on(table.status),
  availabilityIdx: index("support_agents_availability_idx").on(table.isAvailable)
}));

export const chatEscalations = pgTable("chat_escalations", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .references(() => chatbotConversations.id, { onDelete: "cascade" })
    .notNull(),
  assignedAgentId: uuid("assigned_agent_id")
    .references(() => supportAgents.id, { onDelete: "set null" }),
  escalationReason: text("escalation_reason"),
  status: varchar("status", { length: 50 }).default("pending"), // pending, assigned, in_progress, resolved, closed
  priority: varchar("priority", { length: 50 }).default("normal"), // low, normal, high, urgent
  escalatedAt: timestamp("escalated_at").defaultNow(),
  assignedAt: timestamp("assigned_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  conversationIdIdx: index("chat_escalations_conversation_id_idx").on(table.conversationId),
  assignedAgentIdx: index("chat_escalations_agent_id_idx").on(table.assignedAgentId),
  statusIdx: index("chat_escalations_status_idx").on(table.status),
  priorityIdx: index("chat_escalations_priority_idx").on(table.priority)
}));

export const agentChatHistory = pgTable("agent_chat_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  escalationId: uuid("escalation_id")
    .references(() => chatEscalations.id, { onDelete: "cascade" })
    .notNull(),
  agentId: uuid("agent_id")
    .references(() => supportAgents.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  sender: varchar("sender", { length: 50 }).notNull(), // agent or user
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at").defaultNow()
}, (table) => ({
  escalationIdIdx: index("agent_chat_history_escalation_id_idx").on(table.escalationId),
  agentIdIdx: index("agent_chat_history_agent_id_idx").on(table.agentId),
  userIdIdx: index("agent_chat_history_user_id_idx").on(table.userId)
}))

/* ================================
   CHATBOT KNOWLEDGE BASE
================================ */

export const faqArticles = pgTable("faq_articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  category: varchar("category", { length: 100 }).notNull(), // orders, payments, account, services, etc
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  keywords: text("keywords"), // comma-separated for search
  isActive: boolean("is_active").default(true),
  views: integer("views").default(0),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  categoryIdx: index("faq_articles_category_idx").on(table.category),
  activeIdx: index("faq_articles_active_idx").on(table.isActive)
}));

export const knowledgeDocuments = pgTable("knowledge_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // policies, guides, terms, etc
  content: text("content").notNull(),
  fileUrl: varchar("file_url", { length: 500 }), // for PDFs or uploaded docs
  embedding: text("embedding"), // JSON string of embedding vectors for semantic search
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  categoryIdx: index("knowledge_documents_category_idx").on(table.category),
  activeIdx: index("knowledge_documents_active_idx").on(table.isActive)
}));

export const aiKnowledgeCache = pgTable("ai_knowledge_cache", {
  id: uuid("id").defaultRandom().primaryKey(),
  queryHash: varchar("query_hash", { length: 64 }).unique(),
  relatedFaqIds: text("related_faq_ids"), // JSON array of FAQ IDs
  relatedDocIds: text("related_doc_ids"), // JSON array of document IDs
  context: text("context"), // cached context for the AI
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  expiresIdx: index("ai_knowledge_cache_expires_idx").on(table.expiresAt)
}));

/* ================================
   ANALYTICS EVENTS
================================ */

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id),
  eventType: varchar("event_type", { length: 100 }),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow()
});

/* ================================
   AUDIT LOGS
================================ */

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  performedBy: uuid("performed_by")
    .references(() => users.id),
  action: varchar("action", { length: 255 }),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: uuid("entity_id"),
  createdAt: timestamp("created_at").defaultNow()
});

