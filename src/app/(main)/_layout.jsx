import { useContext, useState } from 'react';
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import { AntDesign, Entypo, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { ThemeContext } from "@/context/ThemeContext";
import useAppExit from "@/hooks/useAppExit";

export default function StackLayout() {
    const { theme } = useContext(ThemeContext);
    const { backAction } = useAppExit();
    const insets = useSafeAreaInsets();

    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <Drawer
            open={drawerOpen}
            onOpen={() => setDrawerOpen(true)}
            onClose={() => setDrawerOpen(false)}
            drawerStyle={{ width: "70%" }}
            renderDrawerContent={() => {
                return (
                    <View style={{ flex: 1, backgroundColor: "#1e1e1e", paddingTop: insets.top + 5 }}>
                        {/* Header */}
                        <View
                            style={{
                                backgroundColor: colors.info,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                minHeight: 160,
                                padding: 10,
                            }}
                        >
                            <Image
                                style={{ marginBottom: 10, width: 80, height: 80 }}
                                source={require("../../../assets/nademi.png")}
                            />
                        </View>

                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center", padding: 18, gap: 16, }}
                            onPress={() => {
                                setDrawerOpen(false);
                            }}
                        >
                            <MaterialCommunityIcons name={"home-circle-outline"} color={colors.light} size={22} />
                            <Text style={{ color: "white", fontSize: 20 }}>Home</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center", padding: 18, gap: 16, }}
                            onPress={() => {
                                router.push("/(main)/settings");
                                setDrawerOpen(false);
                            }}
                        >
                            <MaterialCommunityIcons name={"cog-outline"} color={colors.light} size={22} />
                            <Text style={{ color: "white", fontSize: 20 }}>Settings</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center", padding: 18, gap: 16, }}
                            onPress={() => {
                                router.push("/(main)/about");
                                setDrawerOpen(false);
                            }}
                        >
                            <MaterialCommunityIcons name={"information-outline"} color={colors.light} size={22} />
                            <Text style={{ color: "white", fontSize: 20 }}>About</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center", padding: 20, gap: 16, }}
                            onPress={() => backAction()}
                        >
                            <MaterialCommunityIcons name={"exit-to-app"} color={colors.light} size={22} />
                            <Text style={{ color: "white", fontSize: 20 }}>Exit</Text>
                        </TouchableOpacity>

                        {/* Footer */}
                        <View
                            style={{
                                position: "absolute",
                                width: "100%",
                                bottom: insets.bottom,
                                paddingTop: 8,
                                paddingBottom: 12,
                                borderColor: colors.muted,
                                borderTopWidth: 1,
                            }}
                        >
                            <View style={{ alignItems: "center" }}>
                                <TouchableOpacity onPress={async () => await Linking.openURL("https://nejon.net")}>
                                    <Text style={{ color: colors.muted, fontSize: 15 }}>
                                        www.nejon.net
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )
            }}
        >

            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme.themes.settingsScreen.container[theme.current],
                    },
                    headerTintColor: colors.light,
                }}
            >

                <Stack.Screen
                    name="index"
                    options={{
                        title: "Home",
                        headerShadowVisible: true,
                        contentStyle: {
                            borderTopColor: "#515961",
                            borderTopWidth: 1,
                            elevation: 10,
                        },
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ top: 1, paddingRight: 15 }}
                                onPress={() => setDrawerOpen((prevOpen) => !prevOpen)}>
                                <Ionicons name="menu" size={28} color="white" />
                            </TouchableOpacity>
                        ),
                        headerRight: () => (
                            <TouchableOpacity
                                style={{ top: 1 }}
                                onPress={() => { }}>
                                <MaterialIcons name="add" size={28} color="white" />
                            </TouchableOpacity>
                        ),
                    }}
                />

                <Stack.Screen
                    name="settings"
                    options={{
                        title: "Settings",
                        animation: "fade",
                    }}
                />

                <Stack.Screen
                    name="about"
                    options={{
                        title: "About",
                        animation: "fade",
                    }}
                />

                <Stack.Screen
                    name="label-details"
                    options={{
                        title: "Label Details",
                        animation: "slide_from_right",
                    }}
                />

            </Stack>

        </Drawer>
    );
}