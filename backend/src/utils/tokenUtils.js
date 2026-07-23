import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const createAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiry,
  });

export const createRefreshToken = () => crypto.randomBytes(64).toString('hex');

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const durationToMilliseconds = (duration) => {
  const match = /^(\d+)\s*([smhd])$/.exec(duration);
  if (!match) throw new Error('REFRESH_TOKEN_EXPIRY must use s, m, h, or d (for example: 30d).');
  const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return Number(match[1]) * units[match[2]];
};

export const refreshTokenExpiresAt = () => new Date(Date.now() + durationToMilliseconds(env.refreshTokenExpiry));

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtSecret);
