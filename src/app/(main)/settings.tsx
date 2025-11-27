import { useThemeStore } from '@/store/themeStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
    const { mode, theme, toggleTheme } = useThemeStore();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={{ color: theme.text }}>
                SettingsScreen

                <MaterialCommunityIcons
                    color={theme.lightSkyBlue}
                    type="FontAwesome5"
                    size={40}
                    name={
                        mode === "light" ? "toggle-switch-off" : "toggle-switch"
                    }
                    onPress={toggleTheme}
                />
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});