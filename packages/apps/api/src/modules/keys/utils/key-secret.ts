import { createHash, randomBytes } from 'node:crypto';

const PREFIX = 'snt_';
const SECRET_BYTES = 24;
const PREVIEW_LENGTH = 12;

export const newSecret = (): string => `${PREFIX}${randomBytes(SECRET_BYTES).toString('base64url')}`;

export const hashOf = (secret: string): string => createHash('sha256').update(secret).digest('hex');

export const previewOf = (secret: string): string => `${secret.slice(0, PREVIEW_LENGTH)}…`;
