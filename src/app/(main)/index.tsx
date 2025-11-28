import AppLoading from "@/components/AppLoading";
import AppModal from "@/components/AppModal";
import AppScreen from "@/components/AppScreen";
import AddLabel from "@/components/labels/AddLabel";
import EditLabel from "@/components/labels/EditLabel";
import LabelsList from "@/components/labels/LabelsList";
import { LanguageContext } from "@/context/LanguageContext";
import { TasksContext } from "@/context/TasksContext";
import { useContext, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import { useThemeStore } from '@/store/themeStore';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";

export default function HomeScreen() {
    const { theme } = useThemeStore();
    const { lang } = useContext(LanguageContext);

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

            {/* Add Label -> Navigation bar icon */}
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <>
                            {/* Add Label */}
                            <TouchableOpacity
                                style={{ top: 1, marginRight: 16 }}
                                onPress={() => setAddModalVisible(true)}>
                                <MaterialIcons name="add" size={28} color={theme.text} />
                            </TouchableOpacity>

                            {/* Refresh */}
                            <MaterialCommunityIcons
                                name="dots-vertical"
                                type="material-community"
                                color={theme.text}
                                size={28}
                                style={{ marginRight: -3 }}
                                onPress={() => { Alert.alert('warning', 'Not implemented!') }}
                            />
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
                    lang={lang}
                />

                {/* Add Label Modal */}
                <AppModal
                    modalVisible={addModalVisible}
                    setModalVisible={setAddModalVisible}
                >
                    <AddLabel
                        handleAddLabel={handleAddLabel}
                        lang={lang}
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
                        lang={lang}
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
