// How scenario-based features really trigger — shown under their ⓘ
export const UPDATE_MODAL_HINT =
    "Auto (release builds only): checked once on every app start. Google Play (In-App Updates) only answers " +
    "when the app was installed from Play. A newer store version → this modal on every start until updated " +
    "(\"Later\" isn't remembered). OTA updates download and reload silently — no modal. " +
    "Also opens from Settings → \"Check for update\" when one is found. Here it just opens.";
export const UPDATE_LAUNCH_HINT =
    "When ON, the \"Update available\" modal opens on the next app start, like a real store update would. " +
    "Stays ON across restarts until you turn it off (or debug mode is turned off).";
export const UP_TO_DATE_HINT =
    "Shows the green line under Settings → \"Check for update\" without a real check, until the app restarts. " +
    "Real: shown after a manual check finds no newer store version.";
export const CHECK_FAILED_HINT =
    "Shows the red line under Settings → \"Check for update\" without a real check, until the app restarts. " +
    "Real: shown when a manual check runs offline, or Play can't answer (e.g. the app wasn't installed from Play).";
export const SEED_HINT =
    "Seeding wipes existing data first, then generates a large set (~16 labels, hundreds of tasks), " +
    "including one label with a long name and some tasks with very long text.";
export const TEST_REMINDER_HINT =
    "Sets a real reminder on the open task with the longest text. Check: label as title (over 25 chars → " +
    "first 20 + ...), label color, text cut at 200 chars; it shows in Reminders › Upcoming, then moves to Past; " +
    "tapping it opens that task.";
export const TEST_REMINDER_KILLED_HINT =
    "Same reminder, with time to swipe the app away before it fires — then tap the notification (cold start).";

// How the two auto modals work — shown under their ⓘ
export const RATE_APP_HINT =
    "First show (Android only): the first time a 3rd task gets checked in one day — can already happen on day one.\n" +
    "\"Later\" → asks again 7 days later, at the next such moment.\n" +
    "Never again: \"Open Store\", \"Already rated\", or after 3 shows.\n" +
    "Waits while another modal is open.\n" +
    "From About: always opens; only \"Open Store\" / \"Already rated\" are recorded.\n" +
    "Here: counts like a real show and skips the waits — when blocked, you get a Reset.";
export const NOTIF_REMINDER_HINT =
    "First show: on an app start 3+ days after the app first saw notifications turned off.\n" +
    "\"Not now\" or \"Enable\" → asks again 7 days later, then 14 days later (on an app start).\n" +
    "Never again: after 3 shows — starts over once notifications are allowed and later turned off again.\n" +
    "Waits while another modal is open.\n" +
    "Here: counts like a real show and skips the waits — when blocked, you get a Reset.";
