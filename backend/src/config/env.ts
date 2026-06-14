import dotenv from 'dotenv';
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET;

if (NODE_ENV === 'production' && (!JWT_SECRET || JWT_SECRET === 'fallback_secret_change_me' || JWT_SECRET === 'admissionai_secret')) {
  throw new Error('JWT_SECRET environment variable must be set to a secure, unique value in production.');
}

export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: JWT_SECRET || 'fallback_secret_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  FRONTEND_URL: process.env.FRONTEND_URL || '',
};

