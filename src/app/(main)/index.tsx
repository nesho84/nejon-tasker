import AppLoading from "@/components/AppLoading";
import AppModal from "@/components/AppModal";
import AppScreen from "@/components/AppScreen";
import AddLabel from "@/components/labels/AddLabel";
import EditLabel from "@/components/labels/EditLabel";
import LabelsList from "@/components/labels/LabelsList";
import { useLabelStore } from "@/store/labelStore";
import { useTaskStore } from "@/store/taskStore";
import { useThemeStore } from '@/store/themeStore';
import { Label } from "@/types/label.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
    const { theme } = useThemeStore();

    const { isLoading: labelsLoading, loadLabels: reloadLabels } = useLabelStore();
    const { isLoading: tasksLoading, loadTasks: reloadTasks } = useTaskStore();

    const [isLoading, setIsLoading] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [labelToEdit, setLabelToEdit] = useState<Label | null>(null);

    // Refresh Labels manually
    const handleRefresh = () => {
        setIsLoading(true);
        try {
            reloadTasks();
            reloadLabels();
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
        setLabelToEdit(item);
        setEditModalVisible(true);
    };

    // Loading state
    if (isLoading || labelsLoading || tasksLoading) {
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
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                {/* Labels List */}
                <LabelsList handleEditModal={handleEditModal} />

                {/* Edit/Update Label Modal */}
                <AppModal modalVisible={editModalVisible} setModalVisible={setEditModalVisible}>
                    {labelToEdit && (
                        <EditLabel
                            labelToEdit={labelToEdit}
                            handleModal={setEditModalVisible}
                        />
                    )}
                </AppModal>

                {/* Add Label Modal */}
                <AppModal modalVisible={addModalVisible} setModalVisible={setAddModalVisible}>
                    <AddLabel handleModal={setAddModalVisible} />
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
