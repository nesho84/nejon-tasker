import { NOTIF_REMINDER_MAX_SHOWS, showNotifReminderModal } from "@/components/NotifReminder";
import { RATE_APP_MAX_SHOWS, showRateAppModal } from "@/components/RateApp";
import { useDeviceSettingsStore } from "@/store/deviceSettingsStore";
import { useNotifReminderStore } from "@/store/notifReminderStore";
import { useRateAppStore } from "@/store/rateAppStore";
import { Alert } from "react-native";
import { showJsonViewerModal } from "./debugUi";

// ------------------------------------------------------------
// Auto modals — the same three parts each: JSON, preview, reset.
// Previews count like a real show and skip the waits; a block gets an alert with Reset.
// ------------------------------------------------------------

// Timestamp → readable date for the JSON viewers
const formatTime = (time: number | null) => (time ? new Date(time).toLocaleString("en-GB") : null);

// ------------------------------------------------------------
// Rate App
// ------------------------------------------------------------
export function showRateAppJsonModal() {
    const { rateAppNextShowAt, rateAppShownAt, rateAppShownCount, rateAppDone } = useRateAppStore.getState();
    showJsonViewerModal("Rate App", {
        rateAppNextShowAt: formatTime(rateAppNextShowAt),
        rateAppShownAt: formatTime(rateAppShownAt),
        rateAppShownCount,
        rateAppDone,
    });
}

function resetRateApp() {
    useRateAppStore.setState({ rateAppNextShowAt: null, rateAppShownAt: null, rateAppShownCount: 0, rateAppDone: false });
}

export function previewRateAppModal() {
    const { rateAppShownCount, rateAppDone } = useRateAppStore.getState();

    if (rateAppDone) {
        const blockedReason = rateAppShownCount >= RATE_APP_MAX_SHOWS
            ? `Limit reached (${rateAppShownCount}/${RATE_APP_MAX_SHOWS}) — the real modal never shows again.`
            : `"Open Store" or "Already rated" was tapped — the real modal never shows again.`;
        Alert.alert("Rate App", blockedReason, [
            { text: "Cancel", style: "cancel" },
            { text: "Reset", onPress: resetRateApp },
        ]);
        return;
    }
    showRateAppModal();
}

// ------------------------------------------------------------
// Notif Reminder
// ------------------------------------------------------------
export function showNotifReminderJsonModal() {
    const { notifReminderNextShowAt, notifReminderShownAt, notifReminderShownCount, notifReminderDone } = useNotifReminderStore.getState();
    showJsonViewerModal("Notif Reminder", {
        notificationPermission: useDeviceSettingsStore.getState().notificationPermission,
        notifReminderNextShowAt: formatTime(notifReminderNextShowAt),
        notifReminderShownAt: formatTime(notifReminderShownAt),
        notifReminderShownCount,
        notifReminderDone,
    });
}

function resetNotifReminder() {
    useNotifReminderStore.setState({ notifReminderNextShowAt: null, notifReminderShownAt: null, notifReminderShownCount: 0, notifReminderDone: false });
}

export function previewNotifReminderModal() {
    const { notifReminderShownCount, notifReminderDone } = useNotifReminderStore.getState();

    if (notifReminderDone) {
        Alert.alert("Notif Reminder", `Limit reached (${notifReminderShownCount}/${NOTIF_REMINDER_MAX_SHOWS}) — the real reminder won't show again until notifications are granted and turned off again.`, [
            { text: "Cancel", style: "cancel" },
            { text: "Reset", onPress: resetNotifReminder },
        ]);
        return;
    }
    showNotifReminderModal();
}
