import { PublicGatewayApiKey } from '@sentinel/contracts/keys/domain';

const QUIET_DAYS = 30;
const MS_PER_DAY = 86_400_000;

export const isQuiet = (key: PublicGatewayApiKey, now: number): boolean =>
    key.lastUsedAt === null || now - Date.parse(key.lastUsedAt) > QUIET_DAYS * MS_PER_DAY;
