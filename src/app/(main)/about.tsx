import { useThemeStore } from '@/store/themeStore';
import Constants from 'expo-constants';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AboutScreen() {
    const { theme } = useThemeStore();

    const date = new Date();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Image style={styles.logo} source={require("../../../assets/icons/icon.png")} />
            <Text style={styles.title}>{Constants?.expoConfig?.name}</Text>
            <Text style={styles.versionText}>Version {Constants?.expoConfig?.version}</Text>
            <TouchableOpacity
                onPress={async () => await Linking.openURL("https://nejon.net")}
            >
                <Text style={styles.yearText}>
                    ©{date.getFullYear()} <Text style={styles.link}>nejon.net</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        marginBottom: 10,
        width: 150,
        height: 150,
    },
    title: {
        paddingBottom: 10,
        fontWeight: "bold",
        fontSize: 25,
        color: "#777",
    },
    versionText: {
        paddingBottom: 10,
        fontWeight: "bold",
        fontSize: 15,
        color: "#888",
    },
    yearText: {
        fontWeight: "bold",
        fontSize: 12,
        color: "#999",
    },
    link: {
        color: "skyblue",
        fontSize: 14,
    },
});
