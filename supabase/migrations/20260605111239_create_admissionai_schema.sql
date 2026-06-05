-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types
CREATE TYPE user_role AS ENUM ('ADMIN', 'ADMISSION_OFFICER', 'VIEWER');
CREATE TYPE lead_status AS ENUM ('NEW', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'CONVERTED');
CREATE TYPE lead_source AS ENUM ('CHAT', 'VOICE');
CREATE TYPE document_status AS ENUM ('QUEUED', 'PROCESSING', 'PROCESSED', 'FAILED');
CREATE TYPE call_status AS ENUM ('COMPLETED', 'MISSED', 'VOICEMAIL');
CREATE TYPE message_role AS ENUM ('USER', 'ASSISTANT');

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'ADMISSION_OFFICER',
  status TEXT NOT NULL DEFAULT 'Active',
  last_login TIMESTAMPTZ,
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_users" ON users FOR SELECT TO authenticated USING (auth.uid()::text = id OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'));
CREATE POLICY "insert_users" ON users FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'));
CREATE POLICY "update_users" ON users FOR UPDATE TO authenticated USING (auth.uid()::text = id OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid()::text AND u.role = 'ADMIN')) WITH CHECK (auth.uid()::text = id OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'));
CREATE POLICY "delete_users" ON users FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'));

-- Leads table
CREATE TABLE leads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  course TEXT NOT NULL DEFAULT '',
  status lead_status NOT NULL DEFAULT 'NEW',
  source lead_source NOT NULL,
  assigned_to TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_leads" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_leads" ON leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_leads" ON leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_leads" ON leads FOR DELETE TO authenticated USING (true);

-- Chat sessions table
CREATE TABLE chat_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_name TEXT NOT NULL,
  course_interest TEXT,
  agent_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_chat_sessions" ON chat_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_chat_sessions" ON chat_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_chat_sessions" ON chat_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_chat_sessions" ON chat_sessions FOR DELETE TO authenticated USING (true);

-- Chat messages table
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_chat_messages" ON chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_chat_messages" ON chat_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_chat_messages" ON chat_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_chat_messages" ON chat_messages FOR DELETE TO authenticated USING (true);

-- Documents table
CREATE TABLE documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  status document_status NOT NULL DEFAULT 'QUEUED',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_documents" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_documents" ON documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_documents" ON documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_documents" ON documents FOR DELETE TO authenticated USING (true);

-- Document chunks table
CREATE TABLE document_chunks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_document_chunks" ON document_chunks FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_document_chunks" ON document_chunks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_document_chunks" ON document_chunks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_document_chunks" ON document_chunks FOR DELETE TO authenticated USING (true);

-- Call logs table
CREATE TABLE call_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  duration TEXT NOT NULL,
  status call_status NOT NULL,
  transcript TEXT,
  called_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_call_logs" ON call_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_call_logs" ON call_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_call_logs" ON call_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_call_logs" ON call_logs FOR DELETE TO authenticated USING (true);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
