# Nejon Tasker — Developer Guide

## What This App Does

Nejon Tasker is a React Native / Expo task manager. Its main features:

- **Tasks** — create, edit, check off, and drag-to-reorder tasks. Each task belongs to a **label** and can carry a reminder.
- **Labels** — colored categories that group tasks; reorderable, with their own favorite/trash state.
- **Reminders** — schedule a per-task notification at an exact date/time via `expo-notifications` (a `DATE` trigger so it fires at the exact clock time). The notification is titled with the task's label, in the label color, with the task text (long labels and texts are shortened); tapping it opens the task. The Reminders screen splits them into **Upcoming** and **Past** (already fired).
- **Favorites & Trash** — mark tasks as favorite; soft-delete to Trash with restore or permanent delete.
- **Search & label filters** — Reminders, Favorites and Trash share a toolbar (`TaskFilterBar` + `useTaskFilter`) with a text search and label chips; rows show a colored label tag.
- **Backup & Restore** — export all labels and tasks to a JSON file and import them back (`expo-file-system` / `expo-sharing` / `expo-document-picker`).
- **Settings** — language, light/dark theme, and Android shortcuts for notification, battery-optimization, and exact-alarm permissions.
- **Onboarding** — first-launch language selection followed by a feature-slides walkthrough.

**Supported languages:** English, German (`de`), Albanian (`sq`)

---

## Prerequisites
- **Node.js** and **npm** installed
- **Android Studio** with SDK & emulator configured
- **Java JDK 17**+ installed
- **Virtualization enabled** in BIOS/UEFI
- **ADB** accessible from terminal (`adb devices`)

---

## Quick Start

```bash
npm install
npx expo start
```

Press `a` to open on Android emulator, or `i` for iOS simulator.

> Native modules (SQLite, notifications, reanimated, gesture-handler, draggable list) require the **dev client** — Expo Go can only run pure-JS changes. See [Build & Development](#build--development).

---

## Project Structure

```
src/
├── app/                   # Expo Router screens
│   ├── (main)/            # Drawer + Stack: Tasks (index), Reminders, Favorites, Trash, Settings, About
│   ├── (modals)/          # Transparent bottom-sheet modals: edit task, add/edit label
│   └── (onboarding)/      # First-launch language selection + feature slides
├── components/            # Shared UI (AppScreen, TaskItem, CustomPicker, ColorPicker, BackupSection, …)
├── constants/             # Colors, translations.ts (i18n strings)
├── db/                    # SQLite: database.ts (schema/setup), task.repo.ts, label.repo.ts
├── hooks/                 # Root use*Sync hooks (notifications, auto modals, OTA updates, …), useTaskFilter, useKeyboard
├── services/              # backupService (JSON export/import), storeUpdateService, adsService, notificationsService
├── store/                 # Zustand stores
├── types/                 # TypeScript interfaces (task, label)
└── utils/                 # Pure utility functions (dates, misc)
assets/
└── icons/                 # App, notification, and splash icons
```

---

## Architecture

### Routing — Expo Router

File-based routing. `src/app/_layout.tsx` (`RootLayout`) first runs `setupDatabase()` and loads the
task/label stores, showing `AppLoading` until the DB is ready. It then renders `RootStack`, which uses
`Stack.Protected` to gate the app behind `onboardingComplete` — until onboarding is done, only the
onboarding flow is reachable. `(main)` is a `react-native-drawer-layout` Drawer (label list +
navigation) wrapping a Stack; `(modals)` are transparent bottom sheets.

### Data — SQLite + Zustand (two-tier)

Domain data is stored in **SQLite** (`expo-sqlite`, database file `tasks.db`):

| Layer | Responsibility |
|---|---|
| `src/db/database.ts` | Opens the DB, defines the `labels` / `tasks` schema in `setupDatabase()` |
| `src/db/task.repo.ts`, `label.repo.ts` | All SQL queries (CRUD, reorder, soft/hard delete, restore) |
| `taskStore`, `labelStore` (Zustand) | In-memory cache loaded from the repos at startup; **writes through to SQLite on every mutation** |

Components read from the stores; stores call the repos. **Never query SQLite directly from a component.**

Settings stores are persisted separately with Zustand's `persist` middleware + **expo-sqlite's
built-in kv-store** (`expo-sqlite/kv-store`, its own `ExpoSQLiteStorage` db file — not `tasks.db`),
via the `kvStorage` adapter in `src/store/storage.ts`:

| Store | Purpose | Persistence |
|---|---|---|
| `taskStore` | Tasks cache + CRUD / reorder / favorite / trash actions | SQLite |
| `labelStore` | Labels cache + CRUD / reorder actions | SQLite |
| `themeStore` | Light / dark theme | SQLite kv-store |
| `languageStore` | Active language + translation strings | SQLite kv-store |
| `onboardingStore` | First-launch gate (`onboardingComplete`) | SQLite kv-store |
| `autoModalsStore` | State of the 3 auto modals (Store update, Notif reminder, Store review): next-show time, last show, show count, done | SQLite kv-store |

### Notifications & Reminders

Powered by **`expo-notifications`** (local notifications only — no push, no notifee). The pieces:

- **`services/notificationsService.ts`** — the Android **default** channel, and
  `scheduleNotification(task, label, tr)` with a `DATE` trigger (absolute time) so Android fires it at
  the exact clock time rather than a drifting countdown. Content: label title (over 25 chars → first 20
  + "...", like the drawer), "Task Reminder" subtext, label color, task text (trimmed, cut at 200 chars —
  the tap opens the full task), `data: { taskId }`.
- **`hooks/useNotificationsSync.ts`** (root layout's global hooks, `useNotificationsSync(isDbReady)`) — the foreground handler, and
  notification **taps**: `useLastNotificationResponse()` opens the task (label screen + edit sheet), held
  until the DB is loaded and onboarding is done so cold-start taps work. Fired reminders are **kept** on
  the task — the Reminders screen shows them under **Past** until cleared or the task is checked.
- **Label rename/recolor** — `labelStore.updateLabel` calls `taskStore.rescheduleLabelReminders` so
  scheduled notifications pick up the new title/color.
- **Permission + settings deep-links** (`utils/system.ts`, via `expo-intent-launcher`): permission
  request, the battery-optimization flow (status read with
  `expo-battery.isBatteryOptimizationEnabledAsync()` → one-tap "Allow" dialog when still optimized, or
  the battery list when already exempt), the exact-alarm "Alarms & reminders" screen, and the app's
  notification settings.

Reliable delivery on Android requires both the **exact-alarm** permission and a **battery-optimization
exemption** (Doze otherwise batches/delays alarms). `USE_EXACT_ALARM` is intentionally **not** declared
(it locks the alarm toggle on and is Play-restricted) — only the user-revocable `SCHEDULE_EXACT_ALARM`.

### Backup & Restore

`src/services/backupService.ts` serializes all labels + tasks to a JSON file (saved via
`expo-file-system`, shared via `expo-sharing`) and restores from a user-picked file
(`expo-document-picker`), validating the format before importing.

### Auto modals

Three modals open on their own. Their state lives in `autoModalsStore`; the waits are constants at the
top of that file, and the rules (`canShowStoreUpdate`, `canShowNotifReminder`, `canShowStoreReview`)
live in `src/hooks/useAutoModalsSync.ts`. Each `show…Modal()` in `src/components/*Modal.tsx` only shows the
modal and records the show.

| Modal | First wait | After closing / "Later" | Stops for good |
|---|---|---|---|
| Store update | none | next launch, next launch, then every 3 days | never |
| Enable notifications | 3 days | 7 days, then 14 | after 3 shows |
| Store review (Android only) | none | 7 days | after 3 shows, "Open Store", or "Already rated" |

No auto modal opens while another modal is open.

**Launch order** (`checkAutoModalsOnStart`, once per launch after onboarding, the first device-settings
sync, and the kv-store hydration of `autoModalsStore` and `debugStore`) — at most one of:
1. **Store update** — if the store check (`checkForStoreUpdate` in `src/services/storeUpdateService.ts`, also used by
   Settings → "Check for update"; 5 s timeout, release builds only) reports
   an update and it's due. "No update" while online resets its cycle; offline, a failed check (sideloaded
   build, iOS without an AppStoreID) or a timeout change nothing.
2. **Enable notifications** — if due. Granting resets it; turning notifications off again starts the
   3-day wait. **Enable notifications** calls `requestNotificationPermission()`, which offers system
   settings when no system dialog is possible anymore.

**Store review** keeps its own trigger — the 3rd task checked on a day (`TaskItem`) — and opens there when
`canShowStoreReview()`. It also waits for a later session when Store update or Enable notifications already
showed in this one.

**Manual opens** skip the checks and aren't recorded: Store review from About (`fromAbout`), and
Settings → "Check for update" (`showStoreUpdateModal(true)`). The debug panel previews count like a real show.

### i18n

`languageStore` holds the active language; all strings live in `src/constants/translations.ts` as
per-language objects (`en` / `de` / `sq`). Components read `tr` from `languageStore`.

---

## Build & Development

### 1. Expo Go (JS-only, no native modules)

```bash
npx expo start
# Press 'a'
```

> ❌ Cannot use custom native modules (SQLite, notifications, etc.)

---

### 2. Dev Client (custom native modules + hot reload)

```bash
npx expo prebuild --clean   # generate android/ (and ios/)
npx expo run:android        # build debug APK and install
npx expo start              # start Metro, then press 's' → 'a'
```

- Only rerun `npx expo run:android` when native code/config changes (new packages, permissions, `app.json`).
- Manual install: `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`

---

### 3. Local Release Build (signed, same as EAS)

Signed with the upload key from `credentials.json` (see [Local Signing](#local-signing)).

```bash
npm run build:aab   # AAB for Play Console upload
npm run build:apk   # APK to install on a phone or share
```

| Command | Output | Use |
|---|---|---|
| `build:aab` | `android/app/build/outputs/bundle/release/app-release.aab` | Play upload (Play only accepts AABs) |
| `build:apk` | `android/app/build/outputs/apk/release/app-release.apk` | `adb install -r <apk>` / testers |

Both run `scripts/build-release.js`: `expo prebuild --clean`, then Gradle (`bundleRelease` /
`assembleRelease`) with `.env.local` loaded if present. Prebuild asks before continuing if there
are uncommitted changes.

Build + install on a connected phone in one step: `npx expo run:android --variant release`.

Check the signature (SHA-1 must match Play's **Upload key certificate**):

```powershell
keytool -printcert -jarfile android\app\build\outputs\bundle\release\app-release.aab
& "$env:LOCALAPPDATA\Android\Sdk\build-tools\37.0.0\apksigner.bat" verify --print-certs android\app\build\outputs\apk\release\app-release.apk
```

APKs use the v2/v3 signature scheme, which `keytool` can't always read, so check APKs with `apksigner`.

> ❌ No hot reload — ✅ Useful for testing production behavior

> ⚠️ The dev client is signed with the debug key, release builds with the upload key. Android
> won't update an app with a build signed by a different key, so switching the same phone between
> them needs `adb uninstall com.nejon.nejontasker` first (clears app data). The Play version is
> signed by Google, so it needs an uninstall too.

---

### 4. EAS Cloud Build (store submission)

```bash
npm install -g eas-cli
eas login
```

| Profile | Command | Output |
|---|---|---|
| Development APK | `eas build --profile development --platform android` | `.apk` |
| Release APK | `eas build --profile release-apk --platform android` | `.apk` |
| Preview (AAB) | `eas build --profile preview --platform android` | `.aab` |
| Production | `eas build --profile production --platform android` | `.aab` (store) |

---

## Key Points

| Mode | Hot Reload | Native Modules | Use Case |
|---|---|---|---|
| Expo Go | ✅ | ❌ | Quick JS testing |
| Dev Client | ✅ | ✅ | Active development |
| Release APK/AAB | ❌ | ✅ | QA / Play upload (signed) |
| EAS Build | ❌ | ✅ | Store submission |

- **Press `s`** after `npx expo start` to switch from Expo Go to the installed dev client, then **`a`** to launch on Android.
- **Tip:** Enable **Quick Boot** in AVD Manager and store AVDs on an SSD for faster emulator startup.

---

## Local Signing

Local release builds are signed with the same **upload key** EAS uses, so Play accepts AABs built
on this PC. The key exists in three places: Expo's servers (used by `eas build`), this project
folder (used by local builds), and a personal backup.

| File | Content | Git |
|---|---|---|
| `credentials.json` | keystore path, alias, passwords | ignored |
| `credentials/android/keystore.jks` | the upload key | ignored |

**One-time setup** (interactive, run in a terminal):

```bash
eas credentials -p android
# → production → "credentials.json: Upload/Download credentials between EAS servers and your local json"
# → "Download credentials from EAS to credentials.json"
```

**How it works:** `src/plugins/withReleaseSigning.js` appends a block to the generated
`android/app/build.gradle` that reads `credentials.json` at build time, so no password is copied
into generated files. Without the file (e.g. on EAS), nothing changes and EAS signs as before.
`eas.json` keeps the default `credentialsSource: "remote"`.

**Check a build's signature:**

```bash
keytool -printcert -jarfile android/app/build/outputs/bundle/release/app-release.aab
```

The SHA-1 must match Play Console → **Test and release → App integrity → Upload key certificate**
(not the App signing key, which is Google's).

**Rules:**
- Never commit `credentials.json` or the `.jks`. Keep a backup in a password manager.
- If the upload key is ever reset, update **both** copies: the local files, and EAS via
  `eas credentials` → "Upload credentials from credentials.json to EAS".
- A lost upload key is recoverable: Play App Signing lets Google reset it (72 h wait).

---

## Android Permissions

| Permission | Why |
|---|---|
| `POST_NOTIFICATIONS` | Display task-reminder notifications (Android 13+) |
| `SCHEDULE_EXACT_ALARM` | Fire reminders at the exact scheduled time (Android 12+); user-revocable |
| `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` | Show the one-tap battery-optimization "Allow" dialog |
| `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` | Save/read JSON backup files (scoped to ≤ API 32) |

> **Battery optimization:** reminders can fire late or not at all under Doze. The Settings screen reads
> the exemption state (`expo-battery`) and either shows the one-tap allow dialog or opens the
> battery-optimization list so the user can exclude the app — required for reliable exact-alarm delivery
> on many OEMs.

---

## Getting Device Logs

### Android

```bash
adb logcat -c                                    # clear logs
adb logcat | grep -i "error\|exception\|fatal"   # filtered output
adb logcat -v time *:E *:F                       # timestamped errors/fatals
adb logcat > crash_log.txt                       # log to file (Ctrl+C to stop)
adb logcat *:S ReactNative:V ReactNativeJS:V     # React Native specific
```

### iOS

Xcode → **Window → Devices and Simulators → View Device Logs**

---

## Common Build Errors

### `Unable to delete file '...classes.jar'` (Windows file lock)

**Symptom:**
```
Execution failed for task ':expo-modules-core:bundleLibCompileToJarDebug'.
> Unable to delete file '...\classes.jar'
```

**Cause:** A Gradle daemon or Java process is holding a lock on a build artifact from a previous build.

**Fix:**
```bash
# 1. Stop all Gradle daemons
cd android && ./gradlew --stop && cd ..

# 2. Kill any remaining Java processes (run in a regular terminal, not Git Bash)
taskkill /F /IM java.exe

# 3. Retry the build
npx expo run:android
```

---

## OTA Updates (EAS Update)

This app uses **EAS Update** (`expo-updates`) to ship JS/asset changes without a full store release.

### How It Works

- `expo-updates` checks `updates.url` on launch (`runtimeVersion` policy: `appVersion`)
- The app sends its `channel` and `runtimeVersion` to the server
- If a matching update exists, it downloads and applies on next launch
- **Only JS and assets change** — native changes still require a full build

### Publishing an Update

> Do **not** bump `version` or `versionCode` for OTA — those are for store releases only.

```bash
# All platforms
eas update --branch production --platform all --message "fix: description"

# Android only
eas update --branch production --platform android --message "fix: description"
```

### Rules

- OTA works only when `runtimeVersion` matches the installed build
- Native code changes (new packages, permissions, `android/` edits) require a full EAS build
- After a full EAS build, resume publishing OTA updates as normal

---

## Dependency Update Workflow

### Workflow A — Careful (recommended for native-heavy projects)

```bash
# 0. Backup
git add . && git commit -m "Backup before update"

# 1. Check outdated
npx ncu --dep dev   # devDependencies only
npx ncu             # all packages

# 2. Update devDependencies (safe)
npx ncu --dep dev -u && npm install

# 3. Update native packages — patch/minor only, one at a time
npm install <pkg>@latest

# 4. Clear caches and verify
rm -rf node_modules android package-lock.json
npm cache clean --force
npm install
npx expo-doctor
npx expo start -c
```

> If `SocketTimeoutException` on Metro connect: `npx expo start -c --tunnel`

### Workflow B — Expo-first (simpler)

```bash
# 0. Backup
git add . && git commit -m "Backup before update"

# 1. Update all packages
npx npm-check-updates -u && npm install

# 2. Let Expo fix compatibility
npx expo-doctor
npx expo install --check

# 3. Clear caches
rm -rf node_modules android package-lock.json
npm cache clean --force
npm install && npx expo start -c
```

To pin a package Expo keeps flagging, add it to `package.json`:

```json
"expo": {
  "install": {
    "exclude": ["<package-name>"]
  }
}
```

### Rules of Thumb

| Package Type | Update Rule |
|---|---|
| DevDependencies | Update freely |
| Pure JS packages | Update freely |
| Native/community packages | Minor/patch only — test builds |
| Expo SDK & core | `npx expo install --check` / SDK upgrade only — never bump manually |

### Temporary workarounds — remove when fixed upstream

- **react-native-screens: taps die after rotation** ([#4551](https://github.com/software-mansion/react-native-screens/issues/4551)).
  On 4.26.x, rotating while a screen with a native header (e.g. Home) is covered, then going back to it,
  leaves it measured ~one header height off — presses show feedback but `onPress` never fires.
  Worked around in `src/app/_layout.tsx` with
  `featureFlags.experiment.androidResetScreenShadowStateOnOrientationChangeEnabled = false`.
  **When updating `react-native-screens`, check whether the release includes
  [PR #4760](https://github.com/software-mansion/react-native-screens/pull/4760); if yes, delete those lines**,
  rebuild, and re-test: open Reminders from Home, rotate, go back, tap a label card.
