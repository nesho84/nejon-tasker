import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { StyleSheet, Text, View } from 'react-native';

export default function RemindersScreen() {
    const { theme } = useThemeStore();
    const { tr } = useLanguageStore();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            <Text style={{ color: theme.text }}>
                {tr.labels.reminders}
            </Text>

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