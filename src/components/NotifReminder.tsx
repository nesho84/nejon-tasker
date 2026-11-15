import { useDeviceSettingsStore } from "@/store/deviceSettingsStore";
import { useLanguageStore } from "@/store/languageStore";
import { useModalStore } from "@/store/modalStore";
import { useNotifReminderStore } from "@/store/notifReminderStore";
import { useThemeStore } from "@/store/themeStore";
import { requestNotificationPermission } from "@/utils/system";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import { ComponentProps } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MCIcon = ComponentProps<typeof MaterialDesignIcons>["name"];

const DAY_MS = 24 * 60 * 60 * 1000;
// First wait after notifications are seen off (after onboarding, the update, or re-disabling)
const FIRST_REMIND_AFTER_DAYS = 3;
// Waits after closing the 1st and 2nd show; the 3rd show marks it done
const WAIT_AFTER_CLOSE_DAYS = [7, 14];
export const NOTIF_REMINDER_MAX_SHOWS = 3;

// ------------------------------------------------------------
// Open "Enable notifications" reminder modal
// ------------------------------------------------------------
export function openNotifReminderModal() {
    const {
        notifReminderNextShowAt,
        notifReminderShownCount,
        notifReminderDone,
        setNotifReminderNextShowAt,
        setNotifReminderShownCount,
        setNotifReminderDone,
    } = useNotifReminderStore.getState();

    // Granted — reset, so a later disable starts the cycle again
    if (useDeviceSettingsStore.getState().notificationPermission) {
        if (notifReminderNextShowAt !== null || notifReminderShownCount !== 0 || notifReminderDone) {
            setNotifReminderNextShowAt(null);
            setNotifReminderShownCount(0);
            setNotifReminderDone(false);
        }
        return;
    }
    // Another modal is open (e.g. "Update available") — yield, try next time
    if (useModalStore.getState().visible) {
        return;
    }
    // Shown 3 times — stopped for good (until granted and disabled again)
    if (notifReminderDone) {
        return;
    }
    // First seen with notifications off — let the user use the app first
    if (notifReminderNextShowAt === null) {
        setNotifReminderNextShowAt(Date.now() + FIRST_REMIND_AFTER_DAYS * DAY_MS);
        return;
    }
    // Still waiting
    if (Date.now() < notifReminderNextShowAt) {
        return;
    }

    showNotifReminderModal();
}

// ------------------------------------------------------------
// Show the reminder modal — no checks (the Debug Panel calls this directly)
// ------------------------------------------------------------
export function showNotifReminderModal() {
    const {
        notifReminderShownCount,
        setNotifReminderNextShowAt,
        setNotifReminderShownAt,
        setNotifReminderShownCount,
        setNotifReminderDone,
    } = useNotifReminderStore.getState();
    const tr = useLanguageStore.getState().tr;
    const theme = useThemeStore.getState().theme;
    const { hide } = useModalStore.getState();

    setNotifReminderShownAt(Date.now());
    setNotifReminderShownCount(notifReminderShownCount + 1);
    if (notifReminderShownCount + 1 >= NOTIF_REMINDER_MAX_SHOWS) {
        setNotifReminderDone(true);
    }

    // Both buttons count as a close — the 3rd show has no next wait, Done stops it
    const recordClose = () => {
        setNotifReminderNextShowAt(Date.now() + (WAIT_AFTER_CLOSE_DAYS[notifReminderShownCount] ?? 0) * DAY_MS);
    };

    const benefits: { icon: MCIcon; text: string }[] = [
        { icon: "clock-outline", text: tr.notifReminder.exactTime },
        { icon: "cellphone-lock", text: tr.notifReminder.appClosed },
        { icon: "gesture-tap", text: tr.notifReminder.openTask },
    ];

    useModalStore.getState().show({
        type: "alert",
        // Only the buttons close it — so every close records a choice
        dismissable: false,
        component: (
            <>
                {/* Bell + text + benefits */}
                <View style={styles.bannerContainer}>
                    <View style={[styles.modalIconCircle, { backgroundColor: theme.primary + "20" }]}>
                        <MaterialDesignIcons name="bell-ring-outline" size={40} color={theme.primary} />
                    </View>
                    <Text style={[styles.bannerTitle, { color: theme.text }]}>{tr.notifReminder.title}</Text>
                    <Text style={[styles.bannerMessage, { color: theme.muted }]}>{tr.notifReminder.message}</Text>

                    <View style={styles.benefits}>
                        {benefits.map(({ icon, text }) => (
                            <View key={icon} style={styles.benefitRow}>
                                <MaterialDesignIcons name={icon} size={20} color={theme.primary} />
                                <Text style={[styles.benefitText, { color: theme.text2 }]}>{text}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Buttons — outside bannerContainer, so the bottom space matches the other modals */}
                <View style={styles.buttons}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.primary + "20", borderWidth: 1, borderColor: theme.primary + "40" }]}
                        activeOpacity={0.8}
                        onPress={() => {
                            recordClose();
                            hide("enable");
                            // Asks for permission; if no system dialog is possible anymore, offers system settings
                            requestNotificationPermission(tr);
                        }}
                    >
                        <Text style={[styles.buttonText, { color: theme.primary }]}>{tr.buttons.enableNotifications}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { borderWidth: 1, borderColor: theme.border }]}
                        activeOpacity={0.6}
                        onPress={() => {
                            recordClose();
                            hide("notNow");
                        }}
                    >
                        <Text style={[styles.buttonText, { color: theme.placeholder }]}>{tr.buttons.notNow}</Text>
                    </TouchableOpacity>
                </View>
            </>
        ),
    });
}

const styles = StyleSheet.create({
    bannerContainer: {
        alignItems: "center",
        paddingVertical: 8,
        gap: 6,
    },
    bannerTitle: {
        fontSize: 19,
        fontWeight: "700",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 4,
    },
    bannerMessage: {
        fontSize: 15,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 8,
    },
    modalIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    benefits: {
        alignSelf: "stretch",
        gap: 12,
        marginTop: 4,
    },
    benefitRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    benefitText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 20,
    },
    buttons: {
        gap: 10,
    },
    button: {
        height: 50,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
    },
});
