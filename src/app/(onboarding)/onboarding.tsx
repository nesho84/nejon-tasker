import { useOnboardingStore } from '@/store/onboardingStore';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function OnboardingScreen() {
    const { setOnboarding } = useOnboardingStore();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>Let's get you started</Text>
            <Button title="Get Started" onPress={() => setOnboarding(true)} />
        </View>
    );
}

const styles = StyleSheet.create({
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
        color: '#666',
        marginBottom: 30
    },
});