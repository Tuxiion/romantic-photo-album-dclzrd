
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import PhotoCard from '@/components/PhotoCard';
import { usePhotos } from '@/contexts/PhotoContext';
import * as Haptics from 'expo-haptics';
import { initializeAudio, playSound, pauseSound, stopSound, getSoundStatus } from '@/utils/audioPlayer';

export default function HomeScreen() {
  const { photos, deletePhoto } = usePhotos();
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [songDuration, setSongDuration] = useState<number>(0);
  const [currentPosition, setCurrentPosition] = useState<number>(0);

  useEffect(() => {
    initializeAudio();
  }, []);

  // Update playback position
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (playingSongId) {
      interval = setInterval(async () => {
        const status = await getSoundStatus();
        if (status && status.isLoaded) {
          setCurrentPosition(status.positionMillis / 1000);
          if (status.durationMillis) {
            setSongDuration(status.durationMillis / 1000);
          }
          
          // Auto-stop when finished
          if (status.didJustFinish) {
            setPlayingSongId(null);
            setCurrentPosition(0);
          }
        }
      }, 100);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [playingSongId]);

  const handleAddPhoto = () => {
    console.log('Navigating to upload screen');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(tabs)/upload');
  };

  const handleDeletePhoto = (id: string) => {
    console.log('Deleting photo:', id);
    // Stop playing if this photo's song is playing
    if (playingSongId === id) {
      stopSound();
      setPlayingSongId(null);
      setCurrentPosition(0);
      setSongDuration(0);
    }
    deletePhoto(id);
  };

  const handlePlaySong = async (id: string, songUri: string) => {
    console.log('Playing song for photo:', id);
    
    if (playingSongId === id) {
      // Pause current song
      await pauseSound();
      setPlayingSongId(null);
    } else {
      // Stop any currently playing song and play new one
      await stopSound();
      setCurrentPosition(0);
      await playSound(songUri);
      setPlayingSongId(id);
    }
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const renderHeaderRight = () => (
    <Pressable onPress={handleAddPhoto} style={styles.headerButtonContainer}>
      <IconSymbol name="plus" color={colors.primary} />
    </Pressable>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Romantic Memories',
            headerRight: renderHeaderRight,
          }}
        />
      )}
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <IconSymbol name="heart.fill" size={40} color={colors.primary} />
            <Text style={styles.title}>My Stories</Text>
            <Text style={styles.subtitle}>
              {photos.length} {photos.length === 1 ? 'Memory' : 'Memories'} Captured
            </Text>
          </View>

          {/* Empty State */}
          {photos.length === 0 && (
            <View style={styles.emptyState}>
              <IconSymbol name="photo.on.rectangle" size={80} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Memories Yet</Text>
              <Text style={styles.emptyText}>
                Start capturing your romantic moments by adding your first photo!
              </Text>
              <Pressable onPress={handleAddPhoto} style={styles.addButton}>
                <IconSymbol name="plus.circle.fill" size={24} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add First Memory</Text>
              </Pressable>
            </View>
          )}

          {/* Photo Grid */}
          {photos.length > 0 && (
            <View style={styles.photoGrid}>
              {photos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onDelete={() => handleDeletePhoto(photo.id)}
                  onPlaySong={photo.songUri ? () => handlePlaySong(photo.id, photo.songUri!) : undefined}
                  isPlaying={playingSongId === photo.id}
                  songDuration={playingSongId === photo.id ? songDuration : undefined}
                  currentPosition={playingSongId === photo.id ? currentPosition : undefined}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  scrollContentWithTabBar: {
    paddingBottom: 140,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0px 4px 12px rgba(233, 30, 99, 0.3)',
    elevation: 6,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  photoGrid: {
    gap: 20,
  },
  headerButtonContainer: {
    padding: 6,
  },
});
