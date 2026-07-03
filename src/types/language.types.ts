import { TRANSLATIONS } from "@/constants/translations";

export type Language = keyof typeof TRANSLATIONS;

export type Translations = typeof TRANSLATIONS.en;

export const LANGUAGES = [
    { value: 'en' as Language, label: 'English', icon: '🇬🇧' },
    { value: 'de' as Language, label: 'Deutsch', icon: '🇩🇪' },
    { value: 'sq' as Language, label: 'Shqip', icon: '🇦🇱' },
];
