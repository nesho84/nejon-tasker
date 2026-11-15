import { useModalStore } from "@/store/modalStore";
import { useThemeStore } from "@/store/themeStore";
import { shareText } from "@/utils/system";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import { ReactNode, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ButtonProps {
    label: string;
    color: string;
    right?: ReactNode;
    hint?: string;
    disabled?: boolean;
    onPress: () => void;
}

interface ToggleProps {
    label: string;
    color?: string;
    value: boolean;
    hint?: string;
    onPress: () => void;
}

interface BadgeProps {
    label: string;
    color: string;
    bg: string;
}

interface InfoButtonProps {
    active: boolean;
    onPress: () => void;
}

interface HintProps {
    text: string;
}

interface SectionProps {
    title: string;
    children: ReactNode;
}

interface ModalHeadProps {
    title: string;
    hint: string;
}

interface JsonViewerProps {
    title: string;
    json: string;
}

// ------------------------------------------------------------
// Small rounded status badge (ON/OFF state, test-reminder delay)
// ------------------------------------------------------------
export function Badge({ label, color, bg }: BadgeProps) {
    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
    );
}

// ------------------------------------------------------------
// ⓘ button that toggles a hint
// ------------------------------------------------------------
function InfoButton({ active, onPress }: InfoButtonProps) {
    const theme = useThemeStore((state) => state.theme);
    return (
        <TouchableOpacity
            style={[styles.infoButton, active && { backgroundColor: theme.pressed }]}
            activeOpacity={0.6}
            hitSlop={8}
            onPress={onPress}
        >
            <MaterialDesignIcons name="information-outline" size={18} color={theme.muted} />
        </TouchableOpacity>
    );
}

// ------------------------------------------------------------
// Explanation shown under a row or auto-modal title
// ------------------------------------------------------------
function Hint({ text }: HintProps) {
    const theme = useThemeStore((state) => state.theme);
    return <Text style={[styles.hint, { color: theme.danger, backgroundColor: theme.overlayLight }]}>{text}</Text>;
}

// ------------------------------------------------------------
// Reusable debug row — label on the left, optional ⓘ hint and
// value/indicator (e.g. a spinner) on the right
// ------------------------------------------------------------
export function DebugButton({ label, color, right, hint, disabled, onPress }: ButtonProps) {
    const theme = useThemeStore((state) => state.theme);
    const [showHint, setShowHint] = useState(false);
    return (
        <>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.overlayLight }]}
                activeOpacity={0.6}
                disabled={disabled}
                onPress={onPress}
            >
                <Text style={[styles.buttonText, { color }]}>{label}</Text>
                <View style={styles.buttonRight}>
                    {hint && <InfoButton active={showHint} onPress={() => setShowHint((v) => !v)} />}
                    {right}
                </View>
            </TouchableOpacity>
            {hint && showHint && <Hint text={hint} />}
        </>
    );
}

// ------------------------------------------------------------
// Debug row with an ON / OFF state badge
// ------------------------------------------------------------
export function DebugToggle({ label, color, value, hint, onPress }: ToggleProps) {
    const theme = useThemeStore((state) => state.theme);
    return (
        <DebugButton
            label={label}
            color={color ?? theme.info}
            hint={hint}
            onPress={onPress}
            right={
                <Badge
                    label={value ? "ON" : "OFF"}
                    color={value ? theme.green : theme.placeholder}
                    bg={value ? theme.green + "20" : theme.divider}
                />
            }
        />
    );
}

// ------------------------------------------------------------
// Feature section — uppercase heading + one card holding its rows
// ------------------------------------------------------------
export function DebugSection({ title, children }: SectionProps) {
    const theme = useThemeStore((state) => state.theme);
    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.primaryAlt }]}>{title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: theme.bgAlt, borderColor: theme.border }]}>{children}</View>
        </View>
    );
}

// ------------------------------------------------------------
// Auto-modal title with an ⓘ that shows how it works
// ------------------------------------------------------------
export function AutoModalHead({ title, hint }: ModalHeadProps) {
    const theme = useThemeStore((state) => state.theme);
    const [showHint, setShowHint] = useState(false);
    return (
        <>
            <View style={styles.modalHead}>
                <Text style={[styles.modalTitle, { color: theme.text2 }]}>{title}</Text>
                <InfoButton active={showHint} onPress={() => setShowHint((v) => !v)} />
            </View>
            {showHint && <Hint text={hint} />}
        </>
    );
}

// ------------------------------------------------------------
// JSON viewer for debugging: scrollable, selectable, share via the system sheet
// ------------------------------------------------------------
function JsonViewer({ title, json }: JsonViewerProps) {
    const theme = useThemeStore((state) => state.theme);

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, backgroundColor: theme.bg2 }} contentContainerStyle={{ padding: 6 }}>
                <Text
                    selectable
                    style={{
                        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
                        fontSize: 11,
                        color: theme.muted,
                        lineHeight: 17,
                    }}
                >
                    {json}
                </Text>
            </ScrollView>
            <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: theme.green + "20" }]}
                activeOpacity={0.7}
                onPress={() => shareText(title, json)}
            >
                <Text style={[styles.shareBtnText, { color: theme.green }]}>Share JSON</Text>
            </TouchableOpacity>
        </View>
    );
}

// ------------------------------------------------------------
// Open a fullscreen JSON viewer modal via ModalProvider
// ------------------------------------------------------------
export const showJsonViewerModal = (title: string, data: object) =>
    useModalStore.getState().show({
        type: "fullscreen",
        showCloseIcon: true,
        title,
        component: <JsonViewer title={title} json={JSON.stringify(data, null, 2)} />,
    });

const styles = StyleSheet.create({
    // Feature section
    section: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.5,
        textTransform: "uppercase",
        opacity: 0.8,
        paddingHorizontal: 4,
    },
    sectionCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 8,
        gap: 6,
        overflow: "hidden",
    },

    // Auto-modal block
    modalHead: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 6,
        paddingRight: 2,
    },
    modalTitle: {
        fontSize: 14,
        fontWeight: "600",
    },
    infoButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    hint: {
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 12,
        lineHeight: 17,
    },

    // Action row + right-side indicators
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    buttonText: {
        flexShrink: 1,
        fontSize: 13,
        fontWeight: "500",
    },
    buttonRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginLeft: 8,
    },

    // Rounded status badge (ON/OFF, test-reminder delay)
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 36,
        alignItems: "center",
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
    },

    // Share button for JSON viewer
    shareBtn: {
        paddingVertical: 10,
        alignItems: "center",
        marginTop: 8,
    },
    shareBtnText: {
        fontSize: 13,
        fontWeight: "600",
    },
});
