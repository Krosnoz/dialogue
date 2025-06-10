ALTER TABLE "message" ADD COLUMN "embedding" vector(1536);--> statement-breakpoint
CREATE INDEX "embedding_index" ON "message" USING hnsw ("embedding" vector_cosine_ops);