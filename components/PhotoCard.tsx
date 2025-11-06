
import { View, Text, StyleSheet, Image, Pressable, Platform, ScrollView } from 'react-native';
import React, { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import { Photo } from '@/types/Photo';
import { frames } from '@/data/frames';
import { IconSymbol } from './IconSymbol';

interface PhotoCardProps {
  photo: Photo;
  onPress?: () => void;
  onDelete?: () => void;
}

export default function PhotoCard({ photo, onPress, onDelete }: PhotoCardProps) {
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
      // Cycle through images
      setCurrentImageIndex((prev) => (prev + 1) % photo.uris.length);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    onPress?.();
  };

  const formatDate = (date: Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleImagePress} style={styles.imageContainer}>
        <Image
          source={{ uri: photo.uris[currentImageIndex] }}
          style={styles.image}
          resizeMode="cover"
        />
        <View
          style={[
            styles.frame,
            {
              borderColor: frameStyle.color,
              borderStyle: frameStyle.borderStyle,
            },
          ]}
        />
        
        {/* Image counter for multiple images */}
        {photo.uris.length > 1 && (
          <View style={styles.imageCounterBadge}>
            <IconSymbol name="photo.fill.on.rectangle.fill" size={14} color="#FFFFFF" />
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1}/{photo.uris.length}
            </Text>
          </View>
        )}

        {/* Tap indicator for multiple images */}
        {photo.uris.length > 1 && (
          <View style={styles.tapIndicator}>
            <IconSymbol name="hand.tap.fill" size={16} color="#FFFFFF" />
            <Text style={styles.tapIndicatorText}>Tap to see more</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <IconSymbol name={frameStyle.icon} size={20} color={frameStyle.color} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.eventName} numberOfLines={1}>
              {photo.eventName}
            </Text>
            <Text style={styles.date}>{formatDate(photo.date)}</Text>
          </View>
          {onDelete && (
            <Pressable onPress={handleDelete} style={styles.deleteButton}>
              <IconSymbol name="trash.fill" size={20} color={colors.error || '#FF3B30'} />
            </Pressable>
          )}
        </View>

        {/* Image dots indicator */}
        {photo.uris.length > 1 && (
          <View style={styles.dotsContainer}>
            {photo.uris.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentImageIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  frame: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderWidth: 4,
    borderRadius: 8,
    pointerEvents: 'none',
  },
  imageCounterBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tapIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tapIndicatorText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
    opacity: 0.3,
  },
  dotActive: {
    backgroundColor: colors.primary,
    opacity: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
