export type TokenStatus = 'active' | 'expired' | 'revoked';

export interface LightwellToken {
  id: string;
  name: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsed: string | null;
  owner: string;
  status: TokenStatus;
}

export type ExpirationOption = '30d' | '60d' | '90d' | '1y' | 'never';

export const expirationOptions: { value: ExpirationOption; label: string }[] = [
  { value: '30d', label: '30 days' },
  { value: '60d', label: '60 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: '1 year' },
  { value: 'never', label: 'No expiration' },
];
