
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Platform, ScrollView } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { Photo } from '@/types/Photo';
import { frames } from '@/data/frames';
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

interface PhotoCardProps {
  photo: Photo;
  onPress?: () => void;
  onDelete?: () => void;
  onPlaySong?: () => void;
  onSeekSong?: (position: number) => void;
  isPlaying?: boolean;
  songDuration?: number;
  currentPosition?: number;
}

export default function PhotoCard({ 
  photo, 
  onPress, 
  onDelete, 
  onPlaySong, 
  onSeekSong,
  isPlaying,
  songDuration,
  currentPosition 
}: PhotoCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  const frame = frames[photo.frame];

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (onDelete) {
      onDelete();
    }
  };

  const handleImagePress = () => {
    if (photo.uris.length > 1) {
      const nextIndex = (currentImageIndex + 1) % photo.uris.length;
      setCurrentImageIndex(nextIndex);
      console.log(`Showing image ${nextIndex + 1} of ${photo.uris.length}`);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    if (onPress) {
      onPress();
    }
  };

  const handleProgressBarPress = (event: any) => {
    if (!songDuration || !onSeekSong || !progressBarWidth) {
      console.log('Cannot seek: missing duration, seek handler, or bar width');
      return;
    }

    const { locationX } = event.nativeEvent;
    
    // Calculate the position based on where user tapped
    const percentage = Math.max(0, Math.min(1, locationX / progressBarWidth));
    const newPosition = percentage * songDuration;
    
    console.log(`Seeking to ${newPosition.toFixed(2)}s (${(percentage * 100).toFixed(1)}%)`);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onSeekSong(newPosition);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.card}>
      {/* Image Container */}
      <Pressable onPress={handleImagePress} style={styles.imageContainer}>
        <Image
          source={{ uri: photo.uris[currentImageIndex] }}
          style={[
            styles.image,
            {
              borderColor: frame.color,
              borderWidth: 4,
              borderStyle: frame.borderStyle,
            },
          ]}
          resizeMode="cover"
        />
        {photo.uris.length > 1 && (
          <View style={styles.imageIndicator}>
            <IconSymbol name="photo.stack.fill" size={16} color="#FFFFFF" />
            <Text style={styles.imageIndicatorText}>
              {currentImageIndex + 1}/{photo.uris.length}
            </Text>
          </View>
        )}
        {photo.uris.length > 1 && (
          <View style={styles.swipeHint}>
            <Text style={styles.swipeHintText}>Tap to see more</Text>
          </View>
        )}
      </Pressable>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <IconSymbol name={frame.icon} size={20} color={frame.color} />
            <Text style={styles.eventName}>{photo.eventName}</Text>
          </View>
          {onDelete && (
            <Pressable onPress={handleDelete} style={styles.deleteButton}>
              <IconSymbol name="trash.fill" size={20} color={colors.primary} />
            </Pressable>
          )}
        </View>

        <View style={styles.dateContainer}>
          <IconSymbol name="calendar" size={16} color={colors.textSecondary} />
          <Text style={styles.date}>{formatDate(photo.date)}</Text>
        </View>

        {photo.description && (
          <View style={styles.descriptionContainer}>
            <Text
              style={styles.description}
              numberOfLines={showFullDescription ? undefined : 3}
            >
              {photo.description}
            </Text>
            {photo.description.length > 100 && (
              <Pressable
                onPress={() => {
                  setShowFullDescription(!showFullDescription);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <Text style={styles.readMoreText}>
                  {showFullDescription ? 'Show less' : 'Read more'}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {photo.songUri && onPlaySong && (
          <View style={styles.songContainer}>
            <Pressable onPress={onPlaySong} style={styles.songButton}>
              <View style={styles.playButtonCircle}>
                <IconSymbol
                  name={isPlaying ? 'pause.fill' : 'play.fill'}
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.songInfo}>
                <Text style={styles.songName} numberOfLines={1}>
                  {photo.songName || 'Song'}
                </Text>
                {songDuration && (
                  <Text style={styles.songDuration}>
                    {currentPosition ? formatTime(currentPosition) : '0:00'} / {formatTime(songDuration)}
                  </Text>
                )}
              </View>
            </Pressable>
            {isPlaying && songDuration && currentPosition !== undefined && onSeekSong && (
              <Pressable 
                onPress={handleProgressBarPress}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  setProgressBarWidth(width);
                }}
                style={styles.progressBarContainer}
              >
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${(currentPosition / songDuration) * 100}%` }
                  ]} 
                />
                <View 
                  style={[
                    styles.progressThumb,
                    { left: `${(currentPosition / songDuration) * 100}%` }
                  ]}
                />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  imageIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  swipeHint: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  eventName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.highlight,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 4,
  },
  readMoreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  songContainer: {
    marginTop: 4,
  },
  songButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  playButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(233, 30, 99, 0.3)',
    elevation: 3,
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  songDuration: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 32,
    backgroundColor: colors.highlight,
    borderRadius: 16,
    marginTop: 8,
    overflow: 'visible',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 14,
  },
  progressThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    marginLeft: -10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
});
