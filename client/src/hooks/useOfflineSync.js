import { useEffect } from 'react';
import useStore from '../store/useStore';
import { saveOfflineCollection, getOfflineCollections, clearSynced } from '../utils/db';
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
        try {
          let syncedCount = 0;

          for (const collection of collections) {
            await api.post('/lots', collection);
            syncedCount += 1;
          }

          await clearSynced();
          syncOfflineQueue();

          toast.success(`Successfully synced ${syncedCount} items.`);
        } catch (error) {
          console.error('Offline sync failed:', error);
          toast.error('Some offline data could not be synced. It will be retried.');
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
