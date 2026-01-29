import AppLoading from "@/components/AppLoading";
import AppScreen from "@/components/AppScreen";
import AddLabel from "@/components/labels/AddLabel";
import EditLabel from "@/components/labels/EditLabel";
import LabelItem from "@/components/labels/LabelItem";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { Label } from "@/types/label.types";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import { router, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function LabelsScreen() {
    const { theme } = useThemeStore();
    const { tr } = useLanguageStore();
    const { setOnboarding } = useOnboardingStore();

    // Reload stores and database
    const loadLabels = useLabelStore((state) => state.loadLabels);
    const loadTasks = useTaskStore((state) => state.loadTasks);

    // Refs for bottomSheet Modals
    const addLabelRef = useRef<BottomSheetModal>(null);
    const editLabelRef = useRef<BottomSheetModal>(null);

    // Local State
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);

    // ------------------------------------------------------------
    // Refresh Labels manually
    // ------------------------------------------------------------
    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            // Reload labels and tasks from database
            await loadLabels();
            await loadTasks();
        } catch (error) {
            console.log(error);
        } finally {
            // Delay for smoother UX
            setTimeout(() => setIsLoading(false), 500);
        }
    };

    // ------------------------------------------------------------
    // Handle selecting a Label from the list
    // ------------------------------------------------------------
    const onSelect = (label: Label) => {
        setSelectedLabel(label);
    };

    // ------------------------------------------------------------
    // Open a BottomSheetModal for editing Label
    // ------------------------------------------------------------
    useEffect(() => {
        if (selectedLabel) {
            editLabelRef.current?.present();
        }
    }, [selectedLabel]);

    // Loading state
    if (isLoading) {
        return (
            <AppScreen>
                <AppLoading />
            </AppScreen>
        );
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
                                style={{ top: 1.3, paddingRight: 24 }}
                                onPress={handleRefresh}
                            >
                                <MaterialIcons name="refresh" size={26} color={theme.inverse} />
                            </TouchableOpacity>

                            {/* Settings Icon */}
                            <TouchableOpacity
                                style={{ top: 1, marginRight: -3 }}
                                onPress={() => router.push("/(main)/settings")}
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
                <LabelItem onSelect={onSelect} />

                {/* AddLabel BottomSheetModal */}
                <AddLabel ref={addLabelRef} />

                {/* EditLabel BottomSheetModal */}
                <EditLabel
                    ref={editLabelRef}
                    label={selectedLabel}
                    onDismiss={() => setSelectedLabel(null)}
                />

                {/* Floating Action Button */}
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.action1 }]}
                    onPress={() => addLabelRef.current?.present()}
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
        bottom: 22,
        right: 10,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
    },
});
