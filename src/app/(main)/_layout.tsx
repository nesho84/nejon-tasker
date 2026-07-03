import { useLabelStore } from '@/store/labelStore';
import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { Label } from '@/types/label.types';
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import { MaterialIcons } from "@react-native-vector-icons/material-icons/static";
import Constants from 'expo-constants';
import { router, Stack } from "expo-router";
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StackLayout() {
    // Stores
    const theme = useThemeStore((state) => state.theme);
    const tr = useLanguageStore((state) => state.tr);
    const labels = useLabelStore((state) => state.labels);

    // Safe area insets
    const insets = useSafeAreaInsets();
    const topInset = insets.top + 10;
    const bottomInset = insets.bottom + 12;
    const leftInset = insets.left - 10;

    // Local State
    const [drawerOpen, setDrawerOpen] = useState(false);

    const closeDrawer = () => setDrawerOpen(false);

    // Drawer Content Component
    const DrawerContent = () => {
        return (
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <ScrollView
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{
                        paddingTop: topInset,
                        paddingBottom: bottomInset,
                        paddingLeft: leftInset,
                    }}
                >

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.headerText, { color: theme.text }]}>{Constants?.expoConfig?.name}</Text>
                    </View>

                    {/* Selected item (Home) */}
                    <TouchableOpacity
                        onPress={closeDrawer}
                        style={[styles.selectedItem, { backgroundColor: theme.disabled }]}
                        activeOpacity={0.85}
                    >
                        <MaterialDesignIcons name="home" size={22} color={theme.text} />
                        <Text style={[styles.selectedLabel, { color: theme.text }]}>{tr.labels.home}</Text>
                    </TouchableOpacity>

                    {/* Reminders */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            closeDrawer();
                            router.navigate("/(main)/reminders");
                        }}
                        activeOpacity={0.7}
                    >
                        <MaterialDesignIcons name="bell-outline" size={22} color={theme.text} />
                        <Text style={[styles.menuLabel, { color: theme.text }]}>{tr.labels.reminders}</Text>
                    </TouchableOpacity>

                    {/* Favorites */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            closeDrawer();
                            router.navigate("/(main)/favorites");
                        }}
                        activeOpacity={0.7}
                    >
                        <MaterialDesignIcons name="bookmark-outline" size={22} color={theme.text} />
                        <Text style={[styles.menuLabel, { color: theme.text }]}>{tr.labels.favorites}</Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Labels header */}
                    <View style={[styles.labelsHeader, { paddingTop: 14 }]}>
                        <Text style={[styles.labelsTitle, { color: theme.muted }]}>{tr.labels.labels}</Text>
                    </View>
                    {/* Labels */}
                    {labels && labels.length > 0 && (
                        labels.map((item: Label) => {
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.menuItem}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        closeDrawer();
                                        router.navigate(`/tasks?labelId=${item.id}`)
                                    }}
                                >
                                    <MaterialDesignIcons name="label-outline" size={22} color={theme.text} />
                                    <Text style={[styles.menuLabel, { color: theme.text }]}>
                                        {item.title.length > 25 ? item.title.slice(0, 20) + "..." : item.title}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })
                    )}

                    {/* New Label */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        activeOpacity={0.7}
                        onPress={() => {
                            closeDrawer();
                            router.navigate("/(modals)/addLabel");
                        }}
                    >
                        <MaterialIcons name="add" size={24} color={theme.text} />
                        <Text style={[styles.menuLabel, { fontSize: 14, color: theme.text }]}>{tr.forms.newLabel}</Text>
                    </TouchableOpacity>


                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Trash */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        activeOpacity={0.7}
                        onPress={() => {
                            closeDrawer();
                            router.navigate("/(main)/trash");
                        }}
                    >
                        <MaterialDesignIcons name="trash-can-outline" size={22} color={theme.text} />
                        <Text style={[styles.menuLabel, { color: theme.text }]}>{tr.labels.trash}</Text>
                    </TouchableOpacity>

                    {/* Settings */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        activeOpacity={0.7}
                        onPress={() => {
                            closeDrawer();
                            router.navigate("/(main)/settings");
                        }}
                    >
                        <MaterialDesignIcons name="cog-outline" size={22} color={theme.text} />
                        <Text style={[styles.menuLabel, { color: theme.text }]}>{tr.labels.settings}</Text>
                    </TouchableOpacity>

                    {/* About */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        activeOpacity={0.7}
                        onPress={() => {
                            closeDrawer();
                            router.navigate("/(main)/about");
                        }}
                    >
                        <MaterialDesignIcons name="information-outline" size={22} color={theme.text} />
                        <Text style={[styles.menuLabel, { color: theme.text }]}>{tr.labels.about}</Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        );
    }

    // Main Content
    return (
        <Drawer
            drawerType='front'
            open={drawerOpen}
            onOpen={() => setDrawerOpen(true)}
            onClose={closeDrawer}
            drawerStyle={{ width: "77%" }}
            // Drawer content and menu links
            renderDrawerContent={() => {
                return <DrawerContent />
            }}
        >
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: theme.bg },
                    headerTintColor: theme.text,
                }}
            >

                <Stack.Screen
                    name="index"
                    options={{
                        // title: tr.labels.labels,
                        headerShadowVisible: true,
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ top: 1, paddingRight: 15 }}
                                onPress={() => setDrawerOpen((prevOpen) => !prevOpen)}>
                                <MaterialDesignIcons name="menu" size={30} color={theme.text} />
                            </TouchableOpacity>
                        ),
                    }}
                />

                <Stack.Screen
                    name="reminders"
                    options={{
                        title: tr.labels.reminders,
                        animation: "none"
                    }}
                />

                <Stack.Screen
                    name="favorites"
                    options={{
                        title: tr.labels.favorites,
                        animation: "none"
                    }}
                />

                <Stack.Screen
                    name="trash"
                    options={{
                        title: tr.labels.trash,
                        animation: "none"
                    }}
                />

                <Stack.Screen
                    name="settings"
                    options={{
                        title: tr.labels.settings,
                        animation: "none"
                    }}
                />

                <Stack.Screen
                    name="about"
                    options={{
                        title: tr.labels.about,
                        animation: "none"
                    }}
                />

                <Stack.Screen
                    name="tasks"
                    options={{
                        title: tr.labels.tasks,
                        animation: "ios_from_right"
                    }}
                />

            </Stack>
        </Drawer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    header: {
        marginTop: 6,
        marginBottom: 22,
        paddingLeft: 16,
    },
    headerText: {
        fontSize: 26,
        fontWeight: "500",
    },

    selectedItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 999,
        marginHorizontal: 8,
        marginBottom: 8,
    },
    selectedLabel: {
        fontSize: 18,
        marginLeft: 14,
        fontWeight: "500",
    },

    labelsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 22,
        marginBottom: 6,
    },
    labelsTitle: {
        fontSize: 14,
        textTransform: "none",
    },

    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 22,
    },

    menuLabel: {
        fontSize: 17,
        marginLeft: 16,
    },

    divider: {
        height: 1,
        marginVertical: 12,
        marginHorizontal: 22,
    },
});