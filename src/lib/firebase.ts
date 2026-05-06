/**
 * ReachOut Firebase Replacement
 * This file replaces the original firebase.ts and redirects to our MongoDB Bridge.
 */

import { db as mongoDb } from './db';

// Mock Auth Object
export const auth = {
  get currentUser() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return null;
    return {
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      tenantId: null,
      providerData: []
    };
  },
  signOut: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

export const db = mongoDb;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('Database Error: ', error);
  throw error;
}

const app = { name: 'MongoDB-Bridge' };
export default app;
