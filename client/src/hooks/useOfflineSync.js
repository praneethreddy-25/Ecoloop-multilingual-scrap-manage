import { useEffect } from 'react';
import useStore from '../store/useStore';
import { saveOfflineCollection, getOfflineCollections, clearSynced } from '../utils/db';
import toast from 'react-hot-toast';

export const useOfflineSync = () => {
  const { isOnline, setOnlineStatus, offlineQueue, syncOfflineQueue } = useStore();

  useEffect(() => {
    const handleOnline = async () => {
      setOnlineStatus(true);
      toast.success('Back online! Syncing data...');
      
      const collections = await getOfflineCollections();
      if (collections.length > 0) {
        // Mock sync to server
        console.log('Syncing collections:', collections);
        await clearSynced();
        syncOfflineQueue();
        toast.success(`Successfully synced ${collections.length} items.`);
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
