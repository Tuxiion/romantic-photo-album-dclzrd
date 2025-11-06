
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Photo } from '@/types/Photo';
import { scheduleYearlyMemoryNotification, cancelNotification } from '@/utils/notifications';

interface PhotoContextType {
  photos: Photo[];
  addPhoto: (photo: Photo) => void;
  deletePhoto: (id: string) => void;
  updatePhoto: (id: string, updates: Partial<Photo>) => void;
  notificationIds: Map<string, string>;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

const STORAGE_KEY = '@romantic_memories_photos';
const NOTIFICATION_IDS_KEY = '@romantic_memories_notification_ids';

export function PhotoProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notificationIds, setNotificationIds] = useState<Map<string, string>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load photos from AsyncStorage on mount
  useEffect(() => {
    loadPhotos();
  }, []);

  // Save photos to AsyncStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      savePhotos();
    }
  }, [photos, isLoaded]);

  // Save notification IDs whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveNotificationIds();
    }
  }, [notificationIds, isLoaded]);

  const loadPhotos = async () => {
    try {
      console.log('Loading photos from AsyncStorage...');
      const photosJson = await AsyncStorage.getItem(STORAGE_KEY);
      const notificationIdsJson = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
      
      if (photosJson) {
        const loadedPhotos = JSON.parse(photosJson);
        // Convert date strings back to Date objects
        const parsedPhotos = loadedPhotos.map((photo: any) => ({
          ...photo,
          date: new Date(photo.date),
          createdAt: new Date(photo.createdAt),
        }));
        setPhotos(parsedPhotos);
        console.log(`Loaded ${parsedPhotos.length} photos from storage`);
      } else {
        console.log('No photos found in storage');
      }

      if (notificationIdsJson) {
        const loadedNotificationIds = JSON.parse(notificationIdsJson);
        setNotificationIds(new Map(Object.entries(loadedNotificationIds)));
        console.log(`Loaded ${Object.keys(loadedNotificationIds).length} notification IDs`);
      }

      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading photos from AsyncStorage:', error);
      setIsLoaded(true);
    }
  };

  const savePhotos = async () => {
    try {
      console.log(`Saving ${photos.length} photos to AsyncStorage...`);
      const photosJson = JSON.stringify(photos);
      await AsyncStorage.setItem(STORAGE_KEY, photosJson);
      console.log('Photos saved successfully');
    } catch (error) {
      console.error('Error saving photos to AsyncStorage:', error);
    }
  };

  const saveNotificationIds = async () => {
    try {
      const notificationIdsObj = Object.fromEntries(notificationIds);
      const notificationIdsJson = JSON.stringify(notificationIdsObj);
      await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, notificationIdsJson);
      console.log('Notification IDs saved successfully');
    } catch (error) {
      console.error('Error saving notification IDs to AsyncStorage:', error);
    }
  };

  const addPhoto = async (photo: Photo) => {
    console.log('Adding photo:', photo.eventName);
    setPhotos(prev => [photo, ...prev]);

    // Schedule yearly notification for this memory
    try {
      const notificationId = await scheduleYearlyMemoryNotification(
        photo.id,
        photo.eventName,
        photo.date
      );

      if (notificationId) {
        setNotificationIds(prev => {
          const newMap = new Map(prev);
          newMap.set(photo.id, notificationId);
          return newMap;
        });
        console.log(`Notification scheduled for ${photo.eventName}`);
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const deletePhoto = async (id: string) => {
    console.log('Deleting photo:', id);
    setPhotos(prev => prev.filter(p => p.id !== id));

    // Cancel the notification for this photo
    const notificationId = notificationIds.get(id);
    if (notificationId) {
      try {
        await cancelNotification(notificationId);
        setNotificationIds(prev => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });
        console.log(`Notification cancelled for photo ${id}`);
      } catch (error) {
        console.error('Error cancelling notification:', error);
      }
    }
  };

  const updatePhoto = (id: string, updates: Partial<Photo>) => {
    console.log('Updating photo:', id);
    setPhotos(prev =>
      prev.map(photo => (photo.id === id ? { ...photo, ...updates } : photo))
    );
  };

  return (
    <PhotoContext.Provider value={{ photos, addPhoto, deletePhoto, updatePhoto, notificationIds }}>
      {children}
    </PhotoContext.Provider>
  );
}

export function usePhotos() {
  const context = useContext(PhotoContext);
  if (context === undefined) {
    throw new Error('usePhotos must be used within a PhotoProvider');
  }
  return context;
}
