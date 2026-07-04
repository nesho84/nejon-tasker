import AppLoading from "@/components/AppLoading";
import AppScreen from "@/components/AppScreen";
import LabelList from "@/components/LabelList";
import { useLabelStore } from "@/store/labelStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import { MaterialIcons } from "@react-native-vector-icons/material-icons/static";
import Constants from "expo-constants";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LabelsScreen() {
    // Stores
    const theme = useThemeStore((state) => state.theme);

    // Local State
    const [isLoading, setIsLoading] = useState(false);

    // Safe area insets
    const insets = useSafeAreaInsets();
    const bottomInset = insets.bottom + 28;

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
            console.error('Failed to refresh labels/tasks:', error);
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
                                <MaterialDesignIcons name="cog-outline" size={25} color={theme.inverse} />
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
                    style={[
                        styles.fab,
                        {
                            backgroundColor: theme.fab,
                            borderColor: theme.fabBorder,
                            bottom: bottomInset,
                        }
                    ]}
                    onPress={() => router.navigate("/(modals)/addLabel")}
                    activeOpacity={0.8}
                >
                    <MaterialDesignIcons name="plus" size={28} color={theme.inverse} />
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
