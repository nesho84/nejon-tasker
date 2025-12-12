import AppLoading from "@/components/AppLoading";
import AppModal from "@/components/AppModal";
import AppScreen from "@/components/AppScreen";
import AddLabel from "@/components/labels/AddLabel";
import EditLabel from "@/components/labels/EditLabel";
import LabelCard from "@/components/labels/LabelCard";
import { useLabelStore } from "@/store/labelStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { Label } from "@/types/label.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function LabelsScreen() {
    const { theme } = useThemeStore();

    // Reload stores and database
    const loadLabels = useLabelStore((state) => state.loadLabels);
    const loadTasks = useTaskStore((state) => state.loadTasks);

    // Local State
    const [isLoading, setIsLoading] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);

    // Refresh Labels manually
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
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }
    };

    // Open a modal for editing Label
    const handleEditModal = (item: Label) => {
        setSelectedLabel(item);
        setEditModalVisible(true);
    };

    // Loading state
    if (isLoading) {
        return <AppLoading />;
    }

    return (
        <AppScreen>

            {/* Navigation bar icons */}
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <>
                            {/* Add Label */}
                            <TouchableOpacity
                                style={{ top: 1, marginRight: 26 }}
                                onPress={() => setAddModalVisible(true)}
                            >
                                <MaterialCommunityIcons name="folder-plus-outline" size={26} color={theme.text} />
                            </TouchableOpacity>

                            {/* Refresh Labels */}
                            <TouchableOpacity
                                style={{ top: 1, marginRight: -3 }}
                                onPress={handleRefresh}
                            >
                                <MaterialCommunityIcons name="refresh" size={26} color={theme.text} />
                            </TouchableOpacity>
                        </>
                    ),
                }}
            />

            {/* Main Content */}
            <View style={styles.container}>
                {/* Labels List */}
                <LabelCard handleEditModal={handleEditModal} />

                {/* Edit/Update Label Modal */}
                <AppModal modalVisible={editModalVisible} setModalVisible={setEditModalVisible}>
                    {selectedLabel && (
                        <EditLabel
                            label={selectedLabel}
                            handleEditModal={setEditModalVisible}
                        />
                    )}
                </AppModal>

                {/* Add Label Modal */}
                <AppModal modalVisible={addModalVisible} setModalVisible={setAddModalVisible}>
                    <AddLabel handleAddModal={setAddModalVisible} />
                </AppModal>
            </View>

        </AppScreen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
