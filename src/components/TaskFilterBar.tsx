import { HIT_SLOP_8 } from "@/constants/styles";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Label } from "@/types/label.types";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
    query: string;
    onQueryChange: (text: string) => void;
    chipLabels: Label[];
    selectedLabelId: string | null;
    onSelectLabel: (labelId: string | null) => void;
    children?: React.ReactNode;
}

export default function TaskFilterBar({
    query,
    onQueryChange,
    chipLabels,
    selectedLabelId,
    onSelectLabel,
    children,
}: Props) {
    // Stores
    const theme = useThemeStore((state) => state.theme);
    const tr = useLanguageStore((state) => state.tr);

    // Strip spans the side insets (landscape cutout/nav bar) to meet the header; controls stay inside
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.bg,
                    borderBottomColor: theme.border,
                    marginLeft: -insets.left,
                    marginRight: -insets.right,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                },
            ]}
        >
            {/* Optional content above the search (e.g. Reminders banner + tabs) */}
            {children}

            {/* Search field */}
            <View style={[styles.searchField, { backgroundColor: theme.iconBg2 }]}>
                <MaterialDesignIcons name="magnify" size={18} color={theme.muted} />
                <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    value={query}
                    onChangeText={onQueryChange}
                    placeholder={tr.forms.searchPlaceholder}
                    placeholderTextColor={theme.placeholder}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                />
                {/* Clear search */}
                {query.length > 0 && (
                    <Pressable
                        style={({ pressed }) => [styles.clearButton, pressed && { backgroundColor: theme.pressed }]}
                        onPress={() => onQueryChange("")}
                        hitSlop={HIT_SLOP_8}
                    >
                        <MaterialDesignIcons name="close" size={16} color={theme.muted} />
                    </Pressable>
                )}
            </View>

            {/* Label chips — only worth showing with 2+ labels */}
            {chipLabels.length > 1 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.chipRow}
                >
                    {/* All */}
                    <Pressable
                        style={[
                            styles.chip,
                            { backgroundColor: selectedLabelId === null ? theme.text : theme.iconBg2 },
                        ]}
                        onPress={() => onSelectLabel(null)}
                    >
                        <Text style={[styles.chipText, { color: selectedLabelId === null ? theme.bg : theme.muted }]}>
                            {tr.labels.all}
                        </Text>
                    </Pressable>

                    {/* One chip per label */}
                    {chipLabels.map((label) => {
                        const selected = selectedLabelId === label.id;
                        return (
                            <Pressable
                                key={label.id}
                                style={[
                                    styles.chip,
                                    selected
                                        ? { borderColor: label.color, backgroundColor: `${label.color}33` }
                                        : { backgroundColor: theme.iconBg2 },
                                ]}
                                onPress={() => onSelectLabel(selected ? null : label.id)}
                            >
                                <View style={[styles.chipDot, { backgroundColor: label.color }]} />
                                <Text
                                    style={[styles.chipText, { color: selected ? theme.text : theme.muted }]}
                                    numberOfLines={1}
                                >
                                    {label.title}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // paddingTop 16 = 8 visible (list screens' container sits 8 under the header)
    container: {
        paddingTop: 16,
        paddingBottom: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 8,
    },
    searchField: {
        flexDirection: "row",
        alignItems: "center",
        height: 38,
        marginHorizontal: 6,
        paddingLeft: 10,
        paddingRight: 6,
        borderRadius: 10,
        gap: 6,
    },
    searchInput: {
        flex: 1,
        height: 38,
        fontSize: 15,
        paddingVertical: 0,
    },
    clearButton: {
        padding: 6,
        borderRadius: 999,
    },
    chipRow: {
        paddingHorizontal: 6,
        gap: 6,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        height: 28,
        maxWidth: 150,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "transparent",
        borderRadius: 999,
        gap: 6,
    },
    chipDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    chipText: {
        flexShrink: 1,
        fontSize: 13,
        fontWeight: "500",
    },
});
