
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    console.log('Requesting notification permissions...');
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('memories', {
        name: 'Memory Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E91E63',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    console.log('Notification permission granted');
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule a yearly notification for a memory
 */
export async function scheduleYearlyMemoryNotification(
  memoryId: string,
  eventName: string,
  memoryDate: Date
): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Cannot schedule notification without permission');
      return null;
    }

    // Calculate the next anniversary date
    const now = new Date();
    const nextAnniversary = new Date(memoryDate);
    nextAnniversary.setFullYear(now.getFullYear());

    // If the anniversary has already passed this year, schedule for next year
    if (nextAnniversary < now) {
      nextAnniversary.setFullYear(now.getFullYear() + 1);
    }

    // Set the time to 9:00 AM
    nextAnniversary.setHours(9, 0, 0, 0);

    console.log(`Scheduling yearly notification for ${eventName} on ${nextAnniversary.toLocaleDateString()}`);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `💕 ${eventName} Anniversary!`,
        body: `Remember this special day from ${memoryDate.getFullYear()}? Relive your beautiful memory! 💖`,
        data: { memoryId, type: 'yearly_reminder' },
        sound: true,
        ...(Platform.OS === 'android' && {
          channelId: 'memories',
        }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.YEARLY,
        month: memoryDate.getMonth(),
        day: memoryDate.getDate(),
        hour: 9,
        minute: 0,
      },
    });

    console.log(`Notification scheduled with ID: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Cancelled notification: ${notificationId}`);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cancelled all notifications');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Found ${notifications.length} scheduled notifications`);
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}
