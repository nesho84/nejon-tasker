import DrawerContent from '@/components/DrawerContent';
import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
            drawerType='front'
            open={drawerOpen}
            onOpen={() => setDrawerOpen(true)}
            onClose={() => setDrawerOpen(false)}
            drawerStyle={{ width: "77%" }}
            // Drawer content and menu links
            renderDrawerContent={() => {
                return <DrawerContent close={() => setDrawerOpen(false)} />
            }}
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
                                <MaterialCommunityIcons name="menu" size={28} color={theme.text} />
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
                    name="tasks"
                    options={{
                        title: tr.forms.editTask,
                        animation: "slide_from_right"
                    }}
                />

            </Stack>
        </Drawer>
    );
}