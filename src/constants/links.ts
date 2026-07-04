const ANDROID_PACKAGE_ID = "com.nejon.nejontasker";
const APP_STORE_ID = ""; // set once the iOS app is published to the App Store

export const NEJON_WEBSITE_URL = "https://nejon.net";

export const GOOGLE_PLAY_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}`;
export const GOOGLE_PLAY_NATIVE_URL = `market://details?id=${ANDROID_PACKAGE_ID}`;
export const MORE_APPS_GOOGLE_PLAY_URL = "https://play.google.com/store/apps/developer?id=Neshat%20Ademi";

// iOS not published yet — falls back to the website until APP_STORE_ID is set
export const APPLE_STORE_URL = APP_STORE_ID ? `https://apps.apple.com/app/id${APP_STORE_ID}` : NEJON_WEBSITE_URL;
export const APPLE_STORE_NATIVE_URL = APP_STORE_ID ? `itms-apps://itunes.apple.com/app/id${APP_STORE_ID}` : NEJON_WEBSITE_URL;
