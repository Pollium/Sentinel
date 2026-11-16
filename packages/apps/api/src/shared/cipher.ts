import SecretCipher from '@readable/services/SecretCipher';
import { config } from '@/shared/config';

export const secretCipher = new SecretCipher(config.encryptionKey);
