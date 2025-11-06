
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
  requestNotificationPermissions,
} from '@/utils/notifications';
import * as Haptics from 'expo-haptics';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Required for web-based authentication
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration - Your Client ID
const GOOGLE_CLIENT_ID = '1012013851449-lpuk4528h5nfk5fojdpmumdp3ogb79h6.apps.googleusercontent.com';

export default function ProfileScreen() {
  const { photos } = usePhotos();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);

  // Generate the redirect URI
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'romantic',
    path: 'redirect',
  });

  // Google OAuth setup with proper configuration
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: redirectUri,
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    }
  );

  useEffect(() => {
    // Log the redirect URI for Google Cloud Console setup
    console.log('='.repeat(60));
    console.log('GOOGLE OAUTH REDIRECT URI:');
    console.log(redirectUri);
    console.log('='.repeat(60));
    console.log('Add this URI to your Google Cloud Console:');
    console.log('1. Go to: https://console.cloud.google.com/');
    console.log('2. Select your project');
    console.log('3. Go to: APIs & Services > Credentials');
    console.log('4. Click on your OAuth 2.0 Client ID');
    console.log('5. Add the above URI to "Authorized redirect URIs"');
    console.log('='.repeat(60));
  }, [redirectUri]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('Google authentication successful');
      fetchUserInfo(authentication?.accessToken);
    } else if (response?.type === 'error') {
      console.error('Google authentication error:', response.error);
      Alert.alert('Authentication Error', 'Failed to sign in with Google. Please try again.');
    }
  }, [response]);

  const fetchUserInfo = async (accessToken?: string) => {
    if (!accessToken) {
      console.log('No access token available');
      return;
    }

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      const userInfo = await response.json();
      console.log('User info fetched:', userInfo.email);
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
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const result = await promptAsync();
      console.log('Auth prompt result:', result.type);
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

  const handleShowRedirectUri = () => {
    Alert.alert(
      'Google OAuth Setup',
      `Add this Redirect URI to your Google Cloud Console:\n\n${redirectUri}\n\nSteps:\n1. Go to console.cloud.google.com\n2. Select your project\n3. Go to APIs & Services > Credentials\n4. Click your OAuth 2.0 Client ID\n5. Add the URI to "Authorized redirect URIs"\n6. Save changes`,
      [
        {
          text: 'Copy URI',
          onPress: () => {
            // On web, we can't copy to clipboard easily, so just show it
            console.log('Redirect URI:', redirectUri);
            Alert.alert('URI Logged', 'Check the console for the redirect URI');
          },
        },
        { text: 'OK' },
      ]
    );
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
            <>
              <Pressable 
                onPress={handleGoogleSignIn} 
                style={styles.googleButton}
                disabled={!request}
              >
                <IconSymbol name="g.circle.fill" size={20} color="#FFFFFF" />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </Pressable>
              
              <Pressable 
                onPress={handleShowRedirectUri} 
                style={styles.infoButton}
              >
                <IconSymbol name="info.circle.fill" size={16} color={colors.primary} />
                <Text style={styles.infoButtonText}>View Google OAuth Setup Instructions</Text>
              </Pressable>
            </>
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
              <IconSymbol name="person.2.fill" size={32} color={colors.accent} />
              <Text style={styles.statNumber}>{friendsCount}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
          </View>
        </View>

        {/* Google OAuth Info Card */}
        <View style={styles.infoCard}>
          <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Google Sign-In Setup</Text>
            <Text style={styles.infoText}>
              To enable Google Sign-In, add this redirect URI to your Google Cloud Console:
            </Text>
            <View style={styles.uriBox}>
              <Text style={styles.uriText} selectable>{redirectUri}</Text>
            </View>
            <Text style={styles.infoText}>
              Steps:{'\n'}
              1. Go to console.cloud.google.com{'\n'}
              2. Select your project{'\n'}
              3. Navigate to APIs & Services → Credentials{'\n'}
              4. Click your OAuth 2.0 Client ID{'\n'}
              5. Add the URI above to &quot;Authorized redirect URIs&quot;{'\n'}
              6. Save changes
            </Text>
          </View>
        </View>

        {/* Friends Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol name="person.2.fill" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Friends</Text>
          </View>
          <Text style={styles.cardDescription}>
            Connect with friends to share your romantic memories and view their albums.
          </Text>
          <View style={styles.friendsInfo}>
            <Text style={styles.friendsCountText}>
              You have {friendsCount} {friendsCount === 1 ? 'friend' : 'friends'}
            </Text>
          </View>
          <Pressable 
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              Alert.alert('Coming Soon', 'Friend management features are coming soon!');
            }} 
            style={styles.actionButton}
          >
            <IconSymbol name="person.badge.plus.fill" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Add Friends</Text>
          </Pressable>
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
          <Pressable onPress={handleEnableNotifications} style={styles.actionButton}>
            <IconSymbol name="bell.fill" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Enable Notifications</Text>
          </Pressable>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>About Romantic</Text>
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
    paddingBottom: 140,
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
  infoButton: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  infoButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
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
  friendsInfo: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  friendsCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
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
    marginBottom: 16,
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
  uriBox: {
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  uriText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  bottomSpacer: {
    height: 20,
  },
});
