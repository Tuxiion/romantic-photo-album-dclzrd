
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

export default function FriendsScreen() {
  const handleAddFriend = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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
            Connect with friends to see their memories
          </Text>
        </View>

        <View style={styles.emptyState}>
          <IconSymbol name="heart.circle" size={80} color={colors.textSecondary} />
          <Text style={styles.emptyStateTitle}>Share Your Love Stories</Text>
          <Text style={styles.emptyStateText}>
            Adding friends will make their albums appear here.{'\n\n'}
            Login under Profile to see friends&apos; albums and share your romantic memories together! 💕
          </Text>
          
          <Pressable onPress={handleAddFriend} style={styles.addFriendButton}>
            <IconSymbol name="person.badge.plus.fill" size={20} color="#FFFFFF" />
            <Text style={styles.addFriendButtonText}>Add Friends</Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>How it works:</Text>
            <Text style={styles.infoText}>
              Log in under Profile to connect your account{'\n\n'}
              Add friends to share your albums{'\n\n'}
              View and celebrate their romantic moments{'\n\n'}
              Keep your memories private or share with loved ones
            </Text>
          </View>
        </View>

        {/* Extra spacing for better scrolling */}
        <View style={styles.extraSpace} />
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
    paddingBottom: 200,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addFriendButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0px 4px 12px rgba(233, 30, 99, 0.3)',
    elevation: 6,
    minWidth: 200,
  },
  addFriendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  extraSpace: {
    height: 100,
  },
});
