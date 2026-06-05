import { Response } from 'express';

export function success<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({ success: true, data });
}

export function paginated<T>(res: Response, data: T[], total: number, page: number, limit: number): void {
  res.json({
    success: true,
    data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}

export function error(res: Response, message: string, statusCode = 400): void {
  res.status(statusCode).json({ success: false, message });
}
