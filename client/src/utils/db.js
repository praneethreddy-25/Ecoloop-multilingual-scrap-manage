import { openDB } from 'idb';

const DB_NAME = 'ecoloop';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('offlineCollections')) {
        db.createObjectStore('offlineCollections', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('cachedPrices')) {
        db.createObjectStore('cachedPrices', { keyPath: 'material' });
      }
      if (!db.objectStoreNames.contains('cachedRecyclers')) {
        db.createObjectStore('cachedRecyclers', { keyPath: 'id' });
      }
    },
  });
};

export const saveOfflineCollection = async (collection) => {
  const db = await initDB();
  return db.add('offlineCollections', { ...collection, timestamp: Date.now() });
};

export const getOfflineCollections = async () => {
  const db = await initDB();
  return db.getAll('offlineCollections');
};

export const deleteOfflineCollection = async (id) => {
  const db = await initDB();
  return db.delete('offlineCollections', id);
};

export const clearSynced = async () => {
  const db = await initDB();
  return db.clear('offlineCollections');
};
