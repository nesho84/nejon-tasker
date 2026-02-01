import { useLanguageStore } from '@/store/languageStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useThemeStore } from '@/store/themeStore';
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

export type Language = "en" | "de" | "sq";

// Language options with flags
const LANGUAGES = [
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
    { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
    { code: 'sq' as Language, name: 'Shqip', flag: '🇦🇱' },
];

export default function OnboardingScreen() {
    const { setOnboarding } = useOnboardingStore();
    const { mode, theme } = useThemeStore();
    const { setLanguage, language, tr } = useLanguageStore();

    const barStyle = mode === "dark" ? "light" : "dark";

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
    ];

    // Refs
    const scrollViewRef = useRef<ScrollView>(null);

    // Local State
    const [languageScreen, setLanguageScreen] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState<Language>(language || 'en');
    const [currentSlide, setCurrentSlide] = useState(0);

    // ------------------------------------------------------------
    // Handle language selection and proceed to features
    // ------------------------------------------------------------
    const handleLanguageNext = () => {
        setLanguage(selectedLanguage);
        setLanguageScreen(false);
    };

    // ------------------------------------------------------------
    // Handle scroll to update current slide index
    // ------------------------------------------------------------
    const handleScroll = (event: any) => {
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
            setOnboarding(true);
        }
    };

    // ------------------------------------------------------------
    // Handle Skip button press
    // ------------------------------------------------------------
    const handleSkip = () => {
        setOnboarding(true);
    };

    // Step 1: Language Selection
    if (languageScreen) {
        return (
            <>
                <StatusBar style={barStyle} />
                <SafeAreaView
                    style={[styles.container, { backgroundColor: theme.bgAlt }]}
                    edges={['top', 'bottom']}
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
                                    key={lang.code}
                                    style={[
                                        styles.languageOption,
                                        {
                                            backgroundColor: selectedLanguage === lang.code
                                                ? theme.card
                                                : theme.bg,
                                            borderColor: selectedLanguage === lang.code
                                                ? theme.border
                                                : theme.border,
                                        },
                                    ]}
                                    onPress={() => setSelectedLanguage(lang.code)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                                    <Text
                                        style={[
                                            styles.languageName,
                                            {
                                                color: selectedLanguage === lang.code
                                                    ? '#FFFFFF'
                                                    : theme.text,
                                            },
                                        ]}
                                    >
                                        {lang.name}
                                    </Text>
                                    {selectedLanguage === lang.code && (
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

                </SafeAreaView>
            </>
        );
    }

    // Step 2: Onboarding Slides
    return (
        <>
            <StatusBar style={barStyle} />
            <SafeAreaView
                style={[styles.container, { backgroundColor: theme.bgAlt }]}
                edges={['top', 'bottom']}
            >

                <View style={styles.slidesContainer}>
                    {/* Header with skip button */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft} />
                        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                            <Text style={[styles.skipText, { color: theme.muted }]}>{tr.onboarding.skip}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Slides */}
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        style={styles.scrollView}
                    >
                        {SLIDES.map((slide) => (
                            <View key={slide.id} style={styles.slide}>
                                {/* Icon Container */}
                                <View style={styles.iconContainer}>
                                    <View
                                        style={[
                                            styles.iconCircle,
                                            {
                                                backgroundColor: mode === 'dark'
                                                    ? 'rgba(99, 102, 241, 0.2)'
                                                    : 'rgba(99, 102, 241, 0.1)',
                                            },
                                        ]}
                                    >
                                        <Text style={styles.icon}>{slide.icon}</Text>
                                    </View>
                                </View>

                                {/* Content */}
                                <View style={styles.content}>
                                    <Text style={[styles.title, { color: theme.text }]}>{slide.title}</Text>
                                    <Text style={[styles.description, { color: theme.muted }]}>{slide.description}</Text>
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
                    <View style={styles.bottom}>
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

            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

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

    // Features Onboarding Styles
    slidesContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerLeft: {
        width: 60,
    },
    skipButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        width: width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        marginBottom: 40,
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 64,
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    description: {
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
    bottom: {
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