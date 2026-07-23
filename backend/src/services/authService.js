import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { createAccessToken, createRefreshToken, hashToken, refreshTokenExpiresAt } from '../utils/tokenUtils.js';

const publicUser = ({ id, email, firstName, lastName, avatar, role }) => ({ id, email, firstName, lastName, avatar, role });

const issueTokens = async (user) => {
  const refreshToken = createRefreshToken();
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: hashToken(refreshToken), expiresAt: refreshTokenExpiresAt() },
  });
  return { accessToken: createAccessToken(user), refreshToken };
};

export const register = async ({ email, firstName, lastName, password }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError('An account already exists for this email.', 409, 'EMAIL_ALREADY_EXISTS');

  const user = await prisma.user.create({
    data: { email, firstName, lastName, passwordHash: await bcrypt.hash(password, 12) },
  });
  return { user: publicUser(user), ...(await issueTokens(user)) };
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Email or password is incorrect.', 401, 'INVALID_CREDENTIALS');
  }
  if (user.status !== 'ACTIVE') throw new AppError('This account is not active.', 403, 'ACCOUNT_INACTIVE');
  return { user: publicUser(user), ...(await issueTokens(user)) };
};

export const refresh = async (rawToken) => {
  const tokenHash = hashToken(rawToken);
  const existing = await prisma.refreshToken.findFirst({
    where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    include: { user: true },
  });
  if (!existing || existing.user.status !== 'ACTIVE') throw new AppError('Refresh token is invalid or expired.', 401, 'UNAUTHORIZED');
  await prisma.refreshToken.update({ where: { id: existing.id }, data: { revokedAt: new Date() } });
  return { user: publicUser(existing.user), ...(await issueTokens(existing.user)) };
};

export const logout = async (rawToken) => {
  if (rawToken) await prisma.refreshToken.updateMany({ where: { tokenHash: hashToken(rawToken), revokedAt: null }, data: { revokedAt: new Date() } });
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  return publicUser(user);
};
