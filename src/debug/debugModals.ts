import { showNotifReminderModal } from "@/components/NotifReminderModal";
import { showStoreReviewModal } from "@/components/StoreReviewModal";
import { showStoreUpdateModal } from "@/components/StoreUpdateModal";
import { NOTIF_REMINDER_MAX_SHOWS, STORE_REVIEW_MAX_SHOWS, useAutoModalsStore } from "@/store/autoModalsStore";
import { useDeviceSettingsStore } from "@/store/deviceSettingsStore";
import { Alert } from "react-native";
import { showJsonViewerModal } from "./debugUi";

// ------------------------------------------------------------
// Auto modals — one JSON for their shared store, a preview + reset each.
// Previews count like a real show and skip the waits; a block gets an alert with Reset
// (for Store Update, which never stops, the 3-day wait is the block).
// ------------------------------------------------------------

// Timestamp → readable date for the JSON viewers
const formatTime = (time: number | null) => (time ? new Date(time).toLocaleString("en-GB") : null);

// ------------------------------------------------------------
// Auto modals — one JSON for the whole store, in launch order
// ------------------------------------------------------------
export function showAutoModalsJsonModal() {
    const state = useAutoModalsStore.getState();
    showJsonViewerModal("Auto Modals", {
        storeUpdateNextShowAt: formatTime(state.storeUpdateNextShowAt),
        storeUpdateShownAt: formatTime(state.storeUpdateShownAt),
        storeUpdateShownCount: state.storeUpdateShownCount,
        storeUpdateCheckedAt: formatTime(state.storeUpdateCheckedAt),
        storeUpdateCheckResult: state.storeUpdateCheckResult,
        notificationPermission: useDeviceSettingsStore.getState().notificationPermission,
        notifReminderNextShowAt: formatTime(state.notifReminderNextShowAt),
        notifReminderShownAt: formatTime(state.notifReminderShownAt),
        notifReminderShownCount: state.notifReminderShownCount,
        notifReminderDone: state.notifReminderDone,
        storeReviewNextShowAt: formatTime(state.storeReviewNextShowAt),
        storeReviewShownAt: formatTime(state.storeReviewShownAt),
        storeReviewShownCount: state.storeReviewShownCount,
        storeReviewDone: state.storeReviewDone,
    });
}

// ------------------------------------------------------------
// Store Update
// ------------------------------------------------------------
function resetStoreUpdate() {
    useAutoModalsStore.getState().setAutoModals({
        storeUpdateNextShowAt: null,
        storeUpdateShownAt: null,
        storeUpdateShownCount: 0,
        storeUpdateCheckedAt: null,
        storeUpdateCheckResult: null,
    });
}

export function previewStoreUpdateModal() {
    const { storeUpdateNextShowAt, storeUpdateShownCount } = useAutoModalsStore.getState();

    if (storeUpdateNextShowAt && Date.now() < storeUpdateNextShowAt) {
        Alert.alert("Store Update", `Shown ${storeUpdateShownCount} times — the real modal waits until ${formatTime(storeUpdateNextShowAt)}.`, [
            { text: "Cancel", style: "cancel" },
            { text: "Reset", onPress: resetStoreUpdate },
        ]);
        return;
    }
    showStoreUpdateModal();
}

// ------------------------------------------------------------
// Notif Reminder
// ------------------------------------------------------------
function resetNotifReminder() {
    useAutoModalsStore.getState().setAutoModals({
        notifReminderNextShowAt: null,
        notifReminderShownAt: null,
        notifReminderShownCount: 0,
        notifReminderDone: false,
    });
}

export function previewNotifReminderModal() {
    const { notifReminderShownCount, notifReminderDone } = useAutoModalsStore.getState();

    if (notifReminderDone) {
        Alert.alert("Notif Reminder", `Limit reached (${notifReminderShownCount}/${NOTIF_REMINDER_MAX_SHOWS}) — the real reminder won't show again until notifications are granted and turned off again.`, [
            { text: "Cancel", style: "cancel" },
            { text: "Reset", onPress: resetNotifReminder },
        ]);
        return;
    }
    showNotifReminderModal();
}

// ------------------------------------------------------------
// Store Review
// ------------------------------------------------------------
function resetStoreReview() {
    useAutoModalsStore.getState().setAutoModals({ storeReviewNextShowAt: null, storeReviewShownAt: null, storeReviewShownCount: 0, storeReviewDone: false });
}

export function previewStoreReviewModal() {
    const { storeReviewShownCount, storeReviewDone } = useAutoModalsStore.getState();

    if (storeReviewDone) {
        const blockedReason = storeReviewShownCount >= STORE_REVIEW_MAX_SHOWS
            ? `Limit reached (${storeReviewShownCount}/${STORE_REVIEW_MAX_SHOWS}) — the real modal never shows again.`
            : `"Open Store" or "Already rated" was tapped — the real modal never shows again.`;
        Alert.alert("Store Review", blockedReason, [
            { text: "Cancel", style: "cancel" },
            { text: "Reset", onPress: resetStoreReview },
        ]);
        return;
    }
    showStoreReviewModal();
}
