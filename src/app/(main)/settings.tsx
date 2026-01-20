import { BackupSection } from "@/components/BackupSection";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export type Language = "en" | "de" | "al";

export default function SettingsScreen() {
    const { theme, mode, toggleTheme } = useThemeStore();
    const { language, tr, setLanguage } = useLanguageStore();

    // Local State
    const [selectedLanguage, setSelectedLanguage] = useState<Language | string>(language);

    // ------------------------------------------------------------
    // Handle Theme Toggle
    // ------------------------------------------------------------
    const handleTheme = () => {
        toggleTheme();
    }

    // ------------------------------------------------------------
    // Handle Language Change
    // ------------------------------------------------------------
    const handleLanguage = (lang: Language) => {
        setSelectedLanguage(lang);
        setLanguage(lang);
    };

    return (
        <ScrollView
            style={[styles.scrollContainer, { backgroundColor: theme.backgroundAlt }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >

            {/* Theme */}
            <View style={[styles.menu, { borderColor: theme.border }]}>
                <Text style={[styles.title, { color: theme.lightDodgerBlue }]}>
                    {tr.settings.displayOptions}
                </Text>
                <View style={styles.actionContainer}>
                    <Text style={[styles.action, { color: theme.muted }]}>
                        Theme
                    </Text>
                    <View style={styles.themeContainer}>
                        <Text style={{ color: theme.muted }}>
                            {mode === "light" ? "Light" : "Dark"}
                        </Text>
                        <MaterialCommunityIcons
                            color={theme.lightDodgerBlue}
                            type="FontAwesome5"
                            size={44}
                            name={mode === "light" ? "toggle-switch-off" : "toggle-switch"}
                            onPress={handleTheme}
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

            {/* Backup Section */}
            <View style={[styles.menu, { borderColor: theme.border }]}>
                <Text style={[styles.title, { color: theme.lightDodgerBlue }]}>
                    Backup
                </Text>
                <BackupSection />
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 25,
        paddingBottom: 24,
        gap: 16,
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
    themeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
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