import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { signToken } from '../utils/jwt';
import { success, error } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  if (!email || !password) {
    error(res, 'Email and password are required');
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    error(res, 'Invalid credentials', 401);
    return;
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  const token = signToken({ userId: user.id, role: user.role });
  success(res, {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    error(res, 'Name, email and password are required');
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    error(res, 'Email already in use');
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed, name, role: role || 'ADMISSION_OFFICER' },
  });

  const token = signToken({ userId: user.id, role: user.role });
  success(res, {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  }, 201);
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, role: true, status: true, lastLogin: true },
  });
  if (!user) {
    error(res, 'User not found', 404);
    return;
  }
  success(res, user);
}
