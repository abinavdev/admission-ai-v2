import fs from 'fs';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
import { prisma } from '../config/database';
import { getEmbedding } from './embedding';


const CHUNK_SIZE = 300;
const CHUNK_OVERLAP = 50;

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractTextFromTxt(filePath: string): string {
  return cleanText(fs.readFileSync(filePath, 'utf-8'));
}

async function extractTextFromPdf(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return cleanText(data.text);
}

function createChunks(text: string): string[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    const candidate = current ? `${current}\n\n${para}` : para;

    if (candidate.length <= CHUNK_SIZE) {
      current = candidate;
    } else {
      if (current.trim()) {
        chunks.push(current.trim());
        // overlap: carry the tail of the previous chunk
        const words = current.split(' ');
        const overlapWords = words.slice(Math.max(0, words.length - Math.floor(CHUNK_OVERLAP / 6)));
        current = overlapWords.join(' ') + '\n\n' + para;
      } else {
        // paragraph itself is bigger than CHUNK_SIZE — split by sentences
        const sentences = para.match(/[^.!?]+[.!?]+/g) ?? [para];
        for (const sentence of sentences) {
          if ((current + ' ' + sentence).length > CHUNK_SIZE) {
            if (current.trim()) {
              chunks.push(current.trim());
              const words = current.split(' ');
              const overlapWords = words.slice(Math.max(0, words.length - Math.floor(CHUNK_OVERLAP / 6)));
              current = overlapWords.join(' ') + ' ' + sentence.trim();
            } else {
              chunks.push(sentence.trim());
              current = '';
            }
          } else {
            current = current ? `${current} ${sentence.trim()}` : sentence.trim();
          }
        }
      }
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.filter((c) => c.length > 30);
}

export async function processDocument(documentId: string): Promise<void> {
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) return;

  await prisma.document.update({
    where: { id: documentId },
    data: { status: 'PROCESSING' },
  });

  try {
    const ext = path.extname(doc.filePath).toLowerCase();
    let text: string;

    if (ext === '.pdf') {
      text = await extractTextFromPdf(doc.filePath);
    } else if (ext === '.txt') {
      text = extractTextFromTxt(doc.filePath);
    } else {
      // .doc/.docx: attempt as text, graceful fallback
      try {
        text = extractTextFromTxt(doc.filePath);
      } catch {
        throw new Error(`Unsupported file format: ${ext}`);
      }
    }

    if (!text || text.length < 10) {
      throw new Error('No readable text extracted from document');
    }

    const chunks = createChunks(text);
    if (chunks.length === 0) {
      throw new Error('No text chunks could be created from document');
    }

    // Delete any previous chunks for this document
    await prisma.documentChunk.deleteMany({ where: { documentId } });

    await prisma.documentChunk.createMany({
      data: chunks.map((content, index) => ({
        documentId,
        content,
        chunkIndex: index,
      })),
    });

    // Fetch the newly created chunks to retrieve their database IDs
    const dbChunks = await prisma.documentChunk.findMany({
      where: { documentId },
      orderBy: { chunkIndex: 'asc' },
    });

    // Generate embeddings and store them in the database in small batches to respect rate limits
    const BATCH_SIZE = 5;
    const DELAY_BETWEEN_BATCHES_MS = 500;
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Retry helper for API call resilience
    const getEmbeddingWithRetry = async (text: string, retries = 3, delayMs = 1000): Promise<number[]> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          return await getEmbedding(text);
        } catch (err) {
          if (attempt === retries) throw err;
          console.warn(`[Embedding Ingestion Retry] Attempt ${attempt} failed: ${err instanceof Error ? err.message : String(err)}. Retrying in ${delayMs}ms...`);
          await delay(delayMs);
          delayMs *= 2; // Exponential backoff
        }
      }
      throw new Error('Unreachable');
    };

    for (let i = 0; i < dbChunks.length; i += BATCH_SIZE) {
      const batch = dbChunks.slice(i, i + BATCH_SIZE);
      
      await Promise.all(
        batch.map(async (chunk) => {
          const embedding = await getEmbeddingWithRetry(chunk.content);
          const vectorString = `[${embedding.join(',')}]`;
          await prisma.$executeRawUnsafe(
            `UPDATE document_chunks SET embedding = $1::vector WHERE id = $2`,
            vectorString,
            chunk.id
          );
        })
      );

      if (i + BATCH_SIZE < dbChunks.length) {
        await delay(DELAY_BETWEEN_BATCHES_MS);
      }
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSED' },
    });
  } catch (err) {
    console.error(`[RAG] Failed to process document ${documentId}:`, err);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' },
    });
  }
}
