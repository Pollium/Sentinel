import { advisoryLock } from '@readable/utils/models/advisory-lock';
import { EntityManager } from 'typeorm';

const ROSTER_LOCK_NAMESPACE = 4101;
const ROSTER_LOCK_KEY = 'operators';

export const lockRoster = (manager: EntityManager) => advisoryLock(manager, ROSTER_LOCK_NAMESPACE, ROSTER_LOCK_KEY);
