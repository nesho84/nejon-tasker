import AppLoading from "@/components/AppLoading";
import AppScreen from "@/components/AppScreen";
import LabelList from "@/components/LabelList";
import { useLabelStore } from "@/store/labelStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router, Stack } from "expo-router";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function LabelsScreen() {
    // Stores
    const theme = useThemeStore((state) => state.theme);

    // Local State
    const [isLoading, setIsLoading] = useState(false);

    // ------------------------------------------------------------
    // Check for expo OTA updates on mount
    // ------------------------------------------------------------
    useEffect(() => {
        if (__DEV__) return; // Skip in dev mode
        const checkForUpdates = async () => {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                await Updates.fetchUpdateAsync();
                Updates.reloadAsync();
            }
        };
        checkForUpdates();
    }, []);

    // ------------------------------------------------------------
    // Refresh Labels manually
    // ------------------------------------------------------------
    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            // Reload labels and tasks from database
            await useLabelStore.getState().loadLabels();
            await useTaskStore.getState().loadTasks();
        } catch (error) {
            console.log(error);
        } finally {
            // Delay for smoother UX
            setTimeout(() => setIsLoading(false), 500);
        }
    };

    // Loading state
    if (isLoading) {
        return <AppLoading />;
    }

    return (
        <AppScreen>

            {/* Top Navigation bar icons */}
            <Stack.Screen
                options={{
                    // title: tr.labels.labels,
                    title: Constants?.expoConfig?.name,
                    headerTitleStyle: { fontSize: 24, fontWeight: '700' },
                    headerRight: () => (
                        <>
                            {/* Refresh Labels Icon */}
                            <TouchableOpacity
                                style={{ top: 1.4, paddingRight: 24 }}
                                onPress={handleRefresh}
                            >
                                <MaterialIcons name="refresh" size={26} color={theme.inverse} />
                            </TouchableOpacity>

                            {/* Settings Icon */}
                            <TouchableOpacity
                                style={{ top: 1, marginRight: -3 }}
                                onPress={() => router.navigate("/(main)/settings")}
                            >
                                <MaterialCommunityIcons name="cog-outline" size={25} color={theme.inverse} />
                            </TouchableOpacity>
                        </>
                    ),
                }}
            />

            {/* Main Content */}
            <View style={styles.container}>

                {/* Labels List */}
                <LabelList />

                {/* Floating Action Button */}
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.fab, borderColor: theme.fabBorder }]}
                    onPress={() => router.navigate("/(modals)/addLabel")}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="plus" size={28} color={theme.inverse} />
                </TouchableOpacity>
            </View>

        </AppScreen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fab: {
        position: "absolute",
        bottom: 28,
        right: 12,
        width: 56,
        height: 56,
        borderWidth: 0.8,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
    },
});
