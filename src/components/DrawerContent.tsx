import useAppExit from "@/hooks/useAppExit";
import { useThemeStore } from '@/store/themeStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from "expo-router";
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
    close: () => void;
}

export default function DrawerContent({ close }: Props) {
    const { theme } = useThemeStore();
    const { backAction } = useAppExit();
    const insets = useSafeAreaInsets();

    return (
        <View style={{
            flex: 1,
            backgroundColor: theme.background,
            paddingTop: insets.top + 5
        }}
        >
            {/* Header */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.lightSkyBlue,
                    minHeight: 160,
                }}
            >
                <Image
                    style={{ marginBottom: 10, width: 80, height: 80 }}
                    source={require("../../assets/nademi.png")}
                />
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={close}>
                <MaterialCommunityIcons name={"home-outline"} color={theme.text} size={22} />
                <Text style={{ color: theme.text, fontSize: 20 }}>Labels</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                    router.push("/(main)/reminders");
                    close();
                }}
            >
                <MaterialCommunityIcons name={"bell-outline"} color={theme.text} size={22} />
                <Text style={{ color: theme.text, fontSize: 20 }}>Reminders</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.muted }]} />

            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                    router.push("/(main)/settings");
                    close();
                }}
            >
                <MaterialCommunityIcons name={"cog-outline"} color={theme.text} size={22} />
                <Text style={{ color: theme.text, fontSize: 20 }}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                    router.push("/(main)/about");
                    close();
                }}
            >
                <MaterialCommunityIcons name={"information-outline"} color={theme.text} size={22} />
                <Text style={{ color: theme.text, fontSize: 20 }}>About</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => backAction()}
            >
                <MaterialCommunityIcons name={"exit-to-app"} color={theme.text} size={22} />
                <Text style={{ color: theme.text, fontSize: 20 }}>Exit</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View
                style={{
                    position: "absolute",
                    width: "100%",
                    bottom: insets.bottom,
                    paddingTop: 8,
                    paddingBottom: 12,
                    borderColor: theme.muted,
                    borderTopWidth: 1,
                }}
            >
                <View style={{ alignItems: "center" }}>
                    <TouchableOpacity onPress={async () => await Linking.openURL("https://nejon.net")}>
                        <Text style={{ color: theme.muted, fontSize: 15 }}>
                            www.nejon.net
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 18,
        gap: 16,
    },
    divider: {
        height: 1,
        marginVertical: 6,
        marginHorizontal: 18,
    }
});