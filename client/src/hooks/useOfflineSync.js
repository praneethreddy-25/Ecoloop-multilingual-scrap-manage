import { useEffect } from 'react';
import useStore from '../store/useStore';
import { saveOfflineCollection, getOfflineCollections, deleteOfflineCollection } from '../utils/db';
import toast from 'react-hot-toast';
import api from '../api/client';

export const useOfflineSync = () => {
  const { isOnline, setOnlineStatus, offlineQueue, syncOfflineQueue } = useStore();

  useEffect(() => {
    const handleOnline = async () => {
      setOnlineStatus(true);
      toast.success('Back online! Syncing data...');

      const collections = await getOfflineCollections();
      if (collections.length > 0) {
        let syncedCount = 0;
        let failedCount = 0;

        for (const collection of collections) {
          try {
            await api.post('/lots', collection);
            await deleteOfflineCollection(collection.id);
            syncedCount += 1;
          } catch (error) {
            failedCount += 1;
            console.error(`Failed to sync offline collection ${collection.id}:`, error);
          }
        }

        if (syncedCount > 0) {
          syncOfflineQueue();
        }

        if (failedCount === 0) {
          toast.success(`Successfully synced ${syncedCount} items.`);
        } else if (syncedCount > 0) {
          toast.success(`${syncedCount} items synced. ${failedCount} will be retried.`);
        } else {
          toast.error('Offline data could not be synced. It will be retried.');
        }
      }
    };

    const handleOffline = () => {
      setOnlineStatus(false);
      toast.error('You are offline. Data will be saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveLocally = async (data) => {
    await saveOfflineCollection(data);
    toast.success('Saved offline. Will sync when online.');
  };

  return { saveLocally, isOnline, offlineQueue };
};
