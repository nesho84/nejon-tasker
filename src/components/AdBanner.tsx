import { HIT_SLOP_8 } from "@/constants/styles";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useAdsStore } from "@/store/adsStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@react-native-vector-icons/ionicons/static";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Live ad units — no iOS app is registered in AdMob yet, so iOS holds the test unit until one is.
const ANDROID_BANNER_UNIT_ID = "ca-app-pub-8752479739166396/6694401827";
const IOS_BANNER_UNIT_ID = TestIds.BANNER;

const PLATFORM_BANNER_UNIT_ID = Platform.OS === "android" ? ANDROID_BANNER_UNIT_ID : IOS_BANNER_UNIT_ID;

// TestIds in dev — clicking a live ad from your own device risks the AdMob account.
const BANNER_UNIT_ID = __DEV__ ? TestIds.BANNER : PLATFORM_BANNER_UNIT_ID;

export default function AdBanner() {
    // Stores
    const theme = useThemeStore((state) => state.theme);
    const canRequestAds = useAdsStore((state) => state.canRequestAds);

    // Mounted outside any SafeAreaView, so the gesture-nav inset must be applied here directly
    const insets = useSafeAreaInsets();

    // Load/dismiss state lives in the store — (main)/_layout reads it to drop the bottom inset
    const loaded = useAdsStore((state) => state.bannerLoaded);
    const dismissed = useAdsStore((state) => state.bannerDismissed);
    const setBannerLoaded = useAdsStore((state) => state.setBannerLoaded);
    const dismissBanner = useAdsStore((state) => state.dismissBanner);

    // The keyboard covers the banner anyway, so it leaves the layout flow while open
    const { isKeyboardVisible } = useKeyboard();

    if (!canRequestAds || dismissed) return null;

    return (
        // Styled only once loaded, so nothing is reserved while the request is in flight
        <View
            style={[
                loaded && [styles.container, { backgroundColor: theme.bg, borderTopColor: theme.border, paddingBottom: insets.bottom }],
                // Out of flow so the screens above keep their full height and their original
                // keyboard offsets — those measure against the bottom of the screen.
                isKeyboardVisible && styles.behindKeyboard,
            ]}
        >
            {loaded && (
                // Absolute, so it adds no height — sits in the gap beside the 320dp ad, never over it
                <Pressable
                    onPress={dismissBanner}
                    hitSlop={HIT_SLOP_8}
                    style={({ pressed }) => [styles.closeButton, pressed && { backgroundColor: theme.pressed }]}
                >
                    <Ionicons name="close" size={14} color={theme.placeholder} />
                </Pressable>
            )}

            <BannerAd
                unitId={BANNER_UNIT_ID}
                size={BannerAdSize.BANNER}
                onAdLoaded={() => setBannerLoaded(true)}
                onAdFailedToLoad={(err) => {
                    console.warn("⚠️ [AdBanner] Failed to load banner:", err);
                    setBannerLoaded(false);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    behindKeyboard: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
    },
    closeButton: {
        position: "absolute",
        top: 2,
        right: 4,
        zIndex: 1,
        padding: 2,
        borderRadius: 999,
    },
});
