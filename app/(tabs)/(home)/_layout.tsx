
import React from "react";
import { Stack } from "expo-router";
import { colors } from "@/styles/commonStyles";
import { Theme } from "@react-navigation/native";

// Custom theme with romantic colors
const RomanticTheme: Theme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.highlight,
    notification: colors.accent,
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" },
    medium: { fontFamily: "System", fontWeight: "500" },
    bold: { fontFamily: "System", fontWeight: "700" },
    heavy: { fontFamily: "System", fontWeight: "800" },
  },
};

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 20,
        },
        headerShadowVisible: true,
        animation: "default",
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "My Romantic Album",
          headerLargeTitle: true,
        }} 
      />
    </Stack>
  );
}
