
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { FrameType } from '@/types/Photo';
import { frames } from '@/data/frames';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface FrameSelectorProps {
  selectedFrame: FrameType;
  onSelectFrame: (frame: FrameType) => void;
}

export default function FrameSelector({ selectedFrame, onSelectFrame }: FrameSelectorProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {(Object.keys(frames) as FrameType[]).map((frameKey) => {
          const frame = frames[frameKey];
          const isSelected = selectedFrame === frameKey;
          
          return (
            <Pressable
              key={frameKey}
              onPress={() => onSelectFrame(frameKey)}
              style={[
                styles.frameOption,
                isSelected && styles.frameOptionSelected,
                { borderColor: frame.color }
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: frame.color }]}>
                {frame.emoji ? (
                  <View style={styles.emojiIconContainer}>
                    <IconSymbol name={frame.icon} size={20} color="#FFFFFF" style={styles.backgroundIcon} />
                    <Text style={styles.emoji}>{frame.emoji}</Text>
                  </View>
                ) : (
                  <IconSymbol name={frame.icon} size={24} color="#FFFFFF" />
                )}
              </View>
              <Text style={[styles.frameName, isSelected && styles.frameNameSelected]}>
                {frame.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 20,
  },
  frameOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: colors.card,
    minWidth: 90,
  },
  frameOptionSelected: {
    backgroundColor: colors.highlight,
    boxShadow: '0px 4px 8px rgba(233, 30, 99, 0.3)',
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  emojiIconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundIcon: {
    position: 'absolute',
    opacity: 0.3,
  },
  emoji: {
    fontSize: 24,
    zIndex: 1,
  },
  frameName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  frameNameSelected: {
    color: colors.text,
  },
});
