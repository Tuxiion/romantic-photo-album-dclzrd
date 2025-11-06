
# Widget Feature Setup Guide

## Overview

This app includes support for iOS home screen widgets using the `@bacons/apple-targets` package. The widget infrastructure is already set up in the `contexts/WidgetContext.tsx` file.

## Current Implementation

The app has a `WidgetContext` that provides:

- **Widget State Management**: Store and retrieve data to display in widgets
- **Widget Refresh**: Trigger widget updates when app data changes
- **Shared Storage**: Use App Groups to share data between the main app and widget extension

## How to Enable Widgets

### Prerequisites

1. **Development Build Required**: Widgets require native code and cannot run in Expo Go
2. **Apple Developer Account**: Required for App Groups configuration
3. **EAS Build**: Use `eas build` to create a development build

### Setup Steps

1. **Configure App Groups**:
   - Update `contexts/WidgetContext.tsx` with your app group ID:
     ```typescript
     const storage = new ExtensionStorage(
       "group.com.yourcompany.yourapp"
     );
     ```

2. **Create Widget Extension**:
   - Add a widget target to your iOS project
   - Configure the widget to read from the shared App Group
   - Design your widget UI using SwiftUI

3. **Update Widget Data**:
   ```typescript
   import { useWidget } from '@/contexts/WidgetContext';
   
   const { refreshWidget } = useWidget();
   
   // When you add/update/delete a memory:
   refreshWidget();
   ```

4. **Store Widget Data**:
   ```typescript
   import { ExtensionStorage } from '@bacons/apple-targets';
   
   const storage = new ExtensionStorage("group.com.yourcompany.yourapp");
   
   // Store data for widget to display
   storage.set("latest_memory", {
     eventName: "Our Anniversary",
     date: "2024-01-15",
     imageUri: "...",
   });
   
   // Refresh widget
   ExtensionStorage.reloadWidget();
   ```

## Widget Ideas for This App

### 1. Latest Memory Widget
Display the most recent romantic memory with:
- Event name
- Date
- Photo thumbnail
- Frame style decoration

### 2. Upcoming Anniversary Widget
Show the next anniversary reminder:
- Days until anniversary
- Event name
- Year count

### 3. Memory Count Widget
Simple widget showing:
- Total number of memories
- Heart icon
- Tap to open app

### 4. Random Memory Widget
Display a random memory each time the widget refreshes:
- Rotating through your memories
- Surprise element

## Platform Support

- **iOS**: Full widget support (iOS 14+)
- **Android**: Not currently supported (would require different implementation)
- **Web**: Not applicable

## Resources

- [@bacons/apple-targets Documentation](https://github.com/EvanBacon/apple-targets)
- [Apple WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)

## Notes

- Widgets update on a system-determined schedule
- Use `ExtensionStorage.reloadWidget()` to request immediate updates
- Keep widget data lightweight (images should be small thumbnails)
- Test widgets on physical devices for best results
