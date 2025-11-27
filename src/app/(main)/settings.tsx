import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
    const { mode, theme, toggleTheme } = useThemeStore();
    const { language, tr, setLanguage } = useLanguageStore();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            <Text style={{ color: theme.text }}>SettingsScreen</Text>
            <MaterialCommunityIcons
                color={theme.lightSkyBlue}
                type="FontAwesome5"
                size={40}
                name={mode === "light" ? "toggle-switch-off" : "toggle-switch"}
                onPress={toggleTheme}
            />

            <View>
                <Text style={{ color: theme.text }}>{tr.labels.home}</Text>
                <Text style={{ color: theme.text }}>Selected: {language.toUpperCase()}</Text>
                <Button title={tr.buttons.edit} onPress={() => setLanguage("al")} />
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});