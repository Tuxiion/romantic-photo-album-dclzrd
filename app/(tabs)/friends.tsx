
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import PhotoCard from '@/components/PhotoCard';
import * as Haptics from 'expo-haptics';
import { Photo } from '@/types/Photo';

// Mock friends data - in a real app, this would come from a backend
const mockFriendsAlbums: { friendName: string; photos: Photo[] }[] = [
  {
    friendName: 'Sarah & Mike',
    photos: [
      {
        id: 'friend1',
        uris: [
          'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400',
          'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400',
        ],
        eventName: 'Beach Sunset',
        date: new Date('2024-06-15'),
        frame: 'hearts',
        createdAt: new Date('2024-06-15'),
      },
    ],
  },
  {
    friendName: 'Emma & James',
    photos: [
      {
        id: 'friend2',
        uris: [
          'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400',
          'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400',
        ],
        eventName: 'Mountain Adventure',
        date: new Date('2024-07-20'),
        frame: 'roses',
        createdAt: new Date('2024-07-20'),
      },
    ],
  },
  {
    friendName: 'Alex & Jordan',
    photos: [
      {
        id: 'friend3',
        uris: [
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
        ],
        eventName: 'City Lights',
        date: new Date('2024-08-10'),
        frame: 'elegant',
        createdAt: new Date('2024-08-10'),
      },
    ],
  },
];

export default function FriendsScreen() {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  const handlePhotoPress = (friendName: string, photo: Photo) => {
    console.log(`Viewing ${friendName}'s photo: ${photo.eventName}`);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAddFriend = () => {
    Alert.alert(
      'Add Friends',
      'Connect with friends to share your romantic memories! This feature requires backend integration.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <IconSymbol name="person.2.fill" size={32} color={colors.primary} />
          <Text style={styles.title}>Friends&apos; Albums</Text>
          <Text style={styles.subtitle}>
            See the romantic memories your friends are sharing
          </Text>
        </View>

        <Pressable onPress={handleAddFriend} style={styles.addFriendButton}>
          <IconSymbol name="person.badge.plus.fill" size={20} color="#FFFFFF" />
          <Text style={styles.addFriendButtonText}>Add Friends</Text>
        </Pressable>

        {mockFriendsAlbums.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="person.2.slash.fill" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Friends Yet</Text>
            <Text style={styles.emptyStateText}>
              Add friends to see their romantic memories!
            </Text>
          </View>
        ) : (
          <View style={styles.albumsContainer}>
            {mockFriendsAlbums.map((friend, index) => (
              <View key={index} style={styles.friendSection}>
                <View style={styles.friendHeader}>
                  <View style={styles.friendAvatar}>
                    <IconSymbol name="heart.fill" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.friendName}>{friend.friendName}</Text>
                  <Text style={styles.photoCount}>
                    {friend.photos.length} {friend.photos.length === 1 ? 'memory' : 'memories'}
                  </Text>
                </View>

                {friend.photos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onPress={() => handlePhotoPress(friend.friendName, photo)}
                  />
                ))}
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Friends feature requires backend integration. Enable Supabase to connect with friends
            and share your albums!
          </Text>
        </View>
      </ScrollView>
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
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
  addFriendButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    boxShadow: '0px 4px 12px rgba(233, 30, 99, 0.3)',
    elevation: 6,
  },
  addFriendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  albumsContainer: {
    gap: 24,
  },
  friendSection: {
    gap: 16,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.highlight,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  photoCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
