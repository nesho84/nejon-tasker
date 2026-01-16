export const TRANSLATIONS = {
    // ------------------------------------------------------------
    // English
    // ------------------------------------------------------------
    en: {
        // Common labels
        labels: {
            home: "Home",
            settings: "Settings",
            profile: "Profile",
            about: "About",
            language: "Language",
            tasks: "Tasks",
            labels: "Labels",
            remaining: "Remaining",
            completed: "Completed",
            reminders: "Reminders",
            favorites: "Favorites",
            trash: "Trash",
            lastBackup: "Last Backup",
            restore: "Restore",
            success: "Success",
            backupHelp: "Create some labels and tasks first",
            of: "of",
            displayOptions: "Display Options",
            checkedItems: "Checked Items",
        },

        // Button text
        buttons: {
            save: "Save",
            cancel: "Cancel",
            submit: "Submit",
            delete: "Delete",
            edit: "Edit",
            exit: "Exit",
            yes: "Yes",
            no: "No",
            ok: "OK",
        },

        // Form inputs
        forms: {
            inputPlaceholder: "Enter text...",
            setReminder: "Set Reminder...",
            newLabel: "Create new Label",
            editLabel: "Edit Label",
            editTask: "Edit Task",
        },

        // Success/info messages
        messages: {
            loading: "Loading...",
            updateSuccess: "Update was successful",
            updateAvailable: "Update available",
            nothingToDelete: "Nothing to delete",
        },

        // Error messages
        errors: {
            somethingWrong: "Something went wrong",
            invalidDate: "Date and Time cannot be in the past",
            requiredField: "Please insert at least one or more characters",
        },

        // Alert dialogs
        alerts: {
            deleteLabel: {
                title: "Are you sure?",
                message: "Delete Label and all of its tasks!",
                message2: "This will permanently delete all associated tasks. This action cannot be undone.",
            },
            deleteTask: {
                title: "Are you sure?",
                message: "Delete Task!",
            },
            deleteAll: {
                title: "Are you sure?",
                message: "Delete all items in the Storage!",
            },
            requiredField: {
                title: "Required field",
                message: "Please insert at least one or more characters.",
            },
            invalidDate: {
                title: "Invalid Date",
                message: "Date and Time cannot be in the past.",
            },
            notificationPermission: {
                title: "Notification Permission",
                message: "You have denied notification permission. Please enable it in your device settings to receive notifications.",
            },
            // Backup alerts
            backup: {
                error1: {
                    title: "No Data",
                    message: "There is no data to backup.",
                },
                error2: {
                    title: "Error",
                    message: "Failed to create backup. Please try again.",
                },
                error3: {
                    title: "Error",
                    message: "The selected file is not a valid backup file.",
                },
                error4: {
                    title: "Error",
                    message: "This backup file is not compatible with this app.",
                },
                error5: {
                    title: "Error",
                    message: "Failed to restore backup. Please try again.",
                },
                success1: {
                    title: "Success",
                    message: "Backup file has been successfully created. Make sure to save it to a safe location!",
                },
                info1: {
                    title: "Restore Backup",
                    message: "This will restore data from a backup file. Existing data with the same IDs will be replaced. Continue?",
                },
            },
            appUpdate: {
                title: "Update",
                message: "Update was successful.",
            },
            appExit: {
                title: "Hold on!",
                message: "Are you sure you want to exit?",
            },
        },

        // Notifications
        notifications: {
            taskReminder: "Task Reminder",
        },

        // Empty states
        empty: {
            noTasks: "No Tasks to show. \n\n You can use the plus button (+) to create new tasks.",
            noLabels: "No Labels to show. \n\n You can use the plus button (+) to create new labels.",
        },

        // Settings screen specific
        settings: {
            clearStorage: "Clear Storage",
            displayOptions: "Display Options",
        },
    },

    // ------------------------------------------------------------
    // Deutsch
    // ------------------------------------------------------------
    de: {
        labels: {
            home: "Startseite",
            settings: "Einstellungen",
            profile: "Profil",
            about: "Über uns",
            language: "Sprache",
            tasks: "Aufgaben",
            labels: "Etiketten",
            remaining: "Verbleibend",
            completed: "Abgeschlossen",
            reminders: "Erinnerungen",
            favorites: "Favoriten",
            trash: "Gelöscht",
            lastBackup: "Letzte Backup",
            restore: "Wiederherstellen",
            success: "Erfolg",
            backupHelp: "Erstellen Sie zuerst einige Etiketten und Aufgaben",
            of: "von",
            displayOptions: "Anzeigeoptionen",
            checkedItems: "Abgeschlossene Aufgaben",
        },

        buttons: {
            save: "Speichern",
            cancel: "Stornieren",
            submit: "Einreichen",
            delete: "Löschen",
            edit: "Bearbeiten",
            exit: "Beenden",
            yes: "Ja",
            no: "Nein",
            ok: "OK",
        },

        forms: {
            inputPlaceholder: "Text eingeben...",
            setReminder: "Erinnerung einstellen...",
            newLabel: "Neues Etikett erstellen",
            editLabel: "Etikett bearbeiten",
            editTask: "Aufgabe bearbeiten",
        },

        messages: {
            loading: "Wird geladen...",
            updateSuccess: "Update war erfolgreich",
            updateAvailable: "Update verfügbar",
            nothingToDelete: "Nichts zu löschen",
        },

        errors: {
            somethingWrong: "Etwas ist schief gelaufen",
            invalidDate: "Datum und Uhrzeit dürfen nicht in der Vergangenheit liegen",
            requiredField: "Bitte fügen Sie mindestens ein oder mehrere Zeichen ein",
        },

        alerts: {
            deleteLabel: {
                title: "Sind Sie sicher?",
                message: "Etikett und alle seine Aufgaben löschen!",
                message2: "Dies löscht alle zugehörigen Aufgaben dauerhaft. Diese Aktion kann nicht rückgängig gemacht werden.",
            },
            deleteTask: {
                title: "Sind Sie sicher?",
                message: "Aufgabe löschen!",
            },
            deleteAll: {
                title: "Sind Sie sicher?",
                message: "Alle Elemente im Speicher löschen!",
            },
            requiredField: {
                title: "Pflichtfeld",
                message: "Bitte fügen Sie mindestens ein oder mehrere Zeichen ein.",
            },
            invalidDate: {
                title: "Datum ungültig",
                message: "Datum und Uhrzeit dürfen nicht in der Vergangenheit liegen.",
            },
            notificationPermission: {
                title: "Benachrichtigungsberechtigung",
                message: "Sie haben die Benachrichtigungsberechtigung verweigert. Bitte aktivieren Sie es in Ihren Geräteeinstellungen, um Benachrichtigungen zu erhalten.",
            },
            backup: {
                error1: {
                    title: "Keine Daten",
                    message: "Es gibt keine Daten zum Sichern.",
                },
                error2: {
                    title: "Fehler",
                    message: "Backup konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
                },
                error3: {
                    title: "Fehler",
                    message: "Die ausgewählte Datei ist keine gültige Backup-Datei.",
                },
                error4: {
                    title: "Fehler",
                    message: "Diese Backup-Datei ist mit dieser App nicht kompatibel.",
                },
                error5: {
                    title: "Fehler",
                    message: "Backup konnte nicht wiederhergestellt werden. Bitte versuchen Sie es erneut.",
                },
                success1: {
                    title: "Erfolg",
                    message: "Die Backup-Datei wurde erfolgreich erstellt. Stellen Sie sicher, dass Sie sie an einem sicheren Ort speichern!",
                },
                info1: {
                    title: "Backup wiederherstellen",
                    message: "Dadurch werden Daten aus einer Backup-Datei wiederhergestellt. Vorhandene Daten mit denselben IDs werden ersetzt. Fortfahren?",
                },
            },
            appUpdate: {
                title: "Update",
                message: "Update war erfolgreich.",
            },
            appExit: {
                title: "Warten Sie mal!",
                message: "Sind Sie sicher, dass Sie beenden wollen?",
            },
        },

        notifications: {
            taskReminder: "Aufgabenerinnerung",
        },

        empty: {
            noTasks: "Keine Aufgaben zu zeigen. \n\n Mit der Plus-Taste (+) können Sie neue Aufgaben erstellen.",
            noLabels: "Keine Etiketten zu zeigen. \n\n Mit der Plus-Taste (+) können Sie neue Etiketten erstellen.",
        },

        settings: {
            clearStorage: "Datenbank löschen",
            displayOptions: "Anzeigeoptionen",
        },
    },

    // ------------------------------------------------------------
    // Shqip
    // ------------------------------------------------------------
    al: {
        labels: {
            home: "Ballina",
            settings: "Cilësimet",
            profile: "Profili",
            about: "Rreth nesh",
            language: "Gjuha",
            tasks: "Detyra",
            labels: "Etiketa",
            remaining: "Të mbetura",
            completed: "Përfunduar",
            reminders: "Kujtesa",
            favorites: "Të preferuarat",
            trash: "Të fshirë",
            lastBackup: "Backup i fundit",
            restore: "Rikthe",
            success: "Sukses",
            of: "prej",
            backupHelp: "Së pari Krijo disa etiketa dhe detyra",
            displayOptions: "Opsionet e shfaqjes",
            checkedItems: "Detyra të kryera",
        },

        buttons: {
            save: "Ruaj",
            cancel: "Anulo",
            submit: "Dërgo",
            delete: "Fshij",
            edit: "Ndrysho",
            exit: "Dalje",
            yes: "Po",
            no: "Jo",
            ok: "OK",
        },

        forms: {
            inputPlaceholder: "Shkruaj tekst...",
            setReminder: "Cakto kujtesën...",
            newLabel: "Krijo etiketë të re",
            editLabel: "Ndrysho etiketën",
            editTask: "Ndrysho detyrën",
        },

        messages: {
            loading: "Ngarkohet...",
            updateSuccess: "Aktualizimi ishte i suksesshëm",
            updateAvailable: "Përditësim i disponueshëm",
            nothingToDelete: "Asgjë për të fshirë",
        },

        errors: {
            somethingWrong: "Diçka shkoi keq",
            invalidDate: "Data dhe ora nuk mund të jenë në të kaluarën",
            requiredField: "Ju lutemi shkruani të paktën një ose më shumë karaktere",
        },

        alerts: {
            deleteLabel: {
                title: "A jeni të sigurt?",
                message: "Fshij etiketën dhe të gjitha detyrat!",
                message2: "Kjo do të fshijë përgjithmonë të gjitha detyrat. Kjo veprim nuk mund të zhbëhet.",
            },
            deleteTask: {
                title: "A jeni të sigurt?",
                message: "Fshij detyrën!",
            },
            deleteAll: {
                title: "A jeni të sigurt?",
                message: "Fshij bazën e të dhënave!",
            },
            requiredField: {
                title: "Fushë e detyrueshme",
                message: "Ju lutemi shkruani të paktën një ose më shumë karaktere.",
            },
            invalidDate: {
                title: "Data e pavlefshme",
                message: "Data dhe ora nuk mond të jenë në të kaluarën.",
            },
            notificationPermission: {
                title: "Leja e njoftimit",
                message: "Ju keni refuzuar lejen e njoftimit. Ju lutemi aktivizoni atë në opsionet e pajisjes tuaj për të marrë njoftime.",
            },
            backup: {
                error1: {
                    title: "Asnjë të dhënë",
                    message: "Nuk ka të dhëna për të bërë backup.",
                },
                error2: {
                    title: "Gabim",
                    message: "Backup nuk mund të krijohet. Ju lutemi provoni përsëri.",
                },
                error3: {
                    title: "Gabim",
                    message: "Skedari i zgjedhur nuk është valid.",
                },
                error4: {
                    title: "Gabim",
                    message: "Ky skedar nuk është valid për këtë aplikacion.",
                },
                error5: {
                    title: "Gabim",
                    message: "Backup nuk mund të rikthehet. Ju lutemi provoni përsëri.",
                },
                success1: {
                    title: "Sukses",
                    message: "Skedari i backup është krijuar me sukses. Sigurohuni që ta ruani në një vend të sigurt!",
                },
                info1: {
                    title: "Rikthe Backup",
                    message: "Kjo do të rikthejë të dhënat nga një skedar backup. Të dhënat ekzistuese me të njëjtat ID do të zëvendësohen. Vazhdo?",
                },
            },
            appUpdate: {
                title: "Aktualizimi",
                message: "Aktualizimi ishte i suksesshëm.",
            },
            appExit: {
                title: "Prit!",
                message: "Jeni të sigurt që dëshironi të dilni?",
            },
        },

        notifications: {
            taskReminder: "Kujtesa e detyrës",
        },

        empty: {
            noTasks: "Asnjë detyrë për të shfaqur. \n\n Përdorni butonin plus (+) për të krijuar detyra të reja.",
            noLabels: "Asnjë etiketë për të shfaqur. \n\n Përdorni butonin plus (+) për të krijuar etiketa të reja.",
        },

        settings: {
            clearStorage: "Pastro bazën e të dhënave",
            displayOptions: "Opsionet e shfaqjes",
        },
    },
};