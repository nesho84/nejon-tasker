import DrawerContent from '@/components/DrawerContent';
import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from "expo-router";
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';

export default function StackLayout() {
    const { theme } = useThemeStore();
    const { tr } = useLanguageStore();

    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <Drawer
            open={drawerOpen}
            onOpen={() => setDrawerOpen(true)}
            onClose={() => setDrawerOpen(false)}
            drawerStyle={{ width: "70%" }}
            renderDrawerContent={() => <DrawerContent close={() => setDrawerOpen(false)} />} // Drawer content and links
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
                        title: tr.labels.labels,
                        headerShadowVisible: true,
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ top: 1, paddingRight: 15 }}
                                onPress={() => setDrawerOpen((prevOpen) => !prevOpen)}>
                                <Ionicons name="menu" size={28} color={theme.text} />
                            </TouchableOpacity>
                        ),
                    }}
                />

                <Stack.Screen
                    name="reminders"
                    options={{
                        title: tr.labels.reminders
                    }}
                />

                <Stack.Screen
                    name="settings"
                    options={{
                        title: tr.labels.settings
                    }}
                />

                <Stack.Screen
                    name="about"
                    options={{
                        title: tr.labels.settings
                    }}
                />

                <Stack.Screen
                    name="label-details"
                    options={{
                        title: tr.forms.editTask, animation: "slide_from_right"
                    }}
                />

            </Stack>
        </Drawer>
    );
}