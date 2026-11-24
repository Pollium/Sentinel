import { SecretCipher } from '@pollium/readable/auth/secrets';
import { config } from '@/shared/config';

export const secretCipher = new SecretCipher(config.encryptionKey);
