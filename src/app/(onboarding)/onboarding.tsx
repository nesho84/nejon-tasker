import AppScreen from '@/components/AppScreen';
import { useDeviceSettingsStore } from '@/store/deviceSettingsStore';
import { useLanguageStore } from '@/store/languageStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useThemeStore } from '@/store/themeStore';
import { Language, LANGUAGES } from '@/types/language.types';
import { openAlarmPermissionSettings, openBatteryOptimizationSettings, requestNotificationPermission } from '@/utils/system';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

type OnboardingStep = 'language' | 'slides' | 'permissions';

export default function OnboardingScreen() {
    // Stores
    const mode = useThemeStore((state) => state.themeMode);
    const theme = useThemeStore((state) => state.theme);
    const language = useLanguageStore((state) => state.language);
    const tr = useLanguageStore((state) => state.tr);
    const notificationPermission = useDeviceSettingsStore((state) => state.notificationPermission);
    const batteryOptimization = useDeviceSettingsStore((state) => state.batteryOptimization);

    // Local State
    const [step, setStep] = useState<OnboardingStep>('language');
    const [selectedLanguage, setSelectedLanguage] = useState<Language>(language || 'en');
    const [currentSlide, setCurrentSlide] = useState(0);

    // Refs
    const scrollViewRef = useRef<ScrollView>(null);

    // Safe area insets
    const insets = useSafeAreaInsets();
    const topInset = insets.top + 4;
    const bottomInset = insets.bottom + 12;

    // Onboarding slides data
    const SLIDES = [
        {
            id: 1,
            icon: '📝',
            title: tr.onboarding.slide1Title,
            description: tr.onboarding.slide1Description,
        },
        {
            id: 2,
            icon: '🏷️',
            title: tr.onboarding.slide2Title,
            description: tr.onboarding.slide2Description,
        },
        {
            id: 3,
            icon: '⏰',
            title: tr.onboarding.slide3Title,
            description: tr.onboarding.slide3Description,
        },
        {
            id: 4,
            icon: '⭐',
            title: tr.onboarding.slide4Title,
            description: tr.onboarding.slide4Description,
        },
        {
            id: 5,
            icon: '⚙️',
            title: tr.onboarding.slide5Title,
            description: tr.onboarding.slide5Description,
        },
    ] as const;

    // ------------------------------------------------------------
    // Handle language selection and proceed to features
    // ------------------------------------------------------------
    const handleLanguageNext = () => {
        useLanguageStore.getState().setLanguage(selectedLanguage);
        setStep('slides');
    };

    // ------------------------------------------------------------
    // Update current slide index once a swipe settles
    // ------------------------------------------------------------
    const handleMomentumScrollEnd = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        setCurrentSlide(index);
    };

    // ------------------------------------------------------------
    // Navigate to a specific slide
    // ------------------------------------------------------------
    const goToSlide = (index: number) => {
        scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
        setCurrentSlide(index);
    };

    // ------------------------------------------------------------
    // Handle Next button press
    // ------------------------------------------------------------
    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            goToSlide(currentSlide + 1);
        } else {
            setStep('permissions');
        }
    };

    // ------------------------------------------------------------
    // Handle Skip button press
    // ------------------------------------------------------------
    const handleSkip = () => {
        setStep('permissions');
    };

    // ------------------------------------------------------------
    // Handle Allow Notifications button press
    // ------------------------------------------------------------
    const handleAllowNotifications = () => {
        requestNotificationPermission(tr);
    };

    // ------------------------------------------------------------
    // Handle Continue button press (finish onboarding)
    // ------------------------------------------------------------
    const handleFinish = () => {
        useOnboardingStore.getState().setOnboarding(true);
    };

    // Step 1: Language Selection
    if (step === 'language') {
        return (
            <AppScreen>
                <ScrollView
                    style={{ flex: 1, backgroundColor: theme.bgAlt }}
                    contentContainerStyle={{ flexGrow: 1, paddingTop: topInset, paddingBottom: bottomInset }}
                    showsVerticalScrollIndicator={false}
                >

                    <View style={styles.languageContainer}>
                        {/* Header */}
                        <View style={styles.languageHeader}>
                            <Text style={[styles.languageTitle, { color: theme.text }]}>
                                {tr.onboarding.languageTitle}
                            </Text>
                            <Text style={[styles.languageSubtitle, { color: theme.muted }]}>
                                {tr.onboarding.languageSubtitle}
                            </Text>
                        </View>

                        {/* Language Options */}
                        <View style={styles.languageList}>
                            {LANGUAGES.map((lang) => (
                                <TouchableOpacity
                                    key={lang.value}
                                    style={[
                                        styles.languageOption,
                                        {
                                            backgroundColor: selectedLanguage === lang.value
                                                ? theme.card
                                                : theme.bg,
                                            borderColor: theme.border,
                                        },
                                    ]}
                                    onPress={() => setSelectedLanguage(lang.value)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.languageFlag}>{lang.icon}</Text>
                                    <Text
                                        style={[
                                            styles.languageName,
                                            {
                                                color: selectedLanguage === lang.value
                                                    ? '#FFFFFF'
                                                    : theme.text,
                                            },
                                        ]}
                                    >
                                        {lang.label}
                                    </Text>
                                    {selectedLanguage === lang.value && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Next Button */}
                        <View style={styles.languageBottom}>
                            <TouchableOpacity
                                style={[styles.primaryButton, { backgroundColor: theme.action1 }]}
                                onPress={handleLanguageNext}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>Next</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>
            </AppScreen>
        );
    }

    // Step 3: Permissions
    if (step === 'permissions') {
        return (
            <AppScreen>
                <ScrollView
                    style={{ flex: 1, backgroundColor: theme.bgAlt }}
                    contentContainerStyle={{ flexGrow: 1, paddingTop: topInset, paddingBottom: bottomInset }}
                    showsVerticalScrollIndicator={false}
                >

                    <View style={styles.permissionsContainer}>
                        {/* Header */}
                        <View style={styles.languageHeader}>
                            <Text style={[styles.languageTitle, { color: theme.text }]}>
                                {tr.onboarding.permissionsTitle}
                            </Text>
                            <Text style={[styles.languageSubtitle, { color: theme.muted }]}>
                                {tr.onboarding.permissionsSubtitle}
                            </Text>
                        </View>

                        {/* Permission Rows */}
                        <View style={[styles.permissionsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            {/* Notifications */}
                            <TouchableOpacity style={styles.permissionRow} onPress={handleAllowNotifications} activeOpacity={0.7}>
                                <View style={[styles.permissionIcon, { backgroundColor: (notificationPermission ? theme.action1 : theme.warning) + '15' }]}>
                                    <MaterialCommunityIcons
                                        name={notificationPermission ? "bell-check-outline" : "bell-alert-outline"}
                                        size={22}
                                        color={notificationPermission ? theme.action1 : theme.warning}
                                    />
                                </View>
                                <View style={styles.permissionText}>
                                    <Text style={[styles.permissionTitle, { color: theme.text }]}>
                                        {tr.onboarding.notificationsTitle}
                                    </Text>
                                    <Text style={[styles.permissionSubtitle, { color: theme.muted }]}>
                                        {tr.onboarding.notificationsBody}
                                    </Text>
                                </View>
                                {notificationPermission ? (
                                    <MaterialCommunityIcons name="check-circle" size={24} color={theme.success} />
                                ) : (
                                    <MaterialCommunityIcons name="alert-circle-outline" size={22} color={theme.warning} />
                                )}
                            </TouchableOpacity>

                            {Platform.OS === 'android' && (
                                <>
                                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                                    {/* Battery optimization */}
                                    <TouchableOpacity style={styles.permissionRow} onPress={openBatteryOptimizationSettings} activeOpacity={0.7}>
                                        <View style={[styles.permissionIcon, { backgroundColor: (batteryOptimization ? theme.warning : theme.action1) + '15' }]}>
                                            <MaterialCommunityIcons
                                                name={batteryOptimization ? "battery-alert-variant-outline" : "battery-check-outline"}
                                                size={22}
                                                color={batteryOptimization ? theme.warning : theme.success}
                                            />
                                        </View>
                                        <View style={styles.permissionText}>
                                            <Text style={[styles.permissionTitle, { color: theme.text }]}>
                                                {tr.settings.batteryOptTitle}
                                            </Text>
                                            <Text style={[styles.permissionSubtitle, { color: theme.muted }]}>
                                                {tr.settings.batteryOptBody}
                                            </Text>
                                        </View>
                                        {batteryOptimization ? (
                                            <MaterialCommunityIcons name="alert-circle-outline" size={22} color={theme.warning} />
                                        ) : (
                                            <MaterialCommunityIcons name="check-circle" size={24} color={theme.success} />
                                        )}
                                    </TouchableOpacity>

                                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                                    {/* Alarms & reminders */}
                                    <TouchableOpacity style={styles.permissionRow} onPress={openAlarmPermissionSettings} activeOpacity={0.7}>
                                        <View style={[styles.permissionIcon, { backgroundColor: theme.action1 + '15' }]}>
                                            <MaterialCommunityIcons name="alarm" size={22} color={theme.action1} />
                                        </View>
                                        <View style={styles.permissionText}>
                                            <Text style={[styles.permissionTitle, { color: theme.text }]}>
                                                {tr.settings.alarmAccessTitle}
                                            </Text>
                                            <Text style={[styles.permissionSubtitle, { color: theme.muted }]}>
                                                {tr.settings.alarmAccessBody}
                                            </Text>
                                        </View>
                                        <MaterialCommunityIcons name="open-in-new" size={18} color={theme.action1} style={{ opacity: 0.5 }} />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>

                        {/* Continue Button */}
                        <View style={styles.languageBottom}>
                            <TouchableOpacity
                                style={[styles.primaryButton, { backgroundColor: theme.action1 }]}
                                onPress={handleFinish}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
                                    {tr.onboarding.continueButton}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>
            </AppScreen>
        );
    }

    // Step 2: Onboarding Slides
    return (
        <AppScreen>
            <View style={[styles.slideContainer, { backgroundColor: theme.bgAlt }]}>
                {/* Header with skip button */}
                <View style={[styles.slideHeader, { paddingTop: topInset }]}>
                    <View style={styles.slideHeaderSpaceLeft} />
                    <TouchableOpacity onPress={handleSkip} style={styles.slideSkipButton}>
                        <Text style={[styles.slideSkipText, { color: theme.muted }]}>{tr.onboarding.skip}</Text>
                    </TouchableOpacity>
                </View>

                {/* Slides */}
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleMomentumScrollEnd}
                    style={styles.slideScrollView}
                >

                    {SLIDES.map((slide) => (
                        <View key={slide.id} style={styles.slideItem}>
                            {/* Icon Container */}
                            <View style={styles.slideIconContainer}>
                                <View
                                    style={[
                                        styles.slideIconBg,
                                        {
                                            backgroundColor: mode === 'dark'
                                                ? 'rgba(99, 102, 241, 0.2)'
                                                : 'rgba(99, 102, 241, 0.1)',
                                        },
                                    ]}
                                >
                                    <Text style={styles.slidesIcon}>{slide.icon}</Text>
                                </View>
                            </View>

                            {/* Content */}
                            <View style={styles.slideContent}>
                                <Text style={[styles.slideTitle, { color: theme.text }]}>{slide.title}</Text>
                                <Text style={[styles.slideDescription, { color: theme.muted }]}>{slide.description}</Text>
                            </View>
                        </View>
                    ))}

                </ScrollView>

                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => goToSlide(index)}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor:
                                        currentSlide === index
                                            ? theme.action1
                                            : theme.muted,
                                    width: currentSlide === index ? 24 : 8,
                                },
                            ]}
                        />
                    ))}
                </View>

                {/* Bottom Section */}
                <View style={[styles.bottomSection, { paddingBottom: bottomInset }]}>
                    {/* Next/Get Started Button */}
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: theme.action1 }]}
                        onPress={handleNext}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
                            {currentSlide === SLIDES.length - 1
                                ? tr.onboarding.start
                                : tr.onboarding.next}
                        </Text>
                    </TouchableOpacity>

                    {/* Progress Indicator */}
                    <View style={styles.progressContainer}>
                        <Text style={[styles.progressText, { color: theme.muted }]}>
                            {currentSlide + 1} of {SLIDES.length}
                        </Text>
                    </View>
                </View>
            </View>

        </AppScreen>
    );
}

const styles = StyleSheet.create({
    // Language Selection Styles
    languageContainer: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
    },
    languageHeader: {
        paddingTop: 40,
        paddingBottom: 50,
        alignItems: 'center',
    },
    languageTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    languageSubtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    languageList: {
        flex: 1,
        justifyContent: 'center',
        gap: 16,
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
    },
    languageFlag: {
        fontSize: 28,
        marginRight: 16,
    },
    languageName: {
        fontSize: 20,
        fontWeight: '600',
        flex: 1,
    },
    checkmark: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    languageBottom: {
        paddingVertical: 20,
    },

    // Permissions Step Styles
    permissionsContainer: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
    },
    permissionsCard: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
    },
    permissionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 6,
    },
    permissionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    permissionText: {
        flex: 1,
        gap: 3,
    },
    permissionTitle: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    permissionSubtitle: {
        fontSize: 12,
        lineHeight: 16,
        opacity: 0.8,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 10,
    },

    // Features Onboarding Styles
    slideContainer: {
        flex: 1,
    },
    slideHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    slideHeaderSpaceLeft: {
        width: 60,
    },
    slideSkipButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    slideSkipText: {
        fontSize: 16,
        fontWeight: '600',
    },
    slideScrollView: {
        flex: 1,
    },
    slideItem: {
        flex: 1,
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    slideIconContainer: {
        marginBottom: 40,
    },
    slideIconBg: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slidesIcon: {
        fontSize: 64,
    },
    slideContent: {
        alignItems: 'center',
    },
    slideTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    slideDescription: {
        fontSize: 17,
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 10,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    bottomSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 16,
    },
    primaryButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    progressContainer: {
        alignItems: 'center',
    },
    progressText: {
        fontSize: 14,
        fontWeight: '500',
    },
});