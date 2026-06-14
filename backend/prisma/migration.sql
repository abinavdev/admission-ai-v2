-- 1. Enable pgvector extension in Supabase
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column as vector(768) to document_chunks table
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Create HNSW index for high performance Cosine Similarity searches
-- Note: Using vector_cosine_ops for cosine distance similarity
CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops);
