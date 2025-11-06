
import React from "react";
import { Stack } from "expo-router";
import { PhotoProvider } from "@/contexts/PhotoContext";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <PhotoProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "default",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: "modal",
            headerShown: true,
            title: "Modal"
          }} 
        />
        <Stack.Screen 
          name="formsheet" 
          options={{ 
            presentation: "formSheet",
            headerShown: true,
            title: "Form Sheet"
          }} 
        />
        <Stack.Screen 
          name="transparent-modal" 
          options={{ 
            presentation: "transparentModal",
            headerShown: false,
            animation: "fade"
          }} 
        />
      </Stack>
    </PhotoProvider>
  );
}
