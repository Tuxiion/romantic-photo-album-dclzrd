
import React from "react";
import { TouchableOpacity, Text, View, StyleSheet, Dimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { IconSymbol } from "@/components/IconSymbol";
import { BlurView } from "expo-blur";
import { useTheme } from "@react-navigation/native";
import { useRouter, usePathname } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/styles/commonStyles";

export interface TabBarItem {
  name: string;
  route: string;
  icon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

interface TabItemProps {
  tab: TabBarItem;
  isActive: boolean;
  onPress: () => void;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = Dimensions.get("window").width - 40,
  borderRadius = 25,
  bottomMargin = 20,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabPress = (route: string) => {
    console.log("Tab pressed:", route);
    router.push(route as any);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { bottom: bottomMargin }]}
      edges={["bottom"]}
    >
      <BlurView
        intensity={80}
        tint="light"
        style={[
          styles.container,
          {
            width: containerWidth,
            borderRadius: borderRadius,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          },
        ]}
      >
        {tabs.map((tab) => (
          <TabItem
            key={tab.name}
            tab={tab}
            isActive={pathname.includes(tab.name)}
            onPress={() => handleTabPress(tab.route)}
          />
        ))}
      </BlurView>
    </SafeAreaView>
  );
}

const TabItem = ({ tab, isActive, onPress }: TabItemProps) => {
  const scale = useSharedValue(isActive ? 1.2 : 1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(isActive ? 1.2 : 1, { duration: 200 }) }],
    };
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.tabButton}>
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        <View
          style={[
            styles.iconContainer,
            isActive && { backgroundColor: colors.highlight },
          ]}
        >
          <IconSymbol
            name={tab.icon as any}
            size={24}
            color={isActive ? colors.primary : colors.textSecondary}
          />
        </View>
        <Text
          style={[
            styles.label,
            {
              color: isActive ? colors.primary : colors.textSecondary,
              fontWeight: isActive ? "700" : "500",
            },
          ]}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
    pointerEvents: "box-none",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(233, 30, 99, 0.1)",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
});
