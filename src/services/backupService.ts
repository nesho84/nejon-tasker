import { getDB } from "@/db/database";
import { useLabelStore } from '@/store/labelStore';
import { useTaskStore } from '@/store/taskStore';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const BACKUP_INFO_KEY = 'last_backup_info';
const BACKUP_VERSION = '1.0';

interface BackupData {
    version: string;
    appName: string; // To identify your app's backup
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
        const file = new File(Paths.document, `${BACKUP_INFO_KEY}.json`);
        await file.write(jsonInfo);
    } catch (error) {
        console.error('Failed to save backup info:', error);
    }
}

// ------------------------------------------------------------
// Get last backup info
// ------------------------------------------------------------
export async function getLastBackupInfo(): Promise<BackupInfo | null> {
    try {
        const file = new File(Paths.document, `${BACKUP_INFO_KEY}.json`);

        if (!file.exists) {
            return null;
        }

        const content = await file.text();
        return JSON.parse(content);
    } catch (error) {
        console.error('Failed to read backup info:', error);
        return null;
    }
}

// ------------------------------------------------------------
// Create and share backup
// ------------------------------------------------------------
export async function createBackup(): Promise<void> {
    const db = await getDB();
    try {
        // Get all data from database
        const labels = db.getAllSync('SELECT * FROM labels');
        const tasks = db.getAllSync('SELECT * FROM tasks');

        // Check if there's any data
        if (labels.length === 0 && tasks.length === 0) {
            throw new Error('No data to backup');
        }

        // Create backup object with app identifier
        const backup: BackupData = {
            version: BACKUP_VERSION,
            appName: 'YourAppName', // Change this to your app name
            exportDate: new Date().toISOString(),
            labels,
            tasks,
        };

        // Convert to JSON
        const jsonData = JSON.stringify(backup, null, 2);

        // Create file
        const fileName = `backup_${new Date().getTime()}.json`;
        const file = new File(Paths.document, fileName);

        // Write to file
        await file.write(jsonData);

        // Save backup info
        await saveBackupInfo({
            date: new Date().toISOString(),
            labelsCount: labels.length,
            tasksCount: tasks.length,
        });

        // Share the file
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
            await Sharing.shareAsync(file.uri, {
                mimeType: 'application/json',
                dialogTitle: 'Save Backup',
            });
        } else {
            throw new Error('Sharing not available');
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
    // Check required fields
    if (!backup.version || !backup.appName || !backup.exportDate) {
        return false;
    }

    // Check app name matches (prevent importing other app's backups)
    if (backup.appName !== 'YourAppName') {
        return false;
    }

    // Check arrays exist
    if (!Array.isArray(backup.labels) || !Array.isArray(backup.tasks)) {
        return false;
    }

    // Validate label structure (check at least one label if exists)
    if (backup.labels.length > 0) {
        const label = backup.labels[0];
        if (!label.id || !label.title || !label.color) {
            return false;
        }
    }

    // Validate task structure (check at least one task if exists)
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
            type: 'application/json',
            copyToCacheDirectory: true,
        });

        if (result.canceled) {
            throw new Error('Cancelled');
        }

        // Read the file
        const file = new File(result.assets[0].uri);
        const fileContent = await file.text();

        // Parse JSON
        let backup: any;
        try {
            backup = JSON.parse(fileContent);
        } catch (error) {
            throw new Error('Invalid JSON file');
        }

        // Validate backup
        if (!validateBackup(backup)) {
            throw new Error('Invalid backup file format or wrong app backup');
        }

        // Import data with transaction
        db.withTransactionSync(() => {
            // Import labels
            backup.labels.forEach((label: any) => {
                db.runSync(
                    `INSERT OR REPLACE INTO labels (id, title, color, category, order_position, isFavorite, isDeleted, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        label.id,
                        label.title,
                        label.color,
                        label.category || null,
                        label.order_position || 0,
                        label.isFavorite || 0,
                        label.isDeleted || 0,
                        label.createdAt,
                        label.updatedAt,
                    ]
                );
            });

            // Import tasks
            backup.tasks.forEach((task: any) => {
                db.runSync(
                    `INSERT OR REPLACE INTO tasks (id, labelId, text, date, checked, reminderDateTime, reminderId, isFavorite, isDeleted, order_position, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        task.id,
                        task.labelId,
                        task.text,
                        task.date || null,
                        task.checked || 0,
                        task.reminderDateTime || null,
                        task.reminderId || null,
                        task.isFavorite || 0,
                        task.isDeleted || 0,
                        task.order_position || 0,
                        task.createdAt,
                        task.updatedAt,
                    ]
                );
            });
        });

        // Reload stores
        useLabelStore.getState().loadLabels();
        useTaskStore.getState().loadTasks();

        return {
            labelsCount: backup.labels.length,
            tasksCount: backup.tasks.length,
        };
    } catch (error) {
        console.error('Restore failed:', error);
        throw error;
    }
}