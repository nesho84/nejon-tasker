import { DAY_MS, STORE_UPDATE_NEXT_LAUNCH_SHOWS, STORE_UPDATE_WAIT_DAYS, useAutoModalsStore } from "@/store/autoModalsStore";
import { useLanguageStore } from "@/store/languageStore";
import { useModalStore } from "@/store/modalStore";
import { useThemeStore } from "@/store/themeStore";
import { openStoreListing } from "@/utils/system";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import { StyleSheet, Text, View } from "react-native";

// ------------------------------------------------------------
// Show the "Update available" modal — no checks (canShowStoreUpdate runs at launch).
// Recorded on show, since tapping outside closes it too; from Settings nothing is recorded.
// ------------------------------------------------------------
export function showStoreUpdateModal(fromSettings = false) {
    const { storeUpdateShownCount, setAutoModals } = useAutoModalsStore.getState();
    const tr = useLanguageStore.getState().tr;
    const theme = useThemeStore.getState().theme;

    if (!fromSettings) {
        setAutoModals({
            storeUpdateShownAt: Date.now(),
            storeUpdateShownCount: storeUpdateShownCount + 1,
            // Shows 1 and 2 come back next launch, then every 3 days
            storeUpdateNextShowAt: storeUpdateShownCount + 1 <= STORE_UPDATE_NEXT_LAUNCH_SHOWS ? null : Date.now() + STORE_UPDATE_WAIT_DAYS * DAY_MS,
        });
    }

    useModalStore.getState().show({
        type: "alert",
        component: (
            <View style={styles.bannerContainer}>
                <View style={[styles.modalIconCircle, { backgroundColor: theme.primary + "20" }]}>
                    <MaterialDesignIcons name="information-variant-circle" size={40} color={theme.primary} />
                </View>
                <Text style={[styles.bannerTitle, { color: theme.text }]}>{tr.updates.title}</Text>
                <Text style={[styles.bannerMessage, { color: theme.muted }]}>{tr.updates.message}</Text>
            </View>
        ),
        buttons: [
            {
                label: tr.buttons.later,
                action: "later",
                buttonStyle: { backgroundColor: theme.overlayLight },
                labelStyle: { fontSize: 16, fontWeight: "600", color: theme.text2 },
            },
            {
                label: tr.buttons.openStore,
                action: "openStore",
                onPress: openStoreListing,
                buttonStyle: { backgroundColor: theme.primary + "20", borderWidth: 1, borderColor: theme.primary + "40" },
                labelStyle: { fontSize: 16, fontWeight: "600", color: theme.primary },
            },
        ],
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
});
