
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePhotos } from '@/contexts/PhotoContext';
import { colors } from '@/styles/commonStyles';
import { getAllScheduledNotifications, requestNotificationPermissions } from '@/utils/notifications';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { photos, notificationIds } = usePhotos();
  const [scheduledNotifications, setScheduledNotifications] = useState(0);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  useEffect(() => {
    checkNotifications();
  }, [photos]);

  const checkNotifications = async () => {
    const notifications = await getAllScheduledNotifications();
    setScheduledNotifications(notifications.length);
    
    // Check if we have permission
    const hasPermission = await requestNotificationPermissions();
    setHasNotificationPermission(hasPermission);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermissions();
    if (granted) {
      setHasNotificationPermission(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert(
        'Notifications Enabled! 🔔',
        'You will now receive yearly reminders for your memories!'
      );
    } else {
      Alert.alert(
        'Permission Denied',
        'Please enable notifications in your device settings to receive memory reminders.'
      );
    }
  };

  const totalImages = photos.reduce((sum, photo) => sum + photo.uris.length, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol name="heart.circle.fill" size={64} color={colors.primary} />
          </View>
          <Text style={styles.title}>Your Romantic Album</Text>
          <Text style={styles.subtitle}>Cherish every moment together 💕</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <IconSymbol name="photo.fill.on.rectangle.fill" size={32} color={colors.primary} />
            <Text style={styles.statNumber}>{photos.length}</Text>
            <Text style={styles.statLabel}>
              {photos.length === 1 ? 'Memory' : 'Memories'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="photo.fill" size={32} color={colors.secondary} />
            <Text style={styles.statNumber}>{totalImages}</Text>
            <Text style={styles.statLabel}>
              {totalImages === 1 ? 'Photo' : 'Photos'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="bell.badge.fill" size={32} color={colors.accent} />
            <Text style={styles.statNumber}>{scheduledNotifications}</Text>
            <Text style={styles.statLabel}>
              {scheduledNotifications === 1 ? 'Reminder' : 'Reminders'}
            </Text>
          </View>
        </View>

        {/* Notification Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="bell.fill" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Yearly Reminders</Text>
          </View>
          
          {hasNotificationPermission ? (
            <View style={styles.notificationCard}>
              <View style={styles.notificationIconContainer}>
                <IconSymbol name="checkmark.circle.fill" size={32} color="#34C759" />
              </View>
              <View style={styles.notificationTextContainer}>
                <Text style={styles.notificationTitle}>Notifications Enabled ✓</Text>
                <Text style={styles.notificationDescription}>
                  You'll receive reminders every year on your memory dates at 9:00 AM
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.notificationCard}>
              <View style={styles.notificationIconContainer}>
                <IconSymbol name="bell.slash.fill" size={32} color={colors.textSecondary} />
              </View>
              <View style={styles.notificationTextContainer}>
                <Text style={styles.notificationTitle}>Enable Reminders</Text>
                <Text style={styles.notificationDescription}>
                  Get notified every year to relive your special moments
                </Text>
              </View>
              <Pressable onPress={handleEnableNotifications} style={styles.enableButton}>
                <Text style={styles.enableButtonText}>Enable</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="sparkles" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Features</Text>
          </View>

          <View style={styles.featureCard}>
            <IconSymbol name="photo.stack.fill" size={24} color={colors.primary} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Multiple Photos</Text>
              <Text style={styles.featureDescription}>
                Add multiple photos to each memory
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <IconSymbol name="calendar.badge.clock" size={24} color={colors.secondary} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Yearly Reminders</Text>
              <Text style={styles.featureDescription}>
                Automatic notifications on anniversary dates
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <IconSymbol name="paintbrush.fill" size={24} color={colors.accent} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Romantic Frames</Text>
              <Text style={styles.featureDescription}>
                Beautiful frames to enhance your photos
              </Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <IconSymbol name="info.circle.fill" size={20} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            Your memories are stored locally on your device
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
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  notificationCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  enableButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 100,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
