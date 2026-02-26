# Quick Start: Support Chatbot System

## Installation & Setup

### 1. Install Dependencies
```bash
npm install @ai-sdk/groq
```

### 2. Set Environment Variables
Add to your `.env.local`:
```
GROQ_API_KEY=your_key_from_https://console.groq.com
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_neon_postgres_url
```

### 3. Seed Initial Data

```bash
# Seed support agents and users
npx ts-node scripts/seed.ts

# Seed FAQ and knowledge base
npx ts-node scripts/seed-knowledge-base.ts
```

### 4. Test the System

#### Test Chatbot
1. Go to any page in your app
2. Click the blue floating chat icon (bottom-right)
3. Type a message like "How do I book a service?"
4. AI responds with relevant FAQ information
5. Type "talk to human" to escalate

#### Test Support Agent Portal
1. Go to `http://localhost:3000/support-agent/login`
2. Login with demo credentials:
   - Email: `professional@saji.dev`
   - Password: `password123`
3. Click "Online" button
4. View escalated chats in dashboard
5. Reply to customers

---

## Key Features

### AI Chatbot
- Understands customer questions
- Searches knowledge base automatically
- Provides accurate SAJI-specific answers
- Seamlessly escalates to human agents

### Support Agent Portal
- Real-time escalation queue
- Chat management interface
- Agent availability status
- Priority-based ticket handling

### Knowledge Base Management
- FAQ database (searchable)
- Policy documents
- Auto-caching for performance
- Easy admin updates

---

## How the AI Gets Information

The AI searches 3 sources:

1. **FAQs** - Quick Q&A pairs about common issues
2. **Documents** - Detailed policies and guides
3. **Real Data** - Live booking, payment, user info (optional)

Results are embedded into the AI prompt so responses are accurate and contextual.

---

## Admin Actions

### Add FAQ
```bash
curl -X POST http://localhost:3000/api/knowledge-base/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "type": "faq",
    "category": "payments",
    "question": "What is your refund policy?",
    "answer": "Refunds are processed within 7 days...",
    "keywords": "refund, payment, return"
  }'
```

### Add Document
```bash
curl -X POST http://localhost:3000/api/knowledge-base/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "type": "document",
    "category": "policies",
    "title": "Service Terms & Conditions",
    "content": "All services are subject to...",
    "fileUrl": "https://example.com/terms.pdf"
  }'
```

### Register Support Agent
```sql
INSERT INTO support_agents (user_id, status, is_available, max_concurrent_chats)
VALUES ('user-uuid-here', 'offline', false, 5);
```

---

## API Reference

### For Customers
- **GET** `/api/chat/history?conversationId=xxx` - Get chat history
- **POST** `/api/chat/messages` - Send message
- **POST** `/api/chat/ai-response` - Get AI response
- **POST** `/api/chat/escalate` - Escalate to agent

### For Support Agents
- **GET** `/api/support-agent/check-status` - Verify agent role
- **GET** `/api/support-agent/escalations` - Get assigned chats
- **POST** `/api/support-agent/status` - Update availability
- **POST** `/api/chat/agent-reply` - Reply to customer

### For Knowledge Base
- **GET** `/api/knowledge-base/search?category=X&q=Y` - Search
- **POST** `/api/knowledge-base/create` - Create FAQ/Document (Admin only)

---

## Troubleshooting

### "AI service not configured"
- Check GROQ_API_KEY is set in environment
- Restart dev server after adding env var

### "User is not registered as a support agent"
- Run seed.ts to create demo support agent
- Or manually insert record in support_agents table

### Empty FAQ results
- Run `npm run seed-knowledge-base` to populate
- Or manually add FAQs via API

### Escalations not appearing for agent
- Agent must be marked "online" in dashboard
- Check agent has available chat slots

---

## Architecture Diagram

```
┌─────────────────┐
│   Customer      │
│   (Chatbot UI)  │
└────────┬────────┘
         │
    ┌────▼─────┐
    │ AI Layer  │
    │ (Groq)    │
    └────┬─────┘
         │
    ┌────▼────────────────────────┐
    │ Knowledge Source Layer       │
    ├──────────────────────────────┤
    │ • FAQs                       │
    │ • Documents                  │
    │ • Knowledge Cache            │
    │ • Live DB Queries            │
    └────┬────────────────────────┘
         │
    ┌────▼──────────────────────┐
    │ Chat Management           │
    ├──────────────────────────┤
    │ • Message Storage         │
    │ • Escalation Queue        │
    │ • Agent Assignment        │
    └────┬──────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │ Support Agent Portal          │
    ├───────────────────────────────┤
    │ • Dashboard                   │
    │ • Real-time Chat              │
    │ • Status Management           │
    │ • Analytics                   │
    └────────────────────────────────┘
```

---

## Performance Tips

1. **Cache Knowledge** - AI caches search results for 24 hours
2. **Limit FAQs** - Use categories to reduce search scope
3. **Index Database** - Ensure DB indexes on chat_escalations
4. **Monitor Agents** - Keep track of agent capacity
5. **Archive Chats** - Move old chats to archive after 30 days

---

For more details, see `CHATBOT_GUIDE.md`
