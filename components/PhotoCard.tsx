
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native';
import { Photo } from '@/types/Photo';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';
import { frames } from '@/data/frames';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

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
  currentPosition,
}: PhotoCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const frameStyle = frames[photo.frame];

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onDelete?.();
  };

  const handleImagePress = () => {
    if (photo.uris.length > 1) {
      const nextIndex = (currentImageIndex + 1) % photo.uris.length;
      setCurrentImageIndex(nextIndex);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleProgressBarPress = (event: any) => {
    if (!songDuration || !onSeekSong) {
      console.log('Cannot seek: missing duration or callback');
      return;
    }

    const { locationX } = event.nativeEvent;
    const progressBarWidth = event.currentTarget.offsetWidth || 300;
    const percentage = locationX / progressBarWidth;
    const newPosition = percentage * songDuration;

    console.log(`Seeking to ${newPosition.toFixed(2)}s (${(percentage * 100).toFixed(1)}%)`);
    onSeekSong(newPosition);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
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

  const currentAdjustment = photo.imageAdjustments?.[currentImageIndex];

  return (
    <View style={styles.card}>
      <Pressable onPress={handleImagePress} style={styles.imageContainer}>
        <View
          style={[
            styles.frameContainer,
            {
              borderColor: frameStyle.color,
              borderWidth: 4,
              borderStyle: frameStyle.borderStyle,
            },
          ]}
        >
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: photo.uris[currentImageIndex] }}
              style={[
                styles.image,
                currentAdjustment && {
                  transform: [
                    { scale: currentAdjustment.scale },
                    { translateX: currentAdjustment.translateX },
                    { translateY: currentAdjustment.translateY },
                  ],
                },
              ]}
              resizeMode="cover"
            />
          </View>
          {frameStyle.emoji && (
            <View style={styles.frameEmoji}>
              <Text style={styles.frameEmojiText}>{frameStyle.emoji}</Text>
            </View>
          )}
        </View>

        {photo.uris.length > 1 && (
          <View style={styles.imageIndicator}>
            <IconSymbol name="photo.fill.on.rectangle.fill" size={16} color="#FFFFFF" />
            <Text style={styles.imageIndicatorText}>
              {currentImageIndex + 1} / {photo.uris.length}
            </Text>
          </View>
        )}
      </Pressable>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.eventName}>{photo.eventName}</Text>
            <Text style={styles.date}>{formatDate(photo.date)}</Text>
          </View>
          <Pressable onPress={handleDelete} style={styles.deleteButton}>
            <IconSymbol name="trash.fill" size={20} color={colors.primary} />
          </Pressable>
        </View>

        {photo.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{photo.description}</Text>
          </View>
        )}

        {photo.songUri && (
          <View style={styles.songContainer}>
            <View style={styles.songHeader}>
              <View style={styles.songInfo}>
                <IconSymbol name="music.note" size={20} color={colors.primary} />
                <Text style={styles.songName} numberOfLines={1}>
                  {photo.songName || 'Unknown Song'}
                </Text>
              </View>
              <Pressable onPress={onPlaySong} style={styles.playButton}>
                <IconSymbol
                  name={isPlaying ? 'pause.circle.fill' : 'play.circle.fill'}
                  size={32}
                  color={colors.primary}
                />
              </Pressable>
            </View>

            {isPlaying && songDuration && currentPosition !== undefined && (
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
                <Pressable
                  onPress={handleProgressBarPress}
                  style={styles.progressBarContainer}
                >
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(currentPosition / songDuration) * 100}%` },
                      ]}
                    />
                  </View>
                </Pressable>
                <Text style={styles.timeText}>{formatTime(songDuration)}</Text>
              </View>
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
    marginBottom: 20,
    boxShadow: '0px 4px 12px rgba(233, 30, 99, 0.15)',
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  frameContainer: {
    margin: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  frameEmoji: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
  frameEmojiText: {
    fontSize: 24,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
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
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  eventName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: 4,
  },
  descriptionContainer: {
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  songContainer: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 12,
  },
  songHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  songName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  playButton: {
    padding: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    minWidth: 40,
  },
  progressBarContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.card,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});
