-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    subscription_active BOOLEAN DEFAULT FALSE,
    subscription_expires_at TIMESTAMP,
    trial_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    user_prompt TEXT NOT NULL,
    user_params JSONB NOT NULL,
    workflow_state JSONB DEFAULT '{}',
    error_message TEXT,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create document_chunks table with vector embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER NOT NULL,
    embedding vector(1536), -- OpenAI embeddings dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sources table
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    year INTEGER,
    abstract TEXT,
    doi TEXT,
    credibility_score REAL DEFAULT 0.0,
    relevance_score REAL DEFAULT 0.0,
    citation TEXT,
    provider TEXT, -- 'perplexity', 'o3', 'claude'
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create drafts table
CREATE TABLE IF NOT EXISTS drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL,
    word_count INTEGER NOT NULL,
    citation_count INTEGER DEFAULT 0,
    quality_score REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
    evaluator TEXT NOT NULL, -- 'gemini', 'o3', 'claude', 'human'
    score REAL NOT NULL,
    feedback TEXT NOT NULL,
    strengths JSONB DEFAULT '[]',
    improvements JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create turnitin_reports table
CREATE TABLE IF NOT EXISTS turnitin_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
    submission_id TEXT,
    similarity_score REAL,
    ai_score REAL,
    highlighted_sections JSONB DEFAULT '[]',
    report_url TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create final_documents table
CREATE TABLE IF NOT EXISTS final_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'docx', 'txt', 'lo_report'
    file_url TEXT NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    transaction_id TEXT UNIQUE NOT NULL,
    amount_gbp REAL NOT NULL,
    amount_usdc REAL NOT NULL,
    currency TEXT DEFAULT 'USDC',
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    blockchain TEXT, -- 'solana', 'base'
    wallet_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create tutor_reviews table
CREATE TABLE IF NOT EXISTS tutor_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    tutor_id UUID, -- Would reference tutors table in full implementation
    status TEXT DEFAULT 'pending', -- 'pending', 'in_review', 'completed'
    feedback TEXT,
    grade TEXT,
    review_time_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

CREATE INDEX IF NOT EXISTS idx_documents_conversation_id ON documents(conversation_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_sources_conversation_id ON sources(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sources_verified ON sources(verified);
CREATE INDEX IF NOT EXISTS idx_sources_credibility_score ON sources(credibility_score);

CREATE INDEX IF NOT EXISTS idx_drafts_conversation_id ON drafts(conversation_id);
CREATE INDEX IF NOT EXISTS idx_drafts_version ON drafts(version);

CREATE INDEX IF NOT EXISTS idx_evaluations_draft_id ON evaluations(draft_id);
CREATE INDEX IF NOT EXISTS idx_turnitin_reports_draft_id ON turnitin_reports(draft_id);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development
INSERT INTO users (wallet_address, email, subscription_active) VALUES 
('0x1234567890123456789012345678901234567890', 'test@example.com', FALSE)
ON CONFLICT (wallet_address) DO NOTHING;

-- Create view for conversation statistics
CREATE OR REPLACE VIEW conversation_stats AS
SELECT 
    c.id,
    c.status,
    c.start_time,
    c.end_time,
    EXTRACT(EPOCH FROM (COALESCE(c.end_time, CURRENT_TIMESTAMP) - c.start_time)) / 60 as duration_minutes,
    COUNT(d.id) as document_count,
    COUNT(s.id) as source_count,
    COUNT(dr.id) as draft_count,
    MAX(dr.word_count) as final_word_count,
    AVG(e.score) as avg_evaluation_score,
    COUNT(CASE WHEN tr.similarity_score <= 10 AND tr.ai_score = 0 THEN 1 END) > 0 as turnitin_passed
FROM conversations c
LEFT JOIN documents d ON c.id = d.conversation_id
LEFT JOIN sources s ON c.id = s.conversation_id AND s.verified = TRUE
LEFT JOIN drafts dr ON c.id = dr.conversation_id
LEFT JOIN evaluations e ON dr.id = e.draft_id
LEFT JOIN turnitin_reports tr ON dr.id = tr.draft_id AND tr.status = 'completed'
GROUP BY c.id, c.status, c.start_time, c.end_time;