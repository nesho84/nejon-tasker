import { getDB } from "@/db/database";
import { scheduleNotification } from '@/services/notificationsService';
import { useLabelStore } from '@/store/labelStore';
import { useLanguageStore } from '@/store/languageStore';
import { useTaskStore } from '@/store/taskStore';
import Constants from "expo-constants";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from "react-native";

const BACKUP_INFO_KEY = 'last_backup_info';

interface BackupData {
    version: string;
    appName: string;
    exportDate: string;
    labels: any[];
    tasks: any[];
}

interface BackupInfo {
    date: string;
    labelsCount: number;
    tasksCount: number;
}

// ------------------------------------------------------------
// Save backup info to storage (last backup date and counts)
// ------------------------------------------------------------
async function saveBackupInfo(info: BackupInfo): Promise<void> {
    try {
        const jsonInfo = JSON.stringify(info);
        await FileSystem.writeAsStringAsync(
            `${FileSystem.documentDirectory}${BACKUP_INFO_KEY}.json`,
            jsonInfo
        );
    } catch (error) {
        console.error('Failed to save backup info:', error);
    }
}

// ------------------------------------------------------------
// Get last backup info
// ------------------------------------------------------------
export async function getLastBackupInfo(): Promise<BackupInfo | null> {
    try {
        const fileUri = `${FileSystem.documentDirectory}${BACKUP_INFO_KEY}.json`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (!fileInfo.exists) {
            return null;
        }

        const content = await FileSystem.readAsStringAsync(fileUri);
        return JSON.parse(content);
    } catch (error) {
        console.error('Failed to read backup info:', error);
        return null;
    }
}

// ------------------------------------------------------------
// Create and save backup (lets user choose location)
// ------------------------------------------------------------
export async function createBackup(useShareSheet: boolean = false): Promise<void> {
    const db = await getDB();
    try {
        // Get all data from database
        const labels = await db.getAllAsync('SELECT * FROM labels');
        const tasks = await db.getAllAsync('SELECT * FROM tasks');

        // Check if there's any data
        if (labels.length === 0 && tasks.length === 0) {
            throw new Error('No data to backup');
        }

        // Create backup object
        const backup: BackupData = {
            version: `${Constants?.expoConfig?.version}`,
            appName: `${Constants?.expoConfig?.name}`,
            exportDate: new Date().toISOString(),
            labels,
            tasks,
        };

        // Convert to JSON
        const jsonData = JSON.stringify(backup, null, 2);
        const fileName = `${Constants?.expoConfig?.scheme}_backup_${new Date().getTime()}.json`;

        if (useShareSheet || Platform.OS === 'ios') {
            // Use share sheet for cloud storage (Google Drive, Gmail, etc.)
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.writeAsStringAsync(fileUri, jsonData);

            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                throw new Error('Sharing not available');
            }

            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                dialogTitle: 'Save Backup',
                UTI: 'public.json',
            });

            // Save backup info
            await saveBackupInfo({
                date: new Date().toISOString(),
                labelsCount: labels.length,
                tasksCount: tasks.length,
            });
        } else {
            // Android: Use Storage Access Framework for local storage
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

            if (!permissions.granted) {
                throw new Error('Permission denied');
            }

            // Create file in user-selected directory
            const uri = await FileSystem.StorageAccessFramework.createFileAsync(
                permissions.directoryUri,
                fileName,
                'application/json'
            );

            // Write data to file
            await FileSystem.writeAsStringAsync(uri, jsonData);

            // Save backup info
            await saveBackupInfo({
                date: new Date().toISOString(),
                labelsCount: labels.length,
                tasksCount: tasks.length,
            });
        }
    } catch (error) {
        console.error('Backup failed:', error);
        throw error;
    }
}

// ------------------------------------------------------------
// Validate backup file format
// ------------------------------------------------------------
function validateBackup(backup: any): backup is BackupData {
    if (!backup.version || !backup.appName || !backup.exportDate) {
        return false;
    }

    if (backup.appName !== Constants?.expoConfig?.name) {
        return false;
    }

    if (!Array.isArray(backup.labels) || !Array.isArray(backup.tasks)) {
        return false;
    }

    if (backup.labels.length > 0) {
        const label = backup.labels[0];
        if (!label.id || !label.title || !label.color) {
            return false;
        }
    }

    if (backup.tasks.length > 0) {
        const task = backup.tasks[0];
        if (!task.id || !task.labelId || !task.text) {
            return false;
        }
    }

    return true;
}

// ------------------------------------------------------------
// Restore from backup file
// ------------------------------------------------------------
export async function restoreBackup(): Promise<{ labelsCount: number; tasksCount: number }> {
    const db = await getDB();
    try {
        // Let user pick a file
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
            multiple: false,
        });

        if (result.canceled) {
            throw new Error('Cancelled');
        }

        // Read the file
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);

        // Parse JSON
        let backup: any;
        try {
            backup = JSON.parse(fileContent);
        } catch (error) {
            console.error('Failed to parse backup file:', error);
            throw new Error('Invalid JSON format');
        }

        // Validate backup
        if (!validateBackup(backup)) {
            throw new Error('Invalid backup file format or wrong app backup');
        }

        // A backed-up reminderId never corresponds to a real OS notification on this
        // install (or it's simply expired) — reschedule the ones still in the future
        // and drop the rest, instead of trusting whatever reminderId was in the file.
        const tr = useLanguageStore.getState().tr;
        const reminderIds = new Map<string, string | null>();
        for (const task of backup.tasks) {
            const isFuture = task.reminderDateTime && new Date(task.reminderDateTime).getTime() > Date.now();
            reminderIds.set(task.id, isFuture ? await scheduleNotification(task, tr) : null);
        }

        // Import data with transaction
        await db.withTransactionAsync(async () => {
            // Import labels
            for (const label of backup.labels) {
                await db.runAsync(
                    `INSERT OR REPLACE INTO labels (id, title, color, category, order_position, isFavorite, isDeleted, deletedAt, createdAt, updatedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        label.id,
                        label.title,
                        label.color,
                        label.category || null,
                        label.order_position || 0,
                        label.isFavorite || 0,
                        label.isDeleted || 0,
                        label.deletedAt || null,
                        label.createdAt,
                        label.updatedAt,
                    ]
                );
            }

            // Import tasks
            for (const task of backup.tasks) {
                await db.runAsync(
                    `INSERT OR REPLACE INTO tasks (id, labelId, text, date, checked, reminderDateTime, reminderId, isFavorite, isDeleted, deletedAt, order_position, createdAt, updatedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        task.id,
                        task.labelId,
                        task.text,
                        task.date || null,
                        task.checked || 0,
                        task.reminderDateTime || null,
                        reminderIds.get(task.id) ?? null,
                        task.isFavorite || 0,
                        task.isDeleted || 0,
                        task.deletedAt || null,
                        task.order_position || 0,
                        task.createdAt,
                        task.updatedAt,
                    ]
                );
            }
        });

        // Reload stores
        await useLabelStore.getState().loadLabels();
        await useTaskStore.getState().loadTasks();

        return {
            labelsCount: backup.labels.length,
            tasksCount: backup.tasks.length,
        };
    } catch (error) {
        console.warn('Restore failed:', error);
        throw error;
    }
}
