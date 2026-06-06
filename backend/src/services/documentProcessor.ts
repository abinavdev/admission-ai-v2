import fs from 'fs';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
import { prisma } from '../config/database';

const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 175;

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
