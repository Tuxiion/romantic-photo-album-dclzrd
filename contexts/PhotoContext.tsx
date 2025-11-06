
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Photo } from '@/types/Photo';
import { scheduleYearlyMemoryNotification, cancelNotification } from '@/utils/notifications';

interface PhotoContextType {
  photos: Photo[];
  addPhoto: (photo: Photo) => void;
  deletePhoto: (id: string) => void;
  notificationIds: Map<string, string>;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export function PhotoProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notificationIds, setNotificationIds] = useState<Map<string, string>>(new Map());

  const addPhoto = async (photo: Photo) => {
    console.log('Adding photo:', photo.eventName);
    setPhotos(prev => [photo, ...prev]);

    // Schedule yearly notification for this memory
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
  };

  const deletePhoto = async (id: string) => {
    console.log('Deleting photo:', id);
    setPhotos(prev => prev.filter(p => p.id !== id));

    // Cancel the notification for this photo
    const notificationId = notificationIds.get(id);
    if (notificationId) {
      await cancelNotification(notificationId);
      setNotificationIds(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
      console.log(`Notification cancelled for photo ${id}`);
    }
  };

  return (
    <PhotoContext.Provider value={{ photos, addPhoto, deletePhoto, notificationIds }}>
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
