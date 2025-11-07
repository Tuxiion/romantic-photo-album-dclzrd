import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Platform,
} from "react-native";
import { Photo } from "@/types/Photo";
import { IconSymbol } from "./IconSymbol";
import { colors } from "@/styles/commonStyles";
import { frames } from "@/data/frames";
import * as Haptics from "expo-haptics";
import {
  playSound,
  pauseSound,
  resumeSound,
  stopSound,
  getSoundStatus,
  seekToPosition,
} from "@/utils/audioPlayer";

interface PhotoCardProps {
  photo: Photo;
  onPress?: () => void;
  onDelete?: () => void;
}

export default function PhotoCard({ photo, onPress, onDelete }: PhotoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [songDuration, setSongDuration] = useState<number | null>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const frameStyle = frames[photo.frame];

  const handleDelete = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onDelete?.();
  };

  const handleImagePress = () => {
    if (photo.uris.length > 1) {
      const nextIndex = (currentImageIndex + 1) % photo.uris.length;
      setCurrentImageIndex(nextIndex);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handlePlayPress = async () => {
    if (!photo.songUri) {
      console.log("No song URI found");
      return;
    }

    try {
      if (isPlaying) {
        await pauseSound();
        setIsPlaying(false);
        if (progressInterval.current) clearInterval(progressInterval.current);
      } else {
        await playSound(photo.songUri);
        setIsPlaying(true);
        startProgressUpdates();
      }
    } catch (error) {
      console.error("Error toggling sound:", error);
    }
  };

  const startProgressUpdates = () => {
    progressInterval.current = setInterval(async () => {
      const status = await getSoundStatus();
      if (status?.isLoaded) {
        setSongDuration(status.durationMillis / 1000);
        setCurrentPosition(status.positionMillis / 1000);
        if (status.didJustFinish) {
          clearInterval(progressInterval.current!);
          setIsPlaying(false);
          setCurrentPosition(0);
        }
      }
    }, 500);
  };

  const handleProgressBarPress = async (event: any) => {
    if (!songDuration) return;
    const { locationX } = event.nativeEvent;
    const progressBarWidth = event.currentTarget.offsetWidth || 300;
    const percentage = Math.min(Math.max(locationX / progressBarWidth, 0), 1);
    const newPosition = percentage * songDuration;
    await seekToPosition(newPosition);
    setCurrentPosition(newPosition);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      stopSound();
    };
  }, []);

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
          <Image
            source={{ uri: photo.uris[currentImageIndex] }}
            style={styles.image}
            resizeMode="cover"
          />
          {frameStyle.emoji && (
            <View style={styles.frameEmoji}>
              <Text style={styles.frameEmojiText}>{frameStyle.emoji}</Text>
            </View>
          )}
        </View>
      </Pressable>

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
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
                  {photo.songName || "Unknown Song"}
                </Text>
              </View>
              <Pressable onPress={handlePlayPress} style={styles.playButton}>
                <IconSymbol
                  name={isPlaying ? "pause.circle.fill" : "play.circle.fill"}
                  size={32}
                  color={colors.primary}
                />
              </Pressable>
            </View>

            {songDuration && (
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>
                  {formatTime(currentPosition)}
                </Text>
                <Pressable
                  onPress={handleProgressBarPress}
                  style={styles.progressBarContainer}
                >
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(currentPosition / songDuration) * 100}%`,
                        },
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
    overflow: "hidden",
    marginBottom: 20,
    elevation: 4,
  },
  imageContainer: { position: "relative" },
  frameContainer: {
    margin: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 3,
  },
  frameEmoji: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 8,
  },
  frameEmojiText: { fontSize: 24 },
  content: { padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eventName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  date: { fontSize: 14, color: colors.textSecondary },
  deleteButton: { padding: 4 },
  descriptionContainer: {
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  description: { fontSize: 14, color: colors.text },
  songContainer: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  songHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  songInfo: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  songName: { fontSize: 14, fontWeight: "600", color: colors.text },
  playButton: { padding: 4 },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
    minWidth: 40,
  },
  progressBarContainer: { flex: 1, paddingVertical: 8 },
  progressBar: {
    height: 4,
    backgroundColor: colors.card,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});
