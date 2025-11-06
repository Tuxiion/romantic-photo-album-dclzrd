
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';

interface ImageCropModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  onSave: (croppedUri: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CROP_SIZE = SCREEN_WIDTH - 80;

export default function ImageCropModal({
  visible,
  imageUri,
  onClose,
  onSave,
}: ImageCropModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCrop = async (cropType: 'square' | 'portrait' | 'landscape') => {
    console.log(`Cropping image with type: ${cropType}`);
    setIsProcessing(true);

    try {
      // Get image dimensions first
      const imageInfo = await ImageManipulator.manipulateAsync(imageUri, [], {
        format: ImageManipulator.SaveFormat.JPEG,
      });

      const { width, height } = imageInfo;
      let cropConfig: ImageManipulator.Action;

      switch (cropType) {
        case 'square':
          const size = Math.min(width, height);
          cropConfig = {
            crop: {
              originX: (width - size) / 2,
              originY: (height - size) / 2,
              width: size,
              height: size,
            },
          };
          break;
        case 'portrait':
          const portraitWidth = Math.min(width, height * 0.75);
          cropConfig = {
            crop: {
              originX: (width - portraitWidth) / 2,
              originY: 0,
              width: portraitWidth,
              height: height,
            },
          };
          break;
        case 'landscape':
          const landscapeHeight = Math.min(height, width * 0.75);
          cropConfig = {
            crop: {
              originX: 0,
              originY: (height - landscapeHeight) / 2,
              width: width,
              height: landscapeHeight,
            },
          };
          break;
      }

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [cropConfig],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log('Image cropped successfully:', result.uri);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onSave(result.uri);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
      Alert.alert('Error', 'Failed to crop image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotate = async () => {
    console.log('Rotating image');
    setIsProcessing(true);

    try {
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ rotate: 90 }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log('Image rotated successfully:', result.uri);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onSave(result.uri);
    } catch (error) {
      console.error('Error rotating image:', error);
      Alert.alert('Error', 'Failed to rotate image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Photo</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
          </View>

          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Crop Options</Text>
            <View style={styles.cropButtons}>
              <Pressable
                onPress={() => handleCrop('square')}
                style={styles.cropButton}
                disabled={isProcessing}
              >
                <IconSymbol name="square.fill" size={24} color={colors.primary} />
                <Text style={styles.cropButtonText}>Square</Text>
              </Pressable>

              <Pressable
                onPress={() => handleCrop('portrait')}
                style={styles.cropButton}
                disabled={isProcessing}
              >
                <IconSymbol name="rectangle.portrait.fill" size={24} color={colors.primary} />
                <Text style={styles.cropButtonText}>Portrait</Text>
              </Pressable>

              <Pressable
                onPress={() => handleCrop('landscape')}
                style={styles.cropButton}
                disabled={isProcessing}
              >
                <IconSymbol name="rectangle.fill" size={24} color={colors.primary} />
                <Text style={styles.cropButtonText}>Landscape</Text>
              </Pressable>
            </View>

            <Text style={styles.sectionTitle}>Transform</Text>
            <View style={styles.transformButtons}>
              <Pressable
                onPress={handleRotate}
                style={styles.transformButton}
                disabled={isProcessing}
              >
                <IconSymbol name="rotate.right.fill" size={24} color={colors.secondary} />
                <Text style={styles.transformButtonText}>Rotate 90°</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  onSave(imageUri);
                  onClose();
                }}
                style={styles.transformButton}
                disabled={isProcessing}
              >
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.accent} />
                <Text style={styles.transformButtonText}>Keep Original</Text>
              </Pressable>
            </View>
          </View>

          {isProcessing && (
            <View style={styles.processingOverlay}>
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    width: SCREEN_WIDTH - 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  imagePreview: {
    width: '100%',
    height: CROP_SIZE,
    backgroundColor: colors.highlight,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  actionsContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  cropButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cropButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  cropButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  transformButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  transformButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  transformButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
