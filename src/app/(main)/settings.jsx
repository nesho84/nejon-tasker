import { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeContext } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
    const { theme, changeTheme } = useContext(ThemeContext);

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.themes.settingsScreen.container[theme.current],
                },
            ]}
        >
            <Text style={{ color: theme.themes.settingsScreen.textColor[theme.current] }}>
                SettingsScreen

                <MaterialCommunityIcons
                    color={theme.themes.settingsScreen.switchColor[theme.current]}
                    type="FontAwesome5"
                    size={40}
                    name={
                        theme.current === "light" ? "toggle-switch-off" : "toggle-switch"
                    }
                    onPress={changeTheme}
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