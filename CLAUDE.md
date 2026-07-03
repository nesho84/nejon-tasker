# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Expo SDK version

This project is on **Expo SDK 57 / React Native 0.86 / React 19**. Expo APIs change between
major versions — consult the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before
writing any Expo/RN code (see `AGENTS.md`). Do not assume APIs from other SDK versions.

## Commands

```bash
npm run lint                 # expo lint (eslint-config-expo, flat config)
npx tsc --noEmit             # typecheck (strict mode is on)

npx expo start               # Metro for Expo Go (JS-only, no native modules)
npx expo run:android         # build + install dev-client APK (needed for native modules)
npx expo prebuild --clean    # regenerate android/ after native config changes
```

Native modules (`expo-sqlite`, `expo-notifications`, `expo-battery`, `expo-intent-launcher`,
`react-native-reanimated`, `react-native-gesture-handler`, `react-native-draggable-flatlist`)
**do not work in Expo Go** — use the dev client. There is no Jest suite; verify with
`npx tsc --noEmit` and `npm run lint`. See `README.md` for the full build/EAS/OTA workflow.

## Path aliases

- `@/*` → `src/*`
- `@/assets/*` → `assets/*`

## Architecture

Detailed architecture (data layer, stores, routing, notifications, backup) lives in `README.md`
under "Architecture" — read it before making cross-cutting changes. Key points to internalize:

- **Routing** is Expo Router (file-based). `src/app/_layout.tsx` initializes SQLite and loads the
  task/label stores *before* rendering (shows `AppLoading` until ready), then gates the app behind
  `onboardingStore.onboardingComplete` using `<Stack.Protected>`. Route groups: `(main)`
  (a `react-native-drawer-layout` Drawer over a Stack), `(modals)` (transparent bottom sheets),
  `(onboarding)`.

- **Data is two-tier.** Domain data (tasks, labels) lives in **SQLite** (`expo-sqlite`, `tasks.db`):
  `src/db/database.ts` owns the schema/`setupDatabase`, `task.repo.ts` / `label.repo.ts` own the
  queries. The Zustand stores `taskStore` / `labelStore` are in-memory caches that load from the
  repos at startup (`loadTasks` / `loadLabels` in `RootLayout`) and **write through to SQLite on
  every mutation**. Components read stores; stores call repos — never query SQLite from a component.

- **Settings stores** (`themeStore`, `languageStore`, `onboardingStore`) are persisted with Zustand's
  `persist` middleware + **AsyncStorage** (not SQLite, not the same path as the SQLite data).

- **Notifications** use **expo-notifications** (not notifee). `useNotifications` (`src/hooks`) owns
  permission requests, the task-reminder scheduler (a `DATE` trigger so Android fires at the exact
  clock time), and the Android settings deep-links: battery-optimization (status read via
  `expo-battery.isBatteryOptimizationEnabledAsync()`, opened via `expo-intent-launcher`) and the
  exact-alarm screen. Exact alarms need `SCHEDULE_EXACT_ALARM`; reliable Doze delivery needs the
  battery-optimization exemption. `USE_EXACT_ALARM` is deliberately **not** declared (it would lock
  the alarm toggle on and is Play-restricted).

- **Backup** (`src/services/backupService.ts`) exports/imports a JSON snapshot of labels + tasks via
  `expo-file-system` / `expo-sharing` / `expo-document-picker`.

- **i18n**: `languageStore` holds the active language; strings live in `src/constants/translations.ts`
  (one file, per-language objects). Supported: English, German (`de`), Albanian (`sq`).

- **Shared screen frame**: wrap new screens in `src/components/AppScreen.tsx` (StatusBar +
  `SafeAreaView edges={['left','right']}` + NavigationBar style). Do **not** add a `bottom` safe-area
  edge — apply the bottom inset to scroll/list content via `useSafeAreaInsets()`
  (`paddingBottom: insets.bottom + N`), matching `about.tsx` and the list screens.
