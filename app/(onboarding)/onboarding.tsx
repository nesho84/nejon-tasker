import { useOnboardingStore } from '@/store/onboardingStore';
import { useThemeStore } from '@/store/themeStore';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function OnboardingScreen() {
    const { setOnboarding } = useOnboardingStore();
    const { theme } = useThemeStore();

    return (
        <ScrollView
            style={[styles.scrollContainer, { backgroundColor: theme.bgAlt }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.text }]}>Welcome!</Text>
                <Text style={[styles.subtitle, { color: theme.muted }]}>Let's get you started</Text>
                <Button title="Get Started" onPress={() => setOnboarding(true)} />
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
        paddingTop: 12,
        paddingBottom: 24,
    },

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30
    },
});