# Support Chatbot & Agent System - Complete Implementation Guide

## Overview
Your SAJI platform now has a fully integrated support system with AI-powered chatbot, human escalation, and support agent portal.

---

## Architecture

### 1. Frontend Components

#### Customer-Facing
- **Floating Chat Button** (`components/floating-chat-button.tsx`)
  - Blue pulse button at bottom-right corner
  - Opens full-screen chat interface at `/chatbot`
  
- **Chatbot Page** (`app/chatbot/page.tsx`)
  - AI-powered responses using Groq
  - Automatic escalation detection
  - Real-time message handling
  - Conversation persistence

### 2. Support Agent Portal
- **Login Page** (`app/support-agent/login/page.tsx`)
  - Email/password authentication
  - Role verification (must be registered support agent)
  
- **Dashboard** (`app/support-agent/page.tsx`)
  - View all escalated chats
  - Active chat management
  - Status tracking (online/offline/busy/on_break)
  - Real-time message replies

---

## Database Schema

### New Tables

#### `support_agents`
- `id` - UUID primary key
- `userId` - References user (foreign key)
- `status` - online | offline | busy | on_break
- `activeChatsCount` - Current active conversations
- `maxConcurrentChats` - Capacity limit (default: 5)
- `isAvailable` - Boolean flag
- `lastActivityAt` - Timestamp for activity tracking

#### `chat_escalations`
- `id` - UUID primary key
- `conversationId` - References chatbot conversation
- `assignedAgentId` - References support agent
- `status` - pending | assigned | in_progress | resolved | closed
- `priority` - low | normal | high | urgent
- `escalationReason` - Text description
- `escalatedAt` - Timestamp
- `assignedAt` - Timestamp when assigned to agent
- `resolvedAt` - Timestamp when resolved

#### `agent_chat_history`
- `id` - UUID primary key
- `escalationId` - References escalation
- `agentId` - References support agent
- `userId` - References customer
- `sender` - agent | user
- `message` - Text content
- `isRead` - Boolean
- `sentAt` - Timestamp

#### `faq_articles` (Knowledge Base)
- `id` - UUID primary key
- `category` - FAQ category (orders, payments, account, etc.)
- `question` - Question text
- `answer` - Answer text
- `keywords` - Comma-separated keywords for search
- `isActive` - Boolean
- `views` - View count for analytics
- `createdBy` - Admin user reference
- `createdAt` / `updatedAt` - Timestamps

#### `knowledge_documents` (Knowledge Base)
- `id` - UUID primary key
- `title` - Document title
- `category` - Document category
- `content` - Full text content
- `fileUrl` - URL to uploaded PDF or document
- `embedding` - JSON embeddings for semantic search
- `isActive` - Boolean
- `createdBy` - Admin user reference
- `createdAt` / `updatedAt` - Timestamps

#### `ai_knowledge_cache` (Performance)
- Caches query results and related knowledge sources
- 24-hour expiration for automatic cleanup

---

## API Endpoints

### Chat API

#### `POST /api/chat/messages`
Save user message to database
- Body: `{ conversationId, message, userId }`

#### `GET /api/chat/history`
Get conversation history
- Query: `conversationId`

#### `POST /api/chat/ai-response`
Generate AI response using Groq + knowledge base
- Body: `{ conversationId, message, userId }`
- Returns: AI response + knowledge sources used

#### `POST /api/chat/escalate`
Escalate chat to human agent
- Body: `{ conversationId, escalationReason, priority }`

#### `GET /api/chat/agents/available`
Get list of available support agents
- Returns: Online agents with available capacity

#### `POST /api/chat/agent-reply`
Agent sends reply to escalated chat
- Body: `{ escalationId, message }`

### Support Agent API

#### `GET /api/support-agent/check-status`
Verify if user is a support agent
- Header: `Authorization: Bearer {token}`

#### `GET /api/support-agent/escalations`
Get all assigned escalations for agent
- Header: `Authorization: Bearer {token}`
- Returns: List of escalations + messages + stats

#### `POST /api/support-agent/status`
Update agent's availability status
- Header: `Authorization: Bearer {token}`
- Body: `{ status: "online" | "offline" | "busy" | "on_break" }`

### Knowledge Base API

#### `GET /api/knowledge-base/search`
Search FAQs and documents
- Query: `category`, `q` (search term)
- Returns: Matching FAQs and documents

#### `POST /api/knowledge-base/create`
Create new FAQ or document (Admin only)
- Header: `Authorization: Bearer {token}`
- Body: 
  - For FAQ: `{ type: "faq", category, question, answer, keywords }`
  - For Document: `{ type: "document", category, title, content, fileUrl }`

---

## AI Knowledge Integration

### How the AI Gets Information

The chatbot uses a **hybrid knowledge approach**:

1. **FAQ Database** - Searchable Q&A pairs about SAJI
2. **Knowledge Documents** - Policies, guides, terms and conditions
3. **Live Database Queries** - Real-time info about bookings, payments, etc.
4. **Knowledge Cache** - Cached results for performance

### AI Response Flow

```
1. User sends message
2. System searches relevant FAQs & documents
3. Knowledge context is built from search results
4. System prompt includes:
   - SAJI platform context
   - Found FAQ answers
   - Relevant document excerpts
5. Groq LLM generates response using full context
6. Response is saved to database
7. Cache is updated for future similar queries
```

### Example System Prompt
```
You are SAJI Support Assistant...

## Relevant FAQs:
Q: How do I book a service?
A: Visit the services page, select a professional...

## Relevant Information:
[Booking Policies]
Services must be booked 24 hours in advance...

Now respond helpfully to the customer's question.
```

---

## How to Use

### For Customers
1. Click floating chat button (bottom-right)
2. Chat with AI assistant
3. If issue needs human help, type "talk to human support" or "escalate"
4. Automatically connected to available agent

### For Support Agents
1. Access `/support-agent/login`
2. Login with professional account
3. Change status to "online"
4. View escalated chats in dashboard
5. Reply to customers in real-time
6. Mark as resolved when done

### For Admins (Creating Knowledge Base)
POST to `/api/knowledge-base/create` with:

```json
{
  "type": "faq",
  "category": "payments",
  "question": "How do I request a refund?",
  "answer": "Go to your booking, click... You have 7 days to request refunds.",
  "keywords": "refund, money back, payment, return"
}
```

---

## Environment Variables Required

```
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_neon_database_url
```

---

## Support Agent Registration

Professionals can become support agents by:

1. **Admin adds them via database** 
   ```sql
   INSERT INTO support_agents (user_id, status, is_available, max_concurrent_chats)
   VALUES (user_uuid, 'offline', false, 5)
   ```

2. **Or they can request through admin panel** (when built)

Demo credentials:
- Email: `professional@saji.dev`
- Password: `password123`

---

## Features

✅ AI-powered customer support via Groq
✅ Multi-source knowledge base (FAQ + Documents + Live Data)
✅ Automatic escalation detection
✅ Human agent chat interface
✅ Real-time message handling
✅ Agent availability tracking
✅ Chat history persistence
✅ Priority-based escalation queue
✅ Admin knowledge base management
✅ Performance caching

---

## Next Steps

1. **Populate Knowledge Base** - Add FAQs and documents for your platform
2. **Register Support Agents** - Add professionals as support agents
3. **Customize AI Prompts** - Adjust system prompt based on your needs
4. **Add Analytics** - Track chat metrics and agent performance
5. **Implement Real-time Updates** - Use WebSockets for live chat updates
6. **Mobile App** - Extend chatbot to mobile platforms

---

## Troubleshooting

### AI Responses are Generic
- Add more FAQs and documents to the knowledge base
- Update system prompt with more SAJI-specific context

### Escalations Not Working
- Verify GROQ_API_KEY is set
- Check if support agents are marked as "online"
- Review `/api/chat/agents/available` endpoint

### Agent Can't Login
- Confirm user is registered as support agent in `support_agents` table
- Check JWT_SECRET is consistent
- Verify token hasn't expired

---

Last Updated: 2026-02-26
