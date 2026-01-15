import { createBackup, getLastBackupInfo, restoreBackup } from '@/services/backupService';
import { useLabelStore } from '@/store/labelStore';
import { useLanguageStore } from '@/store/languageStore';
import { useTaskStore } from '@/store/taskStore';
import { useThemeStore } from '@/store/themeStore';
import { dates } from '@/utils/dates';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function BackupSection() {
    const { theme } = useThemeStore();
    const { tr } = useLanguageStore();

    // Local State
    const [lastBackup, setLastBackup] = useState<{ date: string; labelsCount: number; tasksCount: number } | null>(null);
    const [isCreatingBackup, setIsCreatingBackup] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    // Stores
    const { labels } = useLabelStore();
    const { allTasks } = useTaskStore();

    // Check if there is any data to backup
    const hasData = labels.length > 0 || allTasks.length > 0;

    // ------------------------------------------------------------
    // Load last backup info on mount
    // ------------------------------------------------------------
    useEffect(() => {
        loadBackupInfo();
    }, []);

    // ------------------------------------------------------------
    // Load Backup Info
    // ------------------------------------------------------------
    const loadBackupInfo = async () => {
        const info = await getLastBackupInfo();
        setLastBackup(info);
    };

    // ------------------------------------------------------------
    // Handle Create Backup
    // ------------------------------------------------------------
    const handleCreateBackup = async () => {
        if (!hasData) {
            Alert.alert('No Data', 'There is no data to backup.');
            return;
        }

        try {
            setIsCreatingBackup(true);
            await createBackup();

            // Reload backup info only after successful share
            await loadBackupInfo();

            // Show success alert
            Alert.alert(
                'Success',
                'Backup file has been successfully created. Make sure to save it to a safe location!'
            );
        } catch (error: any) {
            if (error.message === 'Permission denied') {
                // User cancelled the folder picker
                return;
            }
            Alert.alert('Error', 'Failed to create backup. Please try again.');
        } finally {
            setIsCreatingBackup(false);
        }
    };

    // ------------------------------------------------------------
    // Handle Restore Backup
    // ------------------------------------------------------------
    const handleRestoreBackup = async () => {
        Alert.alert(
            'Restore Backup',
            'This will restore data from a backup file. Existing data with the same IDs will be replaced. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restore',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsRestoring(true);
                            const result = await restoreBackup();

                            Alert.alert(
                                'Success',
                                `Restored ${result.labelsCount} labels and ${result.tasksCount} tasks!`
                            );
                        } catch (error: any) {
                            if (error.message === 'Cancelled') {
                                // User cancelled, do nothing
                            } else if (error.message === 'Invalid JSON file') {
                                Alert.alert('Error', 'The selected file is not a valid backup file.');
                            } else if (error.message === 'Invalid backup file format or wrong app backup') {
                                Alert.alert('Error', 'This backup file is not compatible with this app.');
                            } else {
                                Alert.alert('Error', 'Failed to restore backup. Please try again.');
                            }
                        } finally {
                            setIsRestoring(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Last Backup Info */}
            {lastBackup ? (
                <View style={[styles.infoCard, { backgroundColor: theme.borderLight }]}>
                    <Text style={[styles.infoLabel, { color: theme.info }]}>Last Backup</Text>
                    <Text style={[styles.infoDate, { color: theme.muted }]}>{dates.format(lastBackup.date)}</Text>
                    <Text style={[styles.infoDetails, { color: theme.text }]}>
                        {lastBackup.labelsCount} labels • {lastBackup.tasksCount} tasks
                    </Text>
                </View>
            ) : (
                <View style={[styles.infoCard, { backgroundColor: theme.borderLight }]}>
                    <Text style={[styles.noBackupText, { color: theme.warning }]}>No backup yet</Text>
                </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
                {/* Create Backup Button */}
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: hasData ? theme.lightLight : theme.muted }]}
                    onPress={handleCreateBackup}
                    disabled={!hasData || isCreatingBackup || isRestoring}
                >
                    {isCreatingBackup ? (
                        <ActivityIndicator color={theme.info} size="small" />
                    ) : (
                        <>
                            <Text style={styles.buttonIcon}>💾</Text>
                            <Text style={styles.buttonText}>Backup</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Restore Backup Button */}
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.borderLight }]}
                    onPress={handleRestoreBackup}
                    disabled={isCreatingBackup || isRestoring}
                >
                    {isRestoring ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Text style={styles.buttonIcon}>📥</Text>
                            <Text style={styles.buttonText}>Restore</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Help Text */}
            {!hasData && (
                <Text style={styles.helpText}>
                    Create some labels and tasks first
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
    },
    infoCard: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    infoDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    infoDetails: {
        fontSize: 14,
        color: '#666',
    },
    noBackupText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonIcon: {
        fontSize: 18,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    helpText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
    },
});