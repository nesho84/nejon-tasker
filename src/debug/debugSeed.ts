import { labelBgColors } from "@/constants/colors";
import { getDB } from "@/db/database";
import * as LabelsRepo from "@/db/label.repo";
import * as TasksRepo from "@/db/task.repo";
import { cancelScheduledNotification, scheduleNotification } from "@/services/notificationsService";
import { useLabelStore } from "@/store/labelStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTaskStore } from "@/store/taskStore";
import { Label } from "@/types/label.types";
import { Translations } from "@/types/language.types";
import { Task } from "@/types/task.types";
import uuid from "react-native-uuid";

// ============================================================
// Debug-only: dummy data for debugging (volume — for scroll/perf tests).
// Not referenced in production code paths — only the DebugPanel
// (rendered behind __DEV__ or debug mode) calls these.
// ============================================================

// --- Tunables: bump these for more/less volume ---
const LABEL_COUNT = 16;          // active labels generated
const TASKS_MIN = 8;             // min tasks per label
const TASKS_MAX = 20;            // max tasks per label
// Per-task state probabilities
const P_CHECKED = 0.25;
const P_FAVORITE = 0.12;
const P_DELETED = 0.08;
const P_REMINDER = 0.18;         // of those, some past / some future (see below)
const P_REMINDER_PAST = 0.25;    // fraction of reminders that are overdue

// Relative ISO timestamp helper (offset in minutes from now; negative = past)
function isoOffset(minutes: number): string {
    return new Date(Date.now() + minutes * 60_000).toISOString();
}

const HOUR = 60;
const DAY = 24 * HOUR;

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]): T => arr[rand(0, arr.length - 1)];
const chance = (p: number) => Math.random() < p;

// ------------------------------------------------------------
// Content pools — composed for varied, sometimes long, task text
// ------------------------------------------------------------
const LABEL_NAMES = [
    "Work", "Personal", "Shopping", "Health", "Ideas", "Home", "Finance",
    "Travel", "Study", "Errands", "Projects", "Fitness", "Reading",
    "Groceries", "Family", "Side Hustle", "Garden", "Car", "Pets", "Music",
];
const CATEGORIES = ["Productivity", "Life", "Wellness", "Finance", "Learning", "Leisure", null];

const VERBS = [
    "Finish", "Review", "Call", "Email", "Buy", "Schedule", "Plan", "Fix",
    "Update", "Read", "Write", "Book", "Renew", "Clean", "Organize", "Pay",
    "Prepare", "Cancel", "Research", "Backup", "Submit", "Reply to", "Draft",
];
const NOUNS = [
    "the quarterly report", "the dentist appointment", "the grocery list",
    "the onboarding deck", "mom about the weekend", "the gym membership",
    "the kitchen sink", "the project proposal", "the tax documents",
    "the flight tickets", "the book club notes", "the team standup agenda",
    "the birthday gift for Sara", "the running shoes", "the car insurance",
    "the meeting notes", "the blog post draft", "the photo backup",
    "the expense report", "the bookshelf", "the vacation itinerary",
    "the password manager", "the newsletter", "the design review",
];
const SUFFIXES = [
    "", "", "", " before Friday", " (urgent)", " — low priority",
    " this week", " when I get a chance", " and double-check the details",
    " then follow up with the team to confirm everyone is on the same page",
];

function makeTaskText(): string {
    return `${pick(VERBS)} ${pick(NOUNS)}${pick(SUFFIXES)}`.trim();
}

// ------------------------------------------------------------
// Build N labels (cycling colors/categories) plus one soft-deleted label
// ------------------------------------------------------------
function buildLabels(): Label[] {
    const now = isoOffset(0);
    const make = (over: Partial<Label>, i: number): Label => ({
        id: uuid.v4() as string,
        title: "",
        color: labelBgColors[i % labelBgColors.length],
        category: CATEGORIES[i % CATEGORIES.length],
        order_position: i,
        isFavorite: i % 4 === 0, // every 4th label favorited
        isDeleted: false,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
        ...over,
    });

    const labels: Label[] = [];
    for (let i = 0; i < LABEL_COUNT; i++) {
        labels.push(make({ title: LABEL_NAMES[i % LABEL_NAMES.length] }, i));
    }
    // One soft-deleted label (shows in trash / exercises cascade behavior)
    labels.push(make({ title: "Archived Project", isDeleted: true, deletedAt: isoOffset(-3 * DAY) }, LABEL_COUNT));
    return labels;
}

// ------------------------------------------------------------
// Overdue reminder timestamp — display-only, never actually scheduled
// ------------------------------------------------------------
function makePastReminder(): string {
    return isoOffset(-rand(1, 5) * DAY);
}

// ------------------------------------------------------------
// Future reminder timestamp — pushed several months out on purpose, so a real
// scheduled notification never fires mid-debugging-session by accident.
// ------------------------------------------------------------
function makeFutureReminder(): string {
    return isoOffset(rand(90, 270) * DAY);
}

// ------------------------------------------------------------
// Build tasks for every label (TASKS_MIN..TASKS_MAX each). Past reminders are
// fake (display-only — nothing left to fire); future ones get a real OS
// notification scheduled so reminder delivery can actually be tested.
// ------------------------------------------------------------
async function buildTasks(labels: Label[], tr: Translations): Promise<Task[]> {
    const tasks: Task[] = [];

    for (const label of labels) {
        const count = rand(TASKS_MIN, TASKS_MAX);
        for (let i = 0; i < count; i++) {
            const now = isoOffset(0);
            const hasReminder = chance(P_REMINDER);
            const isPast = hasReminder && chance(P_REMINDER_PAST);
            const reminderDateTime = hasReminder ? (isPast ? makePastReminder() : makeFutureReminder()) : null;

            const task: Task = {
                id: uuid.v4() as string,
                labelId: label.id,
                text: makeTaskText(),
                date: now,
                checked: chance(P_CHECKED),
                order_position: i,
                reminderDateTime,
                reminderId: null,
                isFavorite: chance(P_FAVORITE),
                isDeleted: chance(P_DELETED),
                deletedAt: null,
                createdAt: now,
                updatedAt: now,
            };

            if (hasReminder) {
                task.reminderId = isPast ? `seed-${uuid.v4()}` : await scheduleNotification(task, tr);
            }

            tasks.push(task);
        }
    }

    // Backfill deletedAt for soft-deleted tasks
    for (const t of tasks) {
        if (t.isDeleted) t.deletedAt = isoOffset(-rand(1, 72) * HOUR);
    }

    return tasks;
}

// ------------------------------------------------------------
// Wipe every label + task from the database and refresh stores
// ------------------------------------------------------------
export async function clearAllData(): Promise<void> {
    // Cancel any real OS notifications before wiping rows, or they'd still
    // fire later even though the tasks backing them no longer exist.
    const existingTasks = await TasksRepo.loadAllTasks();
    for (const task of existingTasks) {
        if (task.reminderId) {
            await cancelScheduledNotification(task.reminderId);
        }
    }

    const db = await getDB();
    await db.withTransactionAsync(async () => {
        // tasks first (FK), though labels would cascade anyway
        await db.runAsync("DELETE FROM tasks;");
        await db.runAsync("DELETE FROM labels;");
    });

    await useLabelStore.getState().loadLabels();
    await useTaskStore.getState().loadTasks();
    console.log("🧹 [seed] Cleared all labels and tasks");
}

// ------------------------------------------------------------
// Wipe, then insert a large generated dummy set, then refresh stores
// ------------------------------------------------------------
export async function seedDummyData(): Promise<void> {
    await clearAllData();

    const tr = useLanguageStore.getState().tr;
    const labels = buildLabels();
    const tasks = await buildTasks(labels, tr);

    const db = await getDB();
    await db.withTransactionAsync(async () => {
        for (const label of labels) {
            await LabelsRepo.insertLabel(label);
        }
        for (const task of tasks) {
            await TasksRepo.insertTask(task);
        }
    });

    await useLabelStore.getState().loadLabels();
    await useTaskStore.getState().loadTasks();
    console.log(`🌱 [seed] Inserted ${labels.length} labels and ${tasks.length} tasks`);
}
