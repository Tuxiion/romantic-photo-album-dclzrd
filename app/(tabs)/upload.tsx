
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import FrameSelector from '@/components/FrameSelector';
import ImageCropModal from '@/components/ImageCropModal';
import { FrameType } from '@/types/Photo';
import { usePhotos } from '@/contexts/PhotoContext';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function UploadScreen() {
  const { addPhoto } = usePhotos();
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<FrameType>('hearts');
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [currentCropIndex, setCurrentCropIndex] = useState<number | null>(null);
  const [songUri, setSongUri] = useState<string | null>(null);
  const [songName, setSongName] = useState<string | null>(null);
  const [isEditingSongName, setIsEditingSongName] = useState(false);

  const pickImages = async () => {
    console.log('Requesting image picker permissions...');
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newUris = result.assets.map(asset => asset.uri);
      console.log(`Selected ${newUris.length} images`);
      setImageUris(prev => [...prev, ...newUris]);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const pickSong = async () => {
    try {
      console.log('Opening document picker for audio...');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSongUri(asset.uri);
        setSongName(asset.name);
        console.log('Song selected:', asset.name);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error('Error picking song:', error);
      Alert.alert('Error', 'Failed to pick song. Please try again.');
    }
  };

  const removeSong = () => {
    console.log('Removing song');
    setSongUri(null);
    setSongName(null);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const removeImage = (index: number) => {
    console.log(`Removing image at index ${index}`);
    setImageUris(prev => prev.filter((_, i) => i !== index));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const openCropModal = (index: number) => {
    console.log(`Opening crop modal for image at index ${index}`);
    setCurrentCropIndex(index);
    setCropModalVisible(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleCroppedImage = (croppedUri: string) => {
    if (currentCropIndex !== null) {
      console.log(`Updating image at index ${currentCropIndex} with cropped version`);
      setImageUris(prev => {
        const newUris = [...prev];
        newUris[currentCropIndex] = croppedUri;
        return newUris;
      });
    }
    setCurrentCropIndex(null);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      console.log('Date selected:', date.toLocaleDateString());
    }
  };

  const handleSave = () => {
    if (imageUris.length === 0) {
      Alert.alert('No Images', 'Please select at least one image!');
      return;
    }

    if (!eventName.trim()) {
      Alert.alert('No Event Name', 'Please enter an event name!');
      return;
    }

    const newPhoto = {
      id: Date.now().toString(),
      uris: imageUris,
      eventName: eventName.trim(),
      description: description.trim() || undefined,
      date: selectedDate,
      frame: selectedFrame,
      createdAt: new Date(),
      songUri: songUri || undefined,
      songName: songName || undefined,
    };

    console.log(`Saving photo with ${imageUris.length} images:`, newPhoto.eventName);
    addPhoto(newPhoto);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Reset form
    setImageUris([]);
    setEventName('');
    setDescription('');
    setSelectedDate(new Date());
    setSelectedFrame('hearts');
    setSongUri(null);
    setSongName(null);

    Alert.alert(
      'Success!',
      `Your romantic memory with ${imageUris.length} ${imageUris.length === 1 ? 'photo' : 'photos'} has been saved! 💕\n\nYou'll receive a reminder every year on ${selectedDate.toLocaleDateString()}!`,
      [
        {
          text: 'View Album',
          onPress: () => router.push('/(tabs)/(home)/'),
        },
        {
          text: 'Add Another',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
          <Text style={styles.iconEmoji}>💌</Text>
          <Text style={styles.title}>Add a Memory</Text>
          <Text style={styles.subtitle}>
            Select multiple photos to create your memory album
          </Text>
        </View>

        {/* Image Picker */}
        <Pressable onPress={pickImages} style={styles.imagePickerContainer}>
          {imageUris.length > 0 ? (
            <View style={styles.imageGrid}>
              <FlatList
                data={imageUris}
                horizontal
                showsHorizontalScrollIndicator={true}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item, index }) => (
                  <View style={styles.imageWrapper}>
                    <Image source={{ uri: item }} style={styles.thumbnailImage} resizeMode="cover" />
                    <Pressable
                      onPress={() => removeImage(index)}
                      style={styles.removeButton}
                    >
                      <IconSymbol name="trash.fill" size={20} color="#FFFFFF" />
                    </Pressable>
                    <Pressable
                      onPress={() => openCropModal(index)}
                      style={styles.editButton}
                    >
                      <IconSymbol name="crop" size={20} color="#FFFFFF" />
                    </Pressable>
                    <View style={styles.imageCounter}>
                      <Text style={styles.imageCounterText}>{index + 1}</Text>
                    </View>
                  </View>
                )}
                contentContainerStyle={styles.imageListContent}
              />
              <View style={styles.addMoreContainer}>
                <IconSymbol name="plus.circle.fill" size={32} color={colors.primary} />
                <Text style={styles.addMoreText}>Tap to add more photos</Text>
              </View>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <IconSymbol name="photo.fill.on.rectangle.fill" size={48} color={colors.textSecondary} />
              <Text style={styles.placeholderText}>Tap to select photos</Text>
              <Text style={styles.placeholderSubtext}>You can select multiple images</Text>
            </View>
          )}
        </Pressable>

        {imageUris.length > 0 && (
          <View style={styles.imageCountBadge}>
            <IconSymbol name="photo.fill" size={16} color="#FFFFFF" />
            <Text style={styles.imageCountBadgeText}>
              {imageUris.length} {imageUris.length === 1 ? 'photo' : 'photos'} selected
            </Text>
          </View>
        )}

        {/* Event Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Event Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Our First Date, Anniversary..."
            placeholderTextColor={colors.textSecondary}
            value={eventName}
            onChangeText={setEventName}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add a description to your memory..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Date Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date</Text>
          <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
            <IconSymbol name="calendar" size={20} color={colors.primary} />
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </Pressable>
          <Text style={styles.reminderText}>
            📅 You&apos;ll receive a yearly reminder on this date!
          </Text>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Song Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Song (Optional)</Text>
          {songUri ? (
            <View style={styles.songContainer}>
              <View style={styles.songInfo}>
                <IconSymbol name="music.note" size={24} color={colors.primary} />
                {isEditingSongName ? (
                  <TextInput
                    style={styles.songNameInput}
                    value={songName || ''}
                    onChangeText={setSongName}
                    onBlur={() => setIsEditingSongName(false)}
                    autoFocus
                    placeholder="Song name"
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <Pressable 
                    onPress={() => setIsEditingSongName(true)}
                    style={styles.songNamePressable}
                  >
                    <Text style={styles.songName} numberOfLines={1}>
                      {songName || 'Unknown Song'}
                    </Text>
                    <IconSymbol name="pencil" size={16} color={colors.textSecondary} />
                  </Pressable>
                )}
              </View>
              <Pressable onPress={removeSong} style={styles.removeSongButton}>
                <IconSymbol name="trash.fill" size={24} color={colors.primary} />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={pickSong} style={styles.songPickerButton}>
              <IconSymbol name="music.note.list" size={20} color={colors.primary} />
              <Text style={styles.songPickerText}>Add a song to this memory</Text>
            </Pressable>
          )}
        </View>

        {/* Frame Selector with Label */}
        <View style={styles.frameSelectorContainer}>
          <Text style={styles.label}>Select Frame Style</Text>
          <FrameSelector selectedFrame={selectedFrame} onSelectFrame={setSelectedFrame} />
        </View>

        {/* Save Button */}
        <Pressable onPress={handleSave} style={styles.saveButton}>
          <IconSymbol name="heart.fill" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save Memory</Text>
        </Pressable>

        {/* Extra spacing at bottom for easier scrolling */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Crop Modal */}
      {currentCropIndex !== null && (
        <ImageCropModal
          visible={cropModalVisible}
          imageUri={imageUris[currentCropIndex]}
          onClose={() => {
            setCropModalVisible(false);
            setCurrentCropIndex(null);
          }}
          onSave={handleCroppedImage}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 150,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  imagePickerContainer: {
    width: '100%',
    minHeight: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: colors.card,
    boxShadow: '0px 4px 12px rgba(233, 30, 99, 0.15)',
    elevation: 4,
  },
  imageGrid: {
    flex: 1,
  },
  imageListContent: {
    padding: 12,
  },
  imageWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  thumbnailImage: {
    width: 120,
    height: 160,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(233, 30, 99, 0.9)',
    borderRadius: 12,
    padding: 6,
  },
  editButton: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 6,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  addMoreContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.highlight,
  },
  addMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  imagePlaceholder: {
    flex: 1,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    padding: 20,
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  placeholderSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  imageCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'center',
    marginBottom: 20,
    gap: 6,
  },
  imageCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  dateButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  reminderText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  songContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  songNamePressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  songName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  songNameInput: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
  removeSongButton: {
    padding: 4,
  },
  songPickerButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  songPickerText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  frameSelectorContainer: {
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    boxShadow: '0px 4px 12px rgba(233, 30, 99, 0.3)',
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 50,
  },
});
