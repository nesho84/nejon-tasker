import { BackupSection } from "@/components/BackupSection";
import CustomPicker from "@/components/CustomPicker";
import { DARK, LIGHT } from "@/constants/colors";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export type Language = "en" | "de" | "al";

export default function SettingsScreen() {
    const { theme, mode, toggleTheme } = useThemeStore();
    const { language, tr, setLanguage } = useLanguageStore();

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
        setLanguage(lang);
    };

    return (
        <ScrollView
            style={[styles.scrollContainer, { backgroundColor: theme.bgAlt }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >

            {/* Theme */}
            <View style={[styles.menu, { borderColor: theme.divider }]}>
                <Text style={[styles.title, { color: theme.primaryAlt }]}>
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
                            color={mode === "light" ? LIGHT.border : DARK.disabled}
                            size={46}
                            name={mode === "light" ? "toggle-switch-off" : "toggle-switch"}
                            onPress={handleTheme}
                        />
                    </View>
                </View>
            </View>

            {/* Language */}
            <View style={[styles.menu, { borderColor: theme.divider }]}>
                <Text style={[styles.title, { color: theme.primaryAlt }]}>
                    {tr.labels.language}
                </Text>
                <CustomPicker
                    style={styles.languagePicker}
                    items={[
                        { label: 'English', value: 'en' },
                        { label: 'Deutsch', value: 'de' },
                        { label: 'Shqip', value: 'al' },
                    ]}
                    selectedValue={language}
                    onValueChange={(value) => handleLanguage(value as Language)}
                    textColor={theme.muted}
                    iconColor={theme.border}
                    backgroundColor={theme.surface}
                    modalBackgroundColor={theme.surface}
                    borderColor={theme.border}
                />
            </View>

            {/* Backup Section */}
            <View style={[styles.menu, { borderColor: theme.divider }]}>
                <Text style={[styles.title, { color: theme.primaryAlt }]}>
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
    actionContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    action: {
        fontSize: 17,
    },
    themeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    languagePicker: {
        marginVertical: 15,
    },
});