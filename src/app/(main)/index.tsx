import AppLoading from "@/components/AppLoading";
import AppModal from "@/components/AppModal";
import AppScreen from "@/components/AppScreen";
import AddLabel from "@/components/labels/AddLabel";
import EditLabel from "@/components/labels/EditLabel";
import { TasksContext } from "@/context/TasksContext";
import { useContext, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import LabelsList from "@/components/labels/LabelsList";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from '@/store/themeStore';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";

export default function HomeScreen() {
    const { theme } = useThemeStore();
    const { language, tr } = useLanguageStore();

    const {
        labels,
        isLoading,
        addLabel,
        editLabel,
        orderLabels,
    } = useContext(TasksContext);

    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [labelToEdit, setLabelToEdit] = useState(null);

    // Handle Add Label
    const handleAddLabel = (text: string, color: string) => {
        addLabel(text, color);
        setAddModalVisible(false);
    };

    // Open modal for editing Label
    const handleEditModal = (item: any) => {
        setLabelToEdit(item);
        setEditModalVisible(true);
    };

    // Handle Edit Label
    const handleEditLabel = (labelKey: string, input: string, color: string) => {
        editLabel(labelKey, input, color);
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

                            {/* Refresh */}
                            <TouchableOpacity
                                style={{ top: 1, marginRight: -3 }}
                                onPress={() => { Alert.alert('warning', 'Not implemented!') }}
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
                    orderLabels={orderLabels}
                    handleEditModal={handleEditModal}
                />

                {/* Add Label Modal */}
                <AppModal
                    modalVisible={addModalVisible}
                    setModalVisible={setAddModalVisible}
                >
                    <AddLabel
                        handleAddLabel={handleAddLabel}
                    />
                </AppModal>

                {/* Edit Label Modal */}
                <AppModal
                    modalVisible={editModalVisible}
                    setModalVisible={setEditModalVisible}
                >
                    <EditLabel
                        labelToEdit={labelToEdit}
                        handleEditLabel={handleEditLabel}
                    />
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
