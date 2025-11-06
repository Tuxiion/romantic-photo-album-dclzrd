
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let currentSound: Audio.Sound | null = null;

export async function initializeAudio() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
    console.log('Audio initialized successfully');
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
}

export async function playSound(uri: string): Promise<Audio.Sound | null> {
  try {
    console.log('Loading sound from:', uri);
    
    // Stop and unload current sound if exists
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { 
        shouldPlay: true,
        progressUpdateIntervalMillis: 50,
      }
    );

    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        console.log('Playback finished');
      }
    });

    console.log('Playing sound');
    return sound;
  } catch (error) {
    console.error('Error playing sound:', error);
    return null;
  }
}

export async function pauseSound() {
  try {
    if (currentSound) {
      console.log('Pausing sound');
      await currentSound.pauseAsync();
    }
  } catch (error) {
    console.error('Error pausing sound:', error);
  }
}

export async function stopSound() {
  try {
    if (currentSound) {
      console.log('Stopping sound');
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
  } catch (error) {
    console.error('Error stopping sound:', error);
  }
}

export async function resumeSound() {
  try {
    if (currentSound) {
      console.log('Resuming sound');
      await currentSound.playAsync();
    }
  } catch (error) {
    console.error('Error resuming sound:', error);
  }
}

export async function seekToPosition(seconds: number) {
  try {
    if (currentSound) {
      const milliseconds = Math.max(0, seconds * 1000);
      console.log('Seeking to position:', seconds, 'seconds (', milliseconds, 'ms)');
      await currentSound.setPositionAsync(milliseconds);
      
      // Get the status to verify the seek worked
      const status = await currentSound.getStatusAsync();
      if (status.isLoaded) {
        console.log('Seek successful, new position:', status.positionMillis / 1000, 'seconds');
      }
    }
  } catch (error) {
    console.error('Error seeking sound:', error);
  }
}

export async function getSoundStatus() {
  try {
    if (currentSound) {
      return await currentSound.getStatusAsync();
    }
    return null;
  } catch (error) {
    console.error('Error getting sound status:', error);
    return null;
  }
}
