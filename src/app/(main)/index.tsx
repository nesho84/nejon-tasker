import AppLoading from "@/components/AppLoading";
import AppScreen from "@/components/AppScreen";
import AddLabel from "@/components/labels/AddLabel";
import EditLabel from "@/components/labels/EditLabel";
import LabelItem from "@/components/labels/LabelItem";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { Label } from "@/types/label.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, Stack } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function LabelsScreen() {
    const { theme } = useThemeStore();
    const { tr } = useLanguageStore();

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
    // Open a BottomSheetModal for editing Label
    // ------------------------------------------------------------
    const handleEdit = (item: Label) => {
        setSelectedLabel(item);
        editLabelRef.current?.present();
    };

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
                    title: tr.labels.labels,
                    headerRight: () => (
                        <>
                            {/* Refresh Labels */}
                            <TouchableOpacity
                                style={{ top: 1, marginRight: 26 }}
                                onPress={handleRefresh}
                            >
                                <MaterialCommunityIcons name="refresh" size={26} color={theme.text} />
                            </TouchableOpacity>

                            {/* Settings */}
                            <TouchableOpacity
                                style={{ top: 1, marginRight: -3 }}
                                onPress={() => router.push("/(main)/settings")}
                            >
                                <MaterialCommunityIcons name="cog-outline" size={26} color={theme.text} />
                            </TouchableOpacity>
                        </>
                    ),
                }}
            />

            {/* Main Content */}
            <View style={styles.container}>
                {/* Labels List */}
                <LabelItem handleEdit={handleEdit} />

                {/* Floating Action Button */}
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.link }]}
                    onPress={() => addLabelRef.current?.present()}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="plus" size={28} color={theme.light} />
                </TouchableOpacity>

                {/* EditLabel BottomSheetModal */}
                <EditLabel ref={editLabelRef} label={selectedLabel} />

                {/* AddLabel BottomSheetModal */}
                <AddLabel ref={addLabelRef} />
            </View>

        </AppScreen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    fab: {
        position: "absolute",
        bottom: 24,
        right: 12,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
