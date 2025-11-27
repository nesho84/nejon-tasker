import DrawerContent from '@/components/DrawerContent';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Stack } from "expo-router";
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';

export default function StackLayout() {
    const { theme } = useThemeStore();

    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <Drawer
            open={drawerOpen}
            onOpen={() => setDrawerOpen(true)}
            onClose={() => setDrawerOpen(false)}
            drawerStyle={{ width: "70%" }}
            renderDrawerContent={() => <DrawerContent close={() => setDrawerOpen(false)} />}
        >
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: theme.background },
                    headerTintColor: theme.text,
                }}
            >

                <Stack.Screen
                    name="index"
                    options={{
                        title: "Home",
                        headerShadowVisible: true,
                        contentStyle: {
                            borderTopWidth: 1,
                            borderTopColor: theme.active,
                            elevation: 10,
                        },
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ top: 1, paddingRight: 15 }}
                                onPress={() => setDrawerOpen((prevOpen) => !prevOpen)}>
                                <Ionicons name="menu" size={28} color={theme.text} />
                            </TouchableOpacity>
                        ),
                        headerRight: () => (
                            <TouchableOpacity
                                style={{ top: 1 }}
                                onPress={() => { }}>
                                <MaterialIcons name="add" size={28} color={theme.text} />
                            </TouchableOpacity>
                        ),
                    }}
                />

                <Stack.Screen
                    name="reminders"
                    options={{
                        title: "Reminders",
                    }}
                />

                <Stack.Screen
                    name="settings"
                    options={{
                        title: "Settings",
                    }}
                />

                <Stack.Screen
                    name="about"
                    options={{
                        title: "About",
                    }}
                />

                <Stack.Screen
                    name="label-details"
                    options={{
                        title: "Label Details",
                        animation: "slide_from_right",
                    }}
                />

            </Stack>
        </Drawer>
    );
}