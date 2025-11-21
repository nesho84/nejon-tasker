import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarLabelStyle: { fontSize: 11 },
                tabBarStyle: {
                    height: insets.bottom + 55,
                    elevation: 0,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ focused, color, size }) =>
                        <MaterialCommunityIcons name={focused ? "home" : "home-outline"} size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",

                    tabBarIcon: ({ focused, color, size }) =>
                        <MaterialCommunityIcons name={focused ? "cog" : "cog-outline"} size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="about"
                options={{
                    title: "About",
                    tabBarIcon: ({ focused, color, size }) =>
                        <MaterialCommunityIcons name={focused ? "information-slab-circle" : "information-slab-circle-outline"} size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
