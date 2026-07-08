import { GOOGLE_PLAY_URL, MORE_APPS_GOOGLE_PLAY_URL } from '@/constants/links';
import { globalStyles } from '@/constants/styles';
import { useDebugStore } from '@/debug/debugStore';
import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Image, Linking, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const CONTACT_EMAIL = 'mailto:support@nejon.net';
const HELP_EMAIL = 'mailto:help@nejon.net';

const DEBUG_MODE_TAP_THRESHOLD = 5;
const DEBUG_MODE_TAP_HINT_START = 3;

export default function AboutScreen() {
    // Stores
    const theme = useThemeStore((state) => state.theme);
    const tr = useLanguageStore((state) => state.tr);
    const debugModeEnabled = useDebugStore((state) => state.debugModeEnabled);
    const toggleDebugMode = useDebugStore((state) => state.toggleDebugMode);

    // Safe area insets
    const insets = useSafeAreaInsets();
    const topInset = 8;
    const bottomInset = insets.bottom + 8;

    // Local state
    const [tapCount, setTapCount] = useState(0);

    // ------------------------------------------------------------
    // Open app info/settings
    // ------------------------------------------------------------
    const openAppInfo = () => {
        Linking.openSettings();
    };

    // ------------------------------------------------------------
    // Tap the version number N times to toggle debug mode
    // ------------------------------------------------------------
    const handleVersionTap = () => {
        const nextCount = tapCount + 1;
        if (nextCount >= DEBUG_MODE_TAP_THRESHOLD) {
            setTapCount(0);
            toggleDebugMode();
        } else {
            setTapCount(nextCount);
        }
    };

    // ------------------------------------------------------------
    // Share the App
    // ------------------------------------------------------------
    const handleShare = async () => {
        const appName = Constants?.expoConfig?.name ?? 'Nejon Tasker';
        try {
            await Share.share(
                {
                    title: appName,
                    message: `${appName}\n\n${GOOGLE_PLAY_URL}`,
                },
                {
                    dialogTitle: tr.about.shareApp,
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
            style={[globalStyles.container, { backgroundColor: theme.bgAlt }]}
            edges={['left', 'right']}
        >
            <ScrollView
                style={[globalStyles.container, { backgroundColor: theme.bgAlt }]}
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
                                <MaterialDesignIcons name="information-outline" size={22} color={theme.text} />
                            </TouchableOpacity>
                        ),
                    }}
                />

                {/* Logo */}
                <Image style={styles.logo} source={require("../../../assets/icons/icon.png")} />

                {/* Title */}
                <Text style={[styles.title, { color: theme.text }]}>{Constants?.expoConfig?.name}</Text>

                {/* Version (5 times Press activates debug mode) */}
                <TouchableOpacity style={styles.versionButton} onPress={handleVersionTap} activeOpacity={0.6}>
                    <Text style={[styles.versionText, { color: theme.placeholder }]}>
                        Version {Constants?.expoConfig?.version}
                    </Text>
                </TouchableOpacity>

                {/* Debug-mode hint */}
                {tapCount >= DEBUG_MODE_TAP_HINT_START && (
                    <View style={[styles.debugBadge, { borderColor: 'transparent' }]}>
                        <Text style={[styles.debugBadgeText, { color: theme.placeholder }]}>
                            Tap {DEBUG_MODE_TAP_THRESHOLD - tapCount} more time{DEBUG_MODE_TAP_THRESHOLD - tapCount === 1 ? "" : "s"} to {debugModeEnabled ? "deactivate" : "activate"} debug mode.
                        </Text>
                    </View>
                )}
                {/* Debug-mode status badge */}
                {tapCount < DEBUG_MODE_TAP_HINT_START && debugModeEnabled && (
                    <View style={[styles.debugBadge, { borderColor: theme.danger }]}>
                        <Text style={[styles.debugBadgeText, { color: theme.placeholder }]}>
                            Debug mode activated. Tap {DEBUG_MODE_TAP_THRESHOLD} times to deactivate.
                        </Text>
                    </View>
                )}

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
                        <View style={[globalStyles.rowIcon, { backgroundColor: theme.primary + '15' }]}>
                            <MaterialDesignIcons name="heart-outline" size={22} color={theme.danger} />
                        </View>
                        <View style={globalStyles.rowText}>
                            <Text style={[globalStyles.rowTitle, { color: theme.muted }]}>{tr.about.supportDev}</Text>
                            <Text style={[styles.actionSubtitle, { color: theme.primary }]}>via PayPal</Text>
                        </View>
                        <MaterialDesignIcons name="open-in-new" size={18} color={theme.primary} style={{ opacity: 0.5 }} />
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
                        <View style={[globalStyles.rowIcon, { backgroundColor: theme.primary + '15' }]}>
                            <MaterialDesignIcons name="star-outline" size={22} color={theme.primary} />
                        </View>
                        <View style={globalStyles.rowText}>
                            <Text style={[globalStyles.rowTitle, { color: theme.muted }]}>{tr.about.rateApp}</Text>
                            <Text style={[styles.actionSubtitle, { color: theme.primary }]} numberOfLines={1}>{tr.about.rateAppDesc}</Text>
                        </View>
                        <MaterialDesignIcons name="open-in-new" size={18} color={theme.primary} style={{ opacity: 0.5 }} />
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
                        <View style={[globalStyles.rowIcon, { backgroundColor: theme.primary + '15' }]}>
                            <MaterialDesignIcons name="share-outline" size={22} color={theme.primary} />
                        </View>
                        <View style={globalStyles.rowText}>
                            <Text style={[globalStyles.rowTitle, { color: theme.muted }]}>{tr.about.shareApp}</Text>
                            <Text style={[styles.actionSubtitle, { color: theme.primary }]}>{tr.about.shareAppDesc}</Text>
                        </View>
                        <MaterialDesignIcons name="open-in-new" size={18} color={theme.primary} style={{ opacity: 0.5 }} />
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
                        <View style={[globalStyles.rowIcon, { backgroundColor: theme.primary + '15' }]}>
                            <MaterialDesignIcons name="email-outline" size={22} color={theme.primary} />
                        </View>
                        <View style={globalStyles.rowText}>
                            <Text style={[globalStyles.rowTitle, { color: theme.muted }]}>{tr.about.contactUs}</Text>
                            <Text style={[styles.actionSubtitle, { color: theme.primary }]}>{tr.about.contactUsDesc}</Text>
                        </View>
                        <MaterialDesignIcons name="open-in-new" size={18} color={theme.primary} style={{ opacity: 0.5 }} />
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
                        <View style={[globalStyles.rowIcon, { backgroundColor: theme.primary + '15' }]}>
                            <MaterialDesignIcons name="view-grid-outline" size={22} color={theme.primary} />
                        </View>
                        <View style={globalStyles.rowText}>
                            <Text style={[globalStyles.rowTitle, { color: theme.muted }]}>{tr.about.moreApps}</Text>
                            <Text style={[styles.actionSubtitle, { color: theme.primary }]}>{tr.about.moreAppsDesc}</Text>
                        </View>
                        <MaterialDesignIcons name="open-in-new" size={18} color={theme.primary} style={{ opacity: 0.5 }} />
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
        paddingHorizontal: 4,
        paddingVertical: 4,
    },

    // ScrollView content
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingTop: 12,
        paddingBottom: 24,
        paddingHorizontal: 6,
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
    versionButton: {
        alignSelf: "center",
        marginTop: -6,
    },
    versionText: {
        fontSize: 14,
        fontWeight: "400",
        textAlign: "center",
    },
    debugBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        borderWidth: 1,
        borderRadius: 20,
        // marginTop: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 6,
    },
    debugBadgeText: {
        fontSize: 12,
        fontWeight: "500",
        includeFontPadding: false,
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
