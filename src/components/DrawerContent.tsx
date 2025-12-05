import useAppExit from "@/hooks/useAppExit";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from '@/store/themeStore';
import { Label } from "@/types/label.types";
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
    close: () => void;
}

export default function DrawerContent({ close }: Props) {
    const { theme } = useThemeStore();
    const { tr } = useLanguageStore();

    const { backAction } = useAppExit();
    const insets = useSafeAreaInsets();

    const labels = useLabelStore((state) => state.labels);

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.background, paddingTop: insets.top + 10 },
            ]}
        >
            <ScrollView
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: insets.bottom + 10 }}
            >

                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerText, { color: theme.text }]}>Nejon Tasker</Text>
                </View>

                {/* Selected item (Home) */}
                <TouchableOpacity
                    onPress={close}
                    style={[styles.selectedItem, { backgroundColor: theme.disabled }]}
                    activeOpacity={0.85}
                >
                    <MaterialCommunityIcons name="home" size={22} color={theme.text} />
                    <Text style={[styles.selectedLabel, { color: theme.text }]}>{tr.labels.home}</Text>
                </TouchableOpacity>

                {/* Reminders */}
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                        close();
                        router.push("/(main)/reminders");
                    }}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="bell-outline" size={22} color={theme.text} />
                    <Text style={[styles.menuLabel, { color: theme.text }]}>{tr.labels.reminders}</Text>
                </TouchableOpacity>

                {/* Favorites */}
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                        close();
                        router.push("/(main)/favorites");
                    }}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="bookmark-outline" size={22} color={theme.text} />
                    <Text style={[styles.menuLabel, { color: theme.text }]}>{tr.labels.favorites}</Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                {/* Labels header */}
                <View style={[styles.labelsHeader, { paddingTop: 14 }]}>
                    <Text style={[styles.labelsTitle, { color: theme.muted }]}>{tr.labels.labels}</Text>
                </View>
                {/* Labels */}
                {labels && labels.length > 0 && (
                    labels.map((item: Label) => {
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => {
                                    close();
                                    router.push(`/tasks?labelId=${item.id}`)
                                }}
                            >
                                <MaterialCommunityIcons name="label-outline" size={22} color={theme.text} />
                                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.title}</Text>
                            </TouchableOpacity>
                        )
                    })
                )}

                {/* New Label */}
                <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() => { }}
                >
                    <MaterialIcons name="add" size={24} color={theme.text} />
                    <Text style={[styles.menuLabel, { fontSize: 14, color: theme.text }]}>Create new label</Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                {/* Trash */}
                <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() => {
                        close();
                        router.push("/(main)/trash");
                    }}
                >
                    <MaterialCommunityIcons name="trash-can-outline" size={22} color={theme.text} />
                    <Text style={[styles.menuLabel, { color: theme.text }]}>{tr.labels.trash}</Text>
                </TouchableOpacity>

                {/* Settings */}
                <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() => {
                        close();
                        router.push("/(main)/settings");
                    }}
                >
                    <MaterialCommunityIcons name="cog-outline" size={22} color={theme.text} />
                    <Text style={[styles.menuLabel, { color: theme.text }]}>{tr.labels.settings}</Text>
                </TouchableOpacity>

                {/* About */}
                <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() => {
                        close();
                        router.push("/(main)/about");
                    }}
                >
                    <MaterialCommunityIcons name="information-outline" size={22} color={theme.text} />
                    <Text style={[styles.menuLabel, { color: theme.text }]}>{tr.labels.about}</Text>
                </TouchableOpacity>

                {/* Exit */}
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => backAction()}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="exit-to-app" size={22} color={theme.text} />
                    <Text style={[styles.menuLabel, { color: theme.text }]}>{tr.buttons.exit}</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    header: {
        marginTop: 6,
        marginBottom: 22,
        paddingLeft: 16,
    },
    headerText: {
        fontSize: 26,
        fontWeight: "500",
    },

    selectedItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 999,
        marginHorizontal: 8,
        marginBottom: 8,
    },
    selectedLabel: {
        fontSize: 18,
        marginLeft: 14,
        fontWeight: "500",
    },

    labelsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 22,
        marginBottom: 6,
    },
    labelsTitle: {
        fontSize: 14,
        textTransform: "none",
    },

    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 22,
    },

    menuLabel: {
        fontSize: 17,
        marginLeft: 16,
    },

    divider: {
        height: 1,
        marginVertical: 12,
        marginHorizontal: 22,
    },
});
