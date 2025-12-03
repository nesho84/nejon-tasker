import AppLoading from "@/components/AppLoading";
import AppModal from "@/components/AppModal";
import AppScreen from "@/components/AppScreen";
import AddLabel from "@/components/labels/AddLabel";
import EditLabel from "@/components/labels/EditLabel";
import LabelsList from "@/components/labels/LabelsList";
import { useLabels } from "@/hooks/useLabels";
import { useTasks } from "@/hooks/useTasks";
import { useThemeStore } from '@/store/themeStore';
import { Label } from "@/types/label.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
    const { theme } = useThemeStore();
    const isFocused = useIsFocused();

    const {
        labels,
        reloadLabels,
        createLabel,
        updateLabel,
        reorderLabels
    } = useLabels();

    const { tasks, reloadTasks } = useTasks();

    const [isLoading, setIsLoading] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [labelToEdit, setLabelToEdit] = useState<Label | null>(null);

    // Reload on Screen focus
    useEffect(() => {
        if (isFocused) {
            reloadTasks();
            reloadLabels();
        }
    }, [isFocused, reloadLabels, reloadTasks]);

    // Refresh Labels manually
    const handleRefresh = () => {
        setIsLoading(true);
        try {
            reloadTasks();
            reloadLabels();
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Add Label
    const handleAddLabel = (title: string, color: string) => {
        createLabel({ title, color });
        setAddModalVisible(false);
    };

    // Open modal for editing Label
    const handleEditModal = (item: Label) => {
        setLabelToEdit(item);
        setEditModalVisible(true);
    };

    // Handle Edit Label
    const handleUpdateLabel = (id: string, title: string, color: string) => {
        updateLabel(id, { title, color });
        setEditModalVisible(false);
    };

    // Show a loading spinner
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

            <View style={[styles.container, { backgroundColor: theme.background }]}>
                {/* Labels List */}
                <LabelsList
                    labels={labels}
                    tasks={tasks}
                    orderLabels={(labelIds) => reorderLabels(labelIds)}
                    handleEditModal={handleEditModal}
                />

                {/* Add Label Modal */}
                <AppModal
                    modalVisible={addModalVisible}
                    setModalVisible={setAddModalVisible}
                >
                    <AddLabel handleAddLabel={handleAddLabel} />
                </AppModal>

                {/* Edit Label Modal */}
                <AppModal
                    modalVisible={editModalVisible}
                    setModalVisible={setEditModalVisible}
                >
                    {labelToEdit && (
                        <EditLabel
                            labelToEdit={labelToEdit}
                            handleUpdateLabel={handleUpdateLabel}
                        />
                    )}
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
