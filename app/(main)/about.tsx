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

    // ------------------------------------------------------------
    // Open external link
    // ------------------------------------------------------------
    const openLink = (url: string) => {
        Linking.canOpenURL(url).then((supported) => {
            if (supported) {
                Linking.openURL(url);
            }
        });
    };

    return (
        <ScrollView
            style={[styles.scrollContainer, { backgroundColor: theme.backgroundAlt, marginTop: -insets.top }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >

            {/* Logo */}
            <Image style={styles.logo} source={require("../../assets/icons/icon.png")} />

            {/* Title */}
            <Text style={[styles.title, { color: theme.textMuted }]}>{Constants?.expoConfig?.name}</Text>

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

            {/* Website & Privacy */}
            <View style={styles.linksContainer}>
                <TouchableOpacity onPress={() => openLink("https://nejon.net")}>
                    <Text style={[styles.linkText, { color: theme.info }]}>nejon.net</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openLink("https://nejon-tasker.nejon.net/privacy.html")}>
                    <Text style={[styles.linkText, { color: theme.info }]}>Privacy Policy</Text>
                </TouchableOpacity>
            </View>

            {/* Year */}
            <Text style={[styles.yearText, { color: theme.text }]}>
                © {date.getFullYear()}
            </Text>

            {/* Version */}
            <Text style={[styles.versionText, { color: theme.lightMuted }]}>
                Version {Constants?.expoConfig?.version}
            </Text>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24,
        gap: 12,
    },

    logo: {
        width: 120,
        height: 120,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        letterSpacing: -0.5,
    },

    // Support Button
    supportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderRadius: 16,
        marginVertical: 16,
        gap: 16,
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

    // Footer Section
    linksContainer: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 16,
    },
    linkText: {
        fontSize: 16,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
    yearText: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 4,
    },
    versionText: {
        fontSize: 14,
        fontWeight: "400",
    },
});