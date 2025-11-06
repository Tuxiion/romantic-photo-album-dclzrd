
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
  isPlaying?: boolean;
}

export default function PhotoCard({ photo, onPress, onDelete, onPlaySong, isPlaying }: PhotoCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
          <Pressable onPress={onPlaySong} style={styles.songButton}>
            <IconSymbol
              name={isPlaying ? 'pause.circle.fill' : 'play.circle.fill'}
              size={24}
              color={colors.primary}
            />
            <Text style={styles.songButtonText}>
              {isPlaying ? 'Pause' : 'Play'} {photo.songName || 'Song'}
            </Text>
          </Pressable>
        )}

        <View style={styles.frameTag}>
          <Text style={[styles.frameTagText, { color: frame.color }]}>
            {frame.name} Frame
          </Text>
        </View>
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
  songButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  songButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  frameTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.highlight,
  },
  frameTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
