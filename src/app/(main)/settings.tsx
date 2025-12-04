import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

export type Language = "en" | "de" | "al";

export default function SettingsScreen() {
    const { labels } = useLabelStore();
    const { theme, mode, toggleTheme } = useThemeStore();
    const { language, tr, setLanguage } = useLanguageStore();

    const [selectedLanguage, setSelectedLanguage] = useState<Language | string>(language);

    const handleLanguage = (lang: Language) => {
        setSelectedLanguage(lang);
        setLanguage(lang);
    };

    const handleDeleteAll = () => {
        if (labels === null) {
            Alert.alert(
                "",
                tr.messages.nothingToDelete,
                [{ text: "OK", onPress: () => { } },
                ],
                { cancelable: false }
            );
            return;
        } else {
            Alert.alert(
                tr.alerts.deleteAll.title,
                tr.alerts.deleteAll.message,
                [
                    {
                        text: tr.buttons.yes,
                        onPress: () => {
                            // clearStorage();
                            router.back();
                        },
                    },
                    { text: tr.buttons.no },
                ],
                { cancelable: false }
            );
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Theme */}
            <View style={[styles.menu, { borderColor: theme.border }]}>
                <Text style={[styles.title, { color: theme.lightDodgerBlue }]}>
                    {tr.settings.displayOptions}
                </Text>
                <View style={styles.actionContainer}>
                    <Text style={[styles.action, { color: theme.muted }]}>
                        Theme
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Text style={{ color: theme.muted }}>
                            {mode === "light" ? "Light" : "Dark"}
                        </Text>
                        <MaterialCommunityIcons
                            color={theme.lightDodgerBlue}
                            type="FontAwesome5"
                            size={40}
                            name={mode === "light" ? "toggle-switch-off" : "toggle-switch"}
                            onPress={toggleTheme}
                        />
                    </View>
                </View>
            </View>

            {/* Language */}
            <View style={[styles.menu, { borderColor: theme.border }]}>
                <Text style={[styles.title, { color: theme.lightDodgerBlue }]}>
                    {tr.labels.language}
                </Text>
                <Picker
                    style={[styles.languagePicker, { color: theme.muted }]}
                    dropdownIconColor={theme.muted}
                    selectedValue={selectedLanguage}
                    onValueChange={(itemValue, itemIndex) => handleLanguage(itemValue as Language)}
                >
                    <Picker.Item label="English" value="en" />
                    <Picker.Item label="Deutsch" value="de" />
                    <Picker.Item label="Shqip" value="al" />
                </Picker>
            </View>

            {/* Delete All */}
            <View style={[styles.menu, { borderColor: theme.border }]}>
                <Text style={[styles.title, { color: theme.lightDodgerBlue }]}>
                    {tr.labels.tasks}
                </Text>
                <View style={styles.actionContainer}>
                    <Text style={[styles.action, { color: theme.muted }]}>
                        {tr.settings.clearStorage}
                    </Text>
                    <Button
                        color={theme.danger}
                        title={tr.buttons.delete}
                        onPress={handleDeleteAll}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 25,
        paddingHorizontal: 16,
    },
    menu: {
        paddingBottom: 15,
        marginBottom: 15,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 15,
        paddingBottom: 10,
    },
    actionContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    action: {
        fontSize: 17,
    },
    languagePicker: {
        marginLeft: -8,
    },
    deleteButton: {
        fontSize: 10,
    },
});