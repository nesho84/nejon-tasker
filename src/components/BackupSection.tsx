import { createBackup, getLastBackupInfo, restoreBackup } from '@/services/backupService';
import { useLabelStore } from '@/store/labelStore';
import { useLanguageStore } from '@/store/languageStore';
import { useTaskStore } from '@/store/taskStore';
import { useThemeStore } from '@/store/themeStore';
import { dates } from '@/utils/dates';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
            Alert.alert(tr.alerts.backup.error1.title, tr.alerts.backup.error1.message);
            return;
        }

        // Give user choice on Android
        if (Platform.OS === 'android') {
            Alert.alert(
                tr.alerts.backup.info2.title,
                tr.alerts.backup.info2.message1,
                [
                    {
                        text: tr.buttons.cancel,
                        style: 'cancel'
                    },
                    {
                        text: tr.alerts.backup.info2.message2,
                        onPress: () => performBackup(false)
                    },
                    {
                        text: tr.alerts.backup.info2.message3,
                        onPress: () => performBackup(true)
                    }
                ]
            );
        } else {
            // iOS always uses share sheet
            performBackup(true);
        }
    };

    // ------------------------------------------------------------
    // Perform Backup
    // ------------------------------------------------------------
    const performBackup = async (sharing: boolean) => {
        try {
            setIsCreatingBackup(true);
            await createBackup(sharing);

            // Reload backup info after successful save
            await loadBackupInfo();

            // Show success alert
            Alert.alert(tr.alerts.backup.success1.title, tr.alerts.backup.success1.message);
        } catch (error: any) {
            if (error.message === 'Permission denied') {
                // User cancelled or denied the folder picker
                return;
            }
            Alert.alert(tr.alerts.backup.error2.title, tr.alerts.backup.error2.message);
        } finally {
            setIsCreatingBackup(false);
        }
    };

    // ------------------------------------------------------------
    // Handle Restore Backup
    // ------------------------------------------------------------
    const handleRestoreBackup = async () => {
        Alert.alert(
            tr.alerts.backup.info1.title,
            tr.alerts.backup.info1.message,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: tr.labels.restore,
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsRestoring(true);
                            const result = await restoreBackup();

                            Alert.alert(
                                tr.labels.success,
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
                <View style={[styles.infoCard, { borderColor: theme.border }]}>
                    <Text style={[styles.infoLabel, { color: theme.info }]}>{tr.labels.lastBackup}</Text>
                    <Text style={[styles.infoDate, { color: theme.muted }]}>{dates.format(lastBackup.date)}</Text>
                    <Text style={[styles.infoDetails, { color: theme.text }]}>
                        {lastBackup.labelsCount} {tr.labels.labels} • {lastBackup.tasksCount} {tr.labels.tasks}
                    </Text>
                </View>
            ) : (
                <View style={[styles.infoCard, { borderColor: theme.border }]}>
                    <Text style={[styles.noBackupText, { color: theme.warning }]}>{tr.labels.noBackup}</Text>
                </View>
            )}

            {/* Backup Buttons */}
            <View style={styles.backupButtonsContainer}>
                {/* Create Backup Button */}
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: hasData ? theme.lightLight : theme.muted }]}
                    onPress={handleCreateBackup}
                    disabled={!hasData || isCreatingBackup || isRestoring}
                >
                    {isCreatingBackup ? (
                        <ActivityIndicator color={theme.info} size="small" />
                    ) : (
                        <View style={styles.backupButtonsContent}>
                            <MaterialIcons name="save-alt" size={20} color={theme.success} />
                            <Text style={[styles.buttonText, { color: theme.text }]}>Backup</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Restore Backup Button */}
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.borderLight }]}
                    onPress={handleRestoreBackup}
                    disabled={isCreatingBackup || isRestoring}
                >
                    {isRestoring ? (
                        <ActivityIndicator color={theme.info} size="small" />
                    ) : (
                        <View style={styles.backupButtonsContent}>
                            <MaterialCommunityIcons name="backup-restore" size={20} color={theme.danger} />
                            <Text style={[styles.buttonText, { color: theme.text }]}>{tr.labels.restore}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Help Text */}
            {!hasData && (
                <View style={styles.backupButtonsContent}>
                    <Text style={[styles.helpText, { color: theme.danger }]}>
                        {tr.labels.backupHelp}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 18,
    },
    infoCard: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 14,
        borderWidth: 1,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    infoDate: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoDetails: {
        fontSize: 14,
    },
    noBackupText: {
        fontSize: 14,
        textAlign: 'center',
    },

    backupButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    backupButtonsContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
    },

    helpText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
});