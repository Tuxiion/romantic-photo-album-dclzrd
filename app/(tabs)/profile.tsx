
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { usePhotos } from '@/contexts/PhotoContext';
import { colors } from '@/styles/commonStyles';
import {
  getAllScheduledNotifications,
  requestNotificationPermissions,
} from '@/utils/notifications';
import * as Haptics from 'expo-haptics';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Required for web-based authentication
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export default function ProfileScreen() {
  const { photos } = usePhotos();
  const [notificationCount, setNotificationCount] = useState(0);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  // Google OAuth setup
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'natively',
      }),
    },
    discovery
  );

  useEffect(() => {
    checkNotifications();
  }, [photos]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('Google authentication successful:', authentication);
      fetchUserInfo(authentication?.accessToken);
    }
  }, [response]);

  const checkNotifications = async () => {
    const scheduled = await getAllScheduledNotifications();
    console.log(`Found ${scheduled.length} scheduled notifications`);
    setNotificationCount(scheduled.length);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermissions();
    if (granted) {
      Alert.alert(
        'Notifications Enabled! 🔔',
        'You will receive yearly reminders for your romantic memories!'
      );
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      Alert.alert(
        'Permission Denied',
        'Please enable notifications in your device settings to receive memory reminders.'
      );
    }
  };

  const fetchUserInfo = async (accessToken?: string) => {
    if (!accessToken) {
      console.log('No access token available');
      return;
    }

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await response.json();
      console.log('User info fetched:', userInfo);
      setUser({
        name: userInfo.name,
        email: userInfo.email,
      });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Welcome!', `Signed in as ${userInfo.name}`);
    } catch (error) {
      console.error('Error fetching user info:', error);
      Alert.alert('Error', 'Failed to fetch user information');
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('Initiating Google Sign-In...');
    
    // Check if Google Client ID is configured
    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
      Alert.alert(
        'Configuration Required',
        'Google Sign-In requires configuration:\n\n' +
        '1. Create a Google Cloud project\n' +
        '2. Enable Google+ API\n' +
        '3. Create OAuth 2.0 credentials\n' +
        '4. Add your Client ID to profile.tsx\n\n' +
        'For now, this is a demo feature.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const result = await promptAsync();
      console.log('Auth result:', result);
    } catch (error) {
      console.error('Error during Google Sign-In:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
    }
  };

  const handleSignOut = () => {
    console.log('Signing out...');
    setUser(null);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Signed Out', 'You have been signed out successfully');
  };

  const totalPhotos = photos.reduce((sum, photo) => sum + photo.uris.length, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <IconSymbol name="person.fill" size={32} color={colors.primary} />
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol name="person.circle.fill" size={48} color={colors.primary} />
            <View style={styles.userInfo}>
              {user ? (
                <>
                  <Text style={styles.userName}>{user.name || 'User'}</Text>
                  <Text style={styles.userEmail}>{user.email || ''}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.userName}>Guest User</Text>
                  <Text style={styles.userEmail}>Sign in to sync your memories</Text>
                </>
              )}
            </View>
          </View>

          {user ? (
            <Pressable onPress={handleSignOut} style={styles.signOutButton}>
              <IconSymbol name="arrow.right.square.fill" size={20} color={colors.text} />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </Pressable>
          ) : (
            <Pressable onPress={handleGoogleSignIn} style={styles.googleButton}>
              <IconSymbol name="g.circle.fill" size={20} color="#FFFFFF" />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </Pressable>
          )}
        </View>

        {/* Stats Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Memories</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <IconSymbol name="heart.fill" size={32} color={colors.primary} />
              <Text style={styles.statNumber}>{photos.length}</Text>
              <Text style={styles.statLabel}>Albums</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <IconSymbol name="photo.fill" size={32} color={colors.secondary} />
              <Text style={styles.statNumber}>{totalPhotos}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <IconSymbol name="bell.fill" size={32} color={colors.accent} />
              <Text style={styles.statNumber}>{notificationCount}</Text>
              <Text style={styles.statLabel}>Reminders</Text>
            </View>
          </View>
        </View>

        {/* Notifications Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol name="bell.badge.fill" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Notifications</Text>
          </View>
          <Text style={styles.cardDescription}>
            Enable notifications to receive yearly reminders for your romantic memories on their
            anniversary dates.
          </Text>
          <Pressable onPress={handleEnableNotifications} style={styles.enableButton}>
            <IconSymbol name="bell.fill" size={20} color="#FFFFFF" />
            <Text style={styles.enableButtonText}>Enable Notifications</Text>
          </Pressable>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>About Romantic Album</Text>
            <Text style={styles.infoText}>
              Create beautiful photo albums with romantic frames. Upload multiple photos, choose
              your favorite frame style, and receive yearly reminders to celebrate your special
              moments! 💕
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(233, 30, 99, 0.15)',
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signOutButton: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    borderWidth: 2,
    borderColor: colors.textSecondary,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.highlight,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  enableButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  enableButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  infoContent: {
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
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 20,
  },
});
