#!/usr/bin/env node
import "dotenv/config"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "../lib/db/schema"

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set")
  process.exit(1)
}

async function seedKnowledgeBase() {
  console.log("Starting knowledge base seeding...")

  try {
    const pool = new Pool({
      connectionString: DATABASE_URL,
    })

    const db = drizzle(pool, { schema })

    // Seed FAQs
    const faqs = [
      {
        category: "orders",
        question: "How do I book a service?",
        answer:
          "Visit the services page, browse available professionals, select one, choose your preferred date and time, and proceed to checkout. You'll receive a confirmation immediately.",
        keywords: "booking, service, professional, how to",
      },
      {
        category: "orders",
        question: "Can I cancel my booking?",
        answer:
          "Yes, you can cancel up to 24 hours before the service. Visit your bookings, select the service, and click Cancel. Cancellations within 24 hours may have penalties.",
        keywords: "cancel, cancellation, booking, refund",
      },
      {
        category: "payments",
        question: "What payment methods do you accept?",
        answer:
          "SAJI accepts M-Pesa, credit cards (Visa/Mastercard), debit cards, and bank transfers. Choose your preferred method at checkout.",
        keywords: "payment, methods, mpesa, card, bank",
      },
      {
        category: "payments",
        question: "How do I request a refund?",
        answer:
          "Go to your completed booking, click 'Request Refund', provide a reason, and submit. Refunds are processed within 5-7 business days. You must request within 7 days of service completion.",
        keywords: "refund, money back, payment, return, refund policy",
      },
      {
        category: "account",
        question: "How do I update my profile?",
        answer:
          "Go to Settings > Profile. You can update your name, phone number, profile picture, and bio. Click Save to apply changes.",
        keywords: "profile, update, change, settings, personal info",
      },
      {
        category: "account",
        question: "How do I reset my password?",
        answer:
          "Click 'Forgot Password' on the login page, enter your email, and check for a reset link. Click the link and create a new password. If you don't receive the email, check your spam folder.",
        keywords: "password, reset, forgot, login, security",
      },
      {
        category: "professionals",
        question: "How do I become a professional on SAJI?",
        answer:
          "Sign up as a Professional, complete your profile with qualifications, upload your portfolio, pass verification, and you're ready to accept bookings.",
        keywords: "professional, signup, register, vendor, provider",
      },
      {
        category: "professionals",
        question: "How are professionals rated?",
        answer:
          "Customers rate professionals 1-5 stars after service completion. Reviews are visible on your profile. High ratings increase your visibility and bookings.",
        keywords: "rating, reviews, feedback, stars, reputation",
      },
      {
        category: "disputes",
        question: "What if I'm not satisfied with the service?",
        answer:
          "You can open a dispute within 48 hours of service completion. Provide details and evidence. Our dispute resolution team will investigate and make a decision within 5 days.",
        keywords: "dispute, complaint, issue, resolution, quality",
      },
      {
        category: "general",
        question: "Is SAJI safe to use?",
        answer:
          "Yes! SAJI has strict verification for all professionals, secure payment processing, and 24/7 customer support. We handle disputes and protect both customers and professionals.",
        keywords: "safety, security, trust, verification, protection",
      },
    ]

    for (const faq of faqs) {
      await db
        .insert(schema.faqArticles)
        .values({
          category: faq.category,
          question: faq.question,
          answer: faq.answer,
          keywords: faq.keywords,
        })
        .onConflictDoNothing()
    }

    console.log("✓ FAQs seeded successfully:", faqs.length, "items")

    // Seed Knowledge Documents
    const documents = [
      {
        title: "Service Booking Terms",
        category: "policies",
        content:
          "All bookings on SAJI are subject to the following terms: 1) Bookings must be made at least 24 hours in advance. 2) Cancellations within 24 hours incur a 10% penalty. 3) No-shows result in 50% charge. 4) Services are performed based on the agreed scope. 5) Additional services requested during service are charged separately.",
      },
      {
        title: "Payment Security",
        category: "security",
        content:
          "SAJI uses industry-standard encryption (SSL/TLS) to protect all payment information. We never store full credit card details. All transactions are PCI-DSS compliant. Your payment information is encrypted end-to-end. In case of unauthorized transactions, report within 24 hours for investigation.",
      },
      {
        title: "Data Privacy Policy",
        category: "privacy",
        content:
          "SAJI collects only necessary information to provide services. We never sell your data to third parties. You can request data deletion anytime. Location data is only used for service matching. Payment data is handled by secure third-party processors. You have full control over your privacy settings.",
      },
      {
        title: "Professional Code of Conduct",
        category: "guidelines",
        content:
          "All professionals must: 1) Be punctual and professional. 2) Maintain high service quality. 3) Treat customers with respect. 4) Not discriminate. 5) Follow local laws and regulations. 6) Not engage in illegal activities. 7) Maintain confidentiality. Violations result in suspension or permanent ban from SAJI.",
      },
      {
        title: "Dispute Resolution Process",
        category: "disputes",
        content:
          "If you have a dispute: 1) Open a dispute within 48 hours of service completion. 2) Provide detailed description and evidence. 3) Our team will contact both parties for investigation. 4) Resolution decision is made within 5 business days. 5) Decisions are final and binding. We aim for fair outcomes for all parties.",
      },
    ]

    for (const doc of documents) {
      await db
        .insert(schema.knowledgeDocuments)
        .values({
          title: doc.title,
          category: doc.category,
          content: doc.content,
        })
        .onConflictDoNothing()
    }

    console.log("✓ Knowledge documents seeded successfully:", documents.length, "items")

    console.log("\n✓ Knowledge base seeding completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Seeding failed:", error)
    process.exit(1)
  }
}

seedKnowledgeBase()
