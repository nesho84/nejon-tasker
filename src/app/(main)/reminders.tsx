import { ThemeContext } from "@/context/ThemeContext";
import { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ReimndersScreen() {
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
                ReimndersScreen
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