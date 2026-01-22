// About screen in the "Nejon Tasker" app
import { useThemeStore } from '@/store/themeStore';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from 'expo-constants';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AboutScreen() {
    const { theme } = useThemeStore();
    const insets = useSafeAreaInsets();

    const date = new Date();

    return (
        <ScrollView
            style={[styles.scrollContainer, { backgroundColor: theme.backgroundAlt }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={[styles.container, { marginTop: -insets.top }]}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image style={styles.logo} source={require("../../assets/icons/icon.png")} />
                </View>

                {/* App Info Section */}
                <View style={styles.infoSection}>
                    <Text style={[styles.title, { color: theme.textMuted }]}>{Constants?.expoConfig?.name}</Text>
                    <Text style={[styles.versionText, { color: theme.lightMuted }]}>Version {Constants?.expoConfig?.version}</Text>
                </View>

                {/* Support Section */}
                <TouchableOpacity
                    style={[styles.supportButton, {
                        backgroundColor: theme.link + '08',
                        borderColor: theme.link + '20'
                    }]}
                    onPress={() => Linking.openURL('https://paypal.me/NeshatAdemi?locale.x=de_DE&country.x=AT')}
                    activeOpacity={0.8}
                >
                    <View style={[styles.iconContainer, { backgroundColor: theme.link + '15' }]}>
                        <MaterialCommunityIcons name="heart-outline" size={22} color={theme.danger} />
                    </View>
                    <View style={styles.supportTextContainer}>
                        <Text style={[styles.supportTitle, { color: theme.textMuted }]}>Support Development</Text>
                        <Text style={[styles.supportSubtitle, { color: theme.link }]}>via PayPal</Text>
                    </View>
                    <MaterialCommunityIcons name="open-in-new" size={18} color={theme.link} style={{ opacity: 0.5 }} />
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.footerSection}>
                    <TouchableOpacity onPress={async () => await Linking.openURL("https://nejon.net")}>
                        <Text style={[styles.copyright, { color: theme.lightMuted }]}>
                            © {date.getFullYear()} <Text style={[styles.link, { color: theme.link }]}>nejon.net</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
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
        alignItems: "center",
        justifyContent: "center",
    },

    // Logo Section
    logoContainer: {
        marginBottom: 18,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 28,
    },

    // Info Section
    infoSection: {
        alignItems: "center",
        marginBottom: 35,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    versionText: {
        fontSize: 15,
        fontWeight: "400",
        opacity: 0.5,
    },

    // Support Button
    supportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderRadius: 16,
        gap: 16,
        width: '100%',
        maxWidth: 400,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    supportTextContainer: {
        flex: 1,
        gap: 3,
    },
    supportTitle: {
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: -0.3,
    },
    supportSubtitle: {
        fontSize: 14,
        fontWeight: "400",
        opacity: 0.6,
    },

    // Footer
    footerSection: {
        marginTop: 25,
        alignItems: "center",
    },
    copyright: {
        fontSize: 13,
        fontWeight: "400",
        opacity: 0.5,
    },
    link: {
        fontSize: 13,
        fontWeight: "500",
    },
});