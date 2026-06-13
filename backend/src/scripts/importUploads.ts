import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { prisma } from '../config/database';
import { processDocument } from '../services/documentProcessor';
import { env } from '../config/env';

async function run() {
  const uploadDir = env.UPLOAD_DIR || 'uploads';
  const abs = path.resolve(process.cwd(), uploadDir);

  if (!fs.existsSync(abs)) {
    console.error('Uploads directory not found:', abs);
    process.exit(1);
  }

  const files = fs.readdirSync(abs);
  console.log('Found files in uploads:', files.length);

  for (const fileName of files) {
    const filePath = path.join(abs, fileName);
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) continue;

    // Check if document record already exists
    const existing = await prisma.document.findFirst({ where: { filePath } });
    if (existing) {
      console.log('Skipping existing document:', existing.name);
      continue;
    }

    const doc = await prisma.document.create({
      data: {
        name: fileName,
        size: Number(stats.size),
        mimeType: path.extname(fileName),
        filePath,
        status: 'QUEUED'
      }
    });

    console.log('Created document record for', fileName, 'id=', doc.id);
    // Process immediately (synchronously)
    await processDocument(doc.id);
    console.log('Processed document', fileName);
  }

  console.log('Import complete');
}

run().catch((e) => {
  console.error('Import failed', e);
  process.exit(1);
});
