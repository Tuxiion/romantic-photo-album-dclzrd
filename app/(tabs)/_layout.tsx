
import React from "react";
import { Platform } from "react-native";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { Stack } from "expo-router";
import FloatingTabBar, { TabBarItem } from "@/components/FloatingTabBar";
import { colors } from "@/styles/commonStyles";

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: "(home)",
      route: "/(tabs)/(home)/",
      icon: "heart.fill",
      label: "Home",
    },
    {
      name: "upload",
      route: "/(tabs)/upload",
      icon: "photo.badge.plus.fill",
      label: "Upload",
    },
    {
      name: "friends",
      route: "/(tabs)/friends",
      icon: "person.2.fill",
      label: "Friends",
    },
    {
      name: "profile",
      route: "/(tabs)/profile",
      icon: "person.fill",
      label: "Profile",
    },
  ];

  // ✅ iOS uses NativeTabs (Apple-style bottom tabs)
  if (Platform.OS === "ios") {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="(home)">
          <Icon sf="heart.fill" drawable="ic_home" />
          <Label>Home</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="upload">
          <Icon sf="photo.badge.plus.fill" drawable="ic_upload" />
          <Label>Upload</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="friends">
          <Icon sf="person.2.fill" drawable="ic_friends" />
          <Label>Friends</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Icon sf="person.fill" drawable="ic_profile" />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  // ✅ Android + Web use custom FloatingTabBar
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="upload" />
        <Stack.Screen name="friends" />
        <Stack.Screen name="profile" />
      </Stack>

      <FloatingTabBar tabs={tabs} />
    </>
  );
}
