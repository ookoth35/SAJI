-- Create Support Agents Table
CREATE TABLE IF NOT EXISTS support_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID,
  status VARCHAR(50) DEFAULT 'offline',
  active_chats_count INTEGER DEFAULT 0,
  max_concurrent_chats INTEGER DEFAULT 5,
  accepts_chat BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT false,
  last_activity_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX support_agents_user_id_idx ON support_agents(user_id);
CREATE INDEX support_agents_status_idx ON support_agents(status);
CREATE INDEX support_agents_availability_idx ON support_agents(is_available);

-- Create Chat Escalations Table
CREATE TABLE IF NOT EXISTS chat_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  assigned_agent_id UUID REFERENCES support_agents(id) ON DELETE SET NULL,
  escalation_reason TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'normal',
  escalated_at TIMESTAMP DEFAULT NOW(),
  assigned_at TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX chat_escalations_conversation_id_idx ON chat_escalations(conversation_id);
CREATE INDEX chat_escalations_agent_id_idx ON chat_escalations(assigned_agent_id);
CREATE INDEX chat_escalations_status_idx ON chat_escalations(status);
CREATE INDEX chat_escalations_priority_idx ON chat_escalations(priority);

-- Create Agent Chat History Table
CREATE TABLE IF NOT EXISTS agent_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escalation_id UUID NOT NULL REFERENCES chat_escalations(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES support_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX agent_chat_history_escalation_id_idx ON agent_chat_history(escalation_id);
CREATE INDEX agent_chat_history_agent_id_idx ON agent_chat_history(agent_id);
CREATE INDEX agent_chat_history_user_id_idx ON agent_chat_history(user_id);
