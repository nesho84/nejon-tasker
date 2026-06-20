import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { Image, Linking, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const CONTACT_EMAIL = 'mailto:support@nejon.net';
const HELP_EMAIL = 'mailto:help@nejon.net';

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.nejon.nejontasker';
const MORE_APPS_GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/developer?id=Neshat%20Ademi';

export default function AboutScreen() {
    // Stores
    const theme = useThemeStore((state) => state.theme);
    const tr = useLanguageStore((state) => state.tr);

    // Safe area insets
    const insets = useSafeAreaInsets();
    const topInset = 8;
    const bottomInset = insets.bottom + 8;

    // ------------------------------------------------------------
    // Open app info/settings
    // ------------------------------------------------------------
    const openAppInfo = () => {
        Linking.openSettings();
    };

    // ------------------------------------------------------------
    // Share the App
    // ------------------------------------------------------------
    const handleShare = async () => {
        const appName = Constants?.expoConfig?.name ?? 'Nejon Prayer';
        try {
            await Share.share(
                {
                    title: appName,
                    message: `${appName}\n\n${GOOGLE_PLAY_URL}`,
                },
                {
                    dialogTitle: tr.labels.shareApp,
                    subject: appName,
                }
            );
        } catch (err) {
            console.error('Share failed:', err);
        }
    };

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
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.bgAlt }]}
            edges={['left', 'right']}
        >
            <ScrollView
                style={[styles.scrollContainer, { backgroundColor: theme.bgAlt }]}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: topInset, paddingBottom: bottomInset }
                ]}
                showsVerticalScrollIndicator={false}
            >

                {/* Top Navigation bar */}
                <Stack.Screen
                    options={{
                        title: tr.labels.about,
                        headerRight: () => (
                            <TouchableOpacity onPress={openAppInfo} style={styles.infoIcon} activeOpacity={0.3}>
                                <MaterialCommunityIcons name="information-outline" size={22} color={theme.text} />
                            </TouchableOpacity>
                        ),
                    }}
                />

                {/* Logo */}
                <Image style={styles.logo} source={require("../../../assets/icons/icon.png")} />

                {/* Title */}
                <Text style={[styles.title, { color: theme.text }]}>{Constants?.expoConfig?.name}</Text>

                {/* Version */}
                <Text style={[styles.versionText, { color: theme.placeholder }]}>
                    Version {Constants?.expoConfig?.version}
                </Text>

                {/* Description */}
                <Text style={[styles.desc, { color: theme.placeholder }]} adjustsFontSizeToFit>
                    {tr.about.desc}
                </Text>

                {/* Action buttons */}
                <View style={styles.actionButtonsGroup}>
                    {/* Support Button */}
                    <TouchableOpacity
                        style={[styles.actionButton, {
                            backgroundColor: theme.primary + '08',
                            borderColor: theme.primary + '20'
                        }]}
                        onPress={() => Linking.openURL('https://paypal.me/NeshatAdemi?locale.x=de_DE&country.x=AT')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                            <MaterialCommunityIcons name="heart-outline" size={22} color={theme.danger} />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={[styles.actiontTitle, { color: theme.muted }]}>{tr.labels.supportDev}</Text>
                            <Text style={[styles.actionSubtitle, { color: theme.primary }]}>via PayPal</Text>
                        </View>
                        <MaterialCommunityIcons name="open-in-new" size={18} color={theme.primary} style={{ opacity: 0.5 }} />
                    </TouchableOpacity>

                    {/* Rate the App */}
                    <TouchableOpacity
                        style={[styles.actionButton, {
                            backgroundColor: theme.primary + '08',
                            borderColor: theme.primary + '20'
                        }]}
                        onPress={() => openLink(GOOGLE_PLAY_URL)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                            <MaterialCommunityIcons name="star-outline" size={22} color={theme.primary} />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={[styles.actiontTitle, { color: theme.muted }]}>{tr.labels.rateApp}</Text>
                            <Text style={[styles.actionSubtitle, { color: theme.primary }]} numberOfLines={1}>{tr.labels.rateAppDesc}</Text>
                        </View>
                        <MaterialCommunityIcons name="open-in-new" size={18} color={theme.primary} style={{ opacity: 0.5 }} />
                    </TouchableOpacity>

                    {/* Share with a Friend */}
                    <TouchableOpacity
                        style={[styles.actionButton, {
                            backgroundColor: theme.primary + '08',
                            borderColor: theme.primary + '20'
                        }]}
                        onPress={handleShare}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                            <MaterialCommunityIcons name="share-outline" size={22} color={theme.primary} />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={[styles.actiontTitle, { color: theme.muted }]}>{tr.labels.shareApp}</Text>
                            <Text style={[styles.actionSubtitle, { color: theme.primary }]}>{tr.labels.shareAppDesc}</Text>
                        </View>
                        <MaterialCommunityIcons name="open-in-new" size={18} color={theme.primary} style={{ opacity: 0.5 }} />
                    </TouchableOpacity>

                    {/* Contact Us */}
                    <TouchableOpacity
                        style={[styles.actionButton, {
                            backgroundColor: theme.primary + '08',
                            borderColor: theme.primary + '20'
                        }]}
                        onPress={() => Linking.openURL(CONTACT_EMAIL)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                            <MaterialCommunityIcons name="email-outline" size={22} color={theme.primary} />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={[styles.actiontTitle, { color: theme.muted }]}>{tr.labels.contactUs}</Text>
                            <Text style={[styles.actionSubtitle, { color: theme.primary }]}>{tr.labels.contactUsDesc}</Text>
                        </View>
                        <MaterialCommunityIcons name="open-in-new" size={18} color={theme.primary} style={{ opacity: 0.5 }} />
                    </TouchableOpacity>

                    {/* More Apps */}
                    <TouchableOpacity
                        style={[styles.actionButton, {
                            backgroundColor: theme.primary + '08',
                            borderColor: theme.primary + '20'
                        }]}
                        onPress={() => openLink(MORE_APPS_GOOGLE_PLAY_URL)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                            <MaterialCommunityIcons name="view-grid-outline" size={22} color={theme.primary} />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={[styles.actiontTitle, { color: theme.muted }]}>{tr.labels.moreApps}</Text>
                            <Text style={[styles.actionSubtitle, { color: theme.primary }]}>{tr.labels.moreAppsDesc}</Text>
                        </View>
                        <MaterialCommunityIcons name="open-in-new" size={18} color={theme.primary} style={{ opacity: 0.5 }} />
                    </TouchableOpacity>
                </View>

                {/* Website & Privacy */}
                <View style={styles.linksContainer}>
                    <TouchableOpacity onPress={() => openLink("https://nejon-tasker.nejon.net/privacy.html")}>
                        <Text style={[styles.linkText, { color: theme.info }]}>Privacy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL(HELP_EMAIL)} activeOpacity={0.6}>
                        <Text style={[styles.linkText, { color: theme.info }]}>Help</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openLink("https://nejon.net")}>
                        <Text style={[styles.linkText, { color: theme.info }]}>nejon.net</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Native Header
    infoIcon: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    container: {
        flex: 1,
    },

    // ScrollView content
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24,
        gap: 12,
    },

    logo: {
        width: 120,
        height: 120,
        alignSelf: "center",
        marginTop: 24,
        borderRadius: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
    },
    versionText: {
        fontSize: 14,
        fontWeight: "400",
        textAlign: "center",
        marginTop: -6,
    },
    desc: {
        fontSize: 15,
        fontWeight: "400",
        textAlign: "center",
        lineHeight: 22,
        marginVertical: 8,
        paddingHorizontal: 10,
    },

    // Action Buttons
    actionButtonsGroup: {
        marginHorizontal: 14,
        overflow: "hidden",
        gap: 8,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 14,
        paddingRight: 18,
        paddingVertical: 13,
        borderWidth: 1,
        borderRadius: 16,
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionTextContainer: {
        flex: 1,
        gap: 3,
    },
    actiontTitle: {
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: -0.3,
    },
    actionSubtitle: {
        fontSize: 14,
        fontWeight: "400",
        opacity: 0.6,
    },

    // Links
    linksContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 32,
        marginBottom: 24,
        gap: 28,
    },
    linkText: {
        fontSize: 14,
        fontWeight: "700",
        opacity: 0.7,
        textDecorationLine: "underline",
    },
});