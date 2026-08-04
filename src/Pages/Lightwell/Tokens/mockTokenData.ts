import type { LightwellToken, ExpirationOption } from './types';

const CURRENT_USER = 'nwong';

const initialTokens: LightwellToken[] = [
  {
    id: 'tok-001',
    name: 'CI/CD Pipeline',
    createdAt: '2026-06-15T10:30:00Z',
    expiresAt: '2026-09-15T10:30:00Z',
    lastUsed: '2026-07-28T14:22:00Z',
    owner: CURRENT_USER,
    status: 'active',
  },
  {
    id: 'tok-002',
    name: 'Local development',
    createdAt: '2026-05-01T08:00:00Z',
    expiresAt: '2026-08-01T08:00:00Z',
    lastUsed: '2026-07-25T09:15:00Z',
    owner: CURRENT_USER,
    status: 'active',
  },
  {
    id: 'tok-003',
    name: 'Staging environment',
    createdAt: '2026-03-10T12:00:00Z',
    expiresAt: '2026-06-10T12:00:00Z',
    lastUsed: '2026-06-08T16:45:00Z',
    owner: CURRENT_USER,
    status: 'expired',
  },
  {
    id: 'tok-004',
    name: 'Build server',
    createdAt: '2026-07-01T09:00:00Z',
    expiresAt: '2027-07-01T09:00:00Z',
    lastUsed: '2026-07-29T11:30:00Z',
    owner: 'arburka',
    status: 'active',
  },
  {
    id: 'tok-005',
    name: 'QE automation',
    createdAt: '2026-06-20T14:00:00Z',
    expiresAt: '2026-12-20T14:00:00Z',
    lastUsed: '2026-07-27T08:00:00Z',
    owner: 'arburka',
    status: 'active',
  },
  {
    id: 'tok-006',
    name: 'Demo access',
    createdAt: '2026-04-15T10:00:00Z',
    expiresAt: null,
    lastUsed: null,
    owner: 'jlsherrill',
    status: 'active',
  },
  {
    id: 'tok-007',
    name: 'Old integration key',
    createdAt: '2025-11-01T08:00:00Z',
    expiresAt: '2026-02-01T08:00:00Z',
    lastUsed: '2026-01-15T10:00:00Z',
    owner: 'jlsherrill',
    status: 'revoked',
  },
];

let tokens = [...initialTokens];
let nextId = 8;

export function getCurrentUser(): string {
  return CURRENT_USER;
}

export function getMyTokens(): LightwellToken[] {
  return tokens.filter((t) => t.owner === CURRENT_USER);
}

export function getAllTokens(): LightwellToken[] {
  return [...tokens];
}

export function createToken(name: string, expiration: ExpirationOption): { token: LightwellToken; secret: string } {
  const now = new Date();
  let expiresAt: string | null = null;

  if (expiration !== 'never') {
    const expDate = new Date(now);
    const daysMap: Record<string, number> = { '30d': 30, '60d': 60, '90d': 90, '1y': 365 };
    expDate.setDate(expDate.getDate() + daysMap[expiration]);
    expiresAt = expDate.toISOString();
  }

  const id = `tok-${String(nextId++).padStart(3, '0')}`;
  const newToken: LightwellToken = {
    id,
    name,
    createdAt: now.toISOString(),
    expiresAt,
    lastUsed: null,
    owner: CURRENT_USER,
    status: 'active',
  };

  const secret = `lw_${Array.from({ length: 40 }, () =>
    'abcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 36)),
  ).join('')}`;

  tokens = [newToken, ...tokens];
  return { token: newToken, secret };
}

export function revokeToken(tokenId: string): void {
  tokens = tokens.map((t) => (t.id === tokenId ? { ...t, status: 'revoked' as const } : t));
}
