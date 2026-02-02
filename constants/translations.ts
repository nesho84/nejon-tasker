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
            noBackup: "No backup yet",
            supportDev: "Support the development",
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
            deleteAll: "Delete All",
            edit: "Edit",
            exit: "Exit",
            yes: "Yes",
            no: "No",
            ok: "OK",
            openSettings: "Open Settings",
        },

        // Form inputs
        forms: {
            inputPlaceholder: "Enter text...",
            setReminder: "Set Reminder...",
            newLabel: "Create new Label",
            editLabel: "Edit Label",
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
                message: "Delete Label and all of its tasks?",
                message2: "This will permanently delete all associated tasks. This action cannot be undone!",
            },
            deleteTask: {
                title: "Are you sure?",
                message1: "Delete Task?",
                message2: "Delete Task permanently?",
            },
            cancelReminder: {
                title: "Are you sure?",
                message: "Cancel the reminder for this task?",
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
                info2: {
                    title: "Save Backup",
                    message1: "Choose how to save your backup:",
                    message2: "Save to Device",
                    message3: "Share/Upload",
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
            title1: "Notifications are off",
            message1: "Tap to enable in Settings",
        },

        // Empty states
        empty: {
            noTasks: "No Tasks to show. \n\n Use the input below to create new tasks.",
            noLabels: "No Labels to show. \n\n You can use the plus button (+) to create new labels.",
            noReminders: "No Reminders to show. \n\n Reminders you set will appear here.",
            noFavorites: "No Favorites to show. \n\n You can favorite tasks to see them here.",
            noTrash: "No Deleted Tasks to show. \n\n Deleted tasks will appear here.",
        },

        // Settings screen specific
        settings: {
            clearStorage: "Clear Storage",
            displayOptions: "Display Options",
        },

        // About screen specific
        about: {
            desc: "Nejon Tasker is a simple and efficient task management app designed to help you organize your daily activities with ease.",
        },

        // Obboarding screen specific
        onboarding: {
            languageTitle: "Choose Your Language",
            languageSubtitle: "Select your preferred language",
            next: "Next",
            start: "Get Started",
            skip: "Skip",
            slide1Title: "Capture Your Tasks",
            slide1Description: "Create and manage your tasks effortlessly. Stay on top of everything you need to do.",
            slide2Title: "Organize with Labels",
            slide2Description: "Group tasks using colorful labels. Drag and drop to reorder everything your way.",
            slide3Title: "Set Reminders",
            slide3Description: "Never miss important tasks. Get notified exactly when you need to.",
            slide4Title: "Quick Access",
            slide4Description: "Mark favorites, view reminders and trash, and share tasks with others.",
            slide5Title: "Personalize & Protect",
            slide5Description: "Switch between themes, choose your language, and backup your data securely.",
        },
    },

    // ------------------------------------------------------------
    // Deutsch
    // ------------------------------------------------------------
    de: {
        // Common labels
        labels: {
            home: "Startseite",
            settings: "Einstellungen",
            profile: "Profil",
            about: "About",
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
            noBackup: "Noch kein Backup",
            supportDev: "Unterstützen Sie die Entwicklung",
            of: "von",
            displayOptions: "Anzeigeoptionen",
            checkedItems: "Abgeschlossene Aufgaben",
        },

        // Button text
        buttons: {
            save: "Speichern",
            cancel: "Stornieren",
            submit: "Einreichen",
            delete: "Löschen",
            deleteAll: "Alle löschen",
            edit: "Bearbeiten",
            exit: "Beenden",
            yes: "Ja",
            no: "Nein",
            ok: "OK",
            openSettings: "Einstellungen öffnen",
        },

        // Form inputs
        forms: {
            inputPlaceholder: "Text eingeben...",
            setReminder: "Erinnerung einstellen...",
            newLabel: "Neues Etikett erstellen",
            editLabel: "Etikett bearbeiten",
        },

        // Success/info messages
        messages: {
            loading: "Wird geladen...",
            updateSuccess: "Update war erfolgreich",
            updateAvailable: "Update verfügbar",
            nothingToDelete: "Nichts zu löschen",
        },

        // Error messages
        errors: {
            somethingWrong: "Etwas ist schief gelaufen",
            invalidDate: "Datum und Uhrzeit dürfen nicht in der Vergangenheit liegen",
            requiredField: "Bitte fügen Sie mindestens ein oder mehrere Zeichen ein",
        },

        // Alert dialogs
        alerts: {
            deleteLabel: {
                title: "Sind Sie sicher?",
                message: "Etikett und alle seine Aufgaben löschen?",
                message2: "Dies löscht alle zugehörigen Aufgaben dauerhaft. Diese Aktion kann nicht rückgängig gemacht werden!",
            },
            deleteTask: {
                title: "Sind Sie sicher?",
                message1: "Aufgabe löschen?",
                message2: "Aufgabe dauerhaft löschen?",
            },
            cancelReminder: {
                title: "Sind Sie sicher?",
                message: "Die Erinnerung für diese Aufgabe abbrechen?",
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
            // Backup alerts
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
                info2: {
                    title: "Backup speichern",
                    message1: "Wählen Sie aus, wie Sie Ihr Backup speichern möchten:",
                    message2: "Auf Gerät speichern",
                    message3: "Teilen/Hochladen",
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

        // Notifications
        notifications: {
            taskReminder: "Aufgabenerinnerung",
            title1: "Benachrichtigungen sind deaktiviert",
            message1: "Tippen Sie, um sie in den Einstellungen zu aktivieren",
        },

        // Empty states
        empty: {
            noTasks: "Keine Aufgaben zu zeigen. \n\n Verwenden Sie das Eingabefeld unten, um neue Aufgaben zu erstellen.",
            noLabels: "Keine Etiketten zu zeigen. \n\n Mit der Plus-Taste (+) können Sie neue Etiketten erstellen.",
            noReminders: "Keine Erinnerungen zu zeigen. \n\n Reminder, die Sie einstellen, werden hier angezeigt.",
            noFavorites: "Keine Favoriten zu zeigen. \n\n Sie können Aufgaben favorisieren, um sie hier zu sehen.",
            noTrash: "Keine gelöschten Aufgaben zu zeigen. \n\n Gelöschte Aufgaben werden hier angezeigt.",
        },

        // Settings screen specific
        settings: {
            clearStorage: "Datenbank löschen",
            displayOptions: "Anzeigeoptionen",
        },

        // About screen specific
        about: {
            desc: "Nejon Tasker ist eine einfache und effiziente Aufgabenverwaltungs-App, die Ihnen hilft, Ihre täglichen Aktivitäten mühelos zu organisieren.",
        },

        // Obboarding screen specific
        onboarding: {
            languageTitle: "Wählen Sie Ihre Sprache",
            languageSubtitle: "Wählen Sie Ihre bevorzugte Sprache",
            next: "Weiter",
            start: "Loslegen",
            skip: "Überspringen",
            slide1Title: "Erfassen Sie Ihre Aufgaben",
            slide1Description: "Erstellen und verwalten Sie Ihre Aufgaben mühelos. Behalten Sie den Überblick über alles, was Sie tun müssen.",
            slide2Title: "Organisieren mit Etiketten",
            slide2Description: "Gruppieren Sie Aufgaben mit farbenfrohen Etiketten. Ziehen und ablegen, um alles nach Ihren Wünschen zu ordnen.",
            slide3Title: "Erinnerungen einstellen",
            slide3Description: "Verpassen Sie keine wichtigen Aufgaben. Lassen Sie sich genau dann benachrichtigen, wenn Sie es brauchen.",
            slide4Title: "Schneller Zugriff",
            slide4Description: "Markieren Sie Favoriten, sehen Sie Erinnerungen und Papierkorb an und teilen Sie Aufgaben mit anderen.",
            slide5Title: "Personalisieren & Schützen",
            slide5Description: "Wechseln Sie zwischen Themen, wählen Sie Ihre Sprache und sichern Sie Ihre Daten sicher.",
        },
    },

    // ------------------------------------------------------------
    // Shqip
    // ------------------------------------------------------------
    sq: {
        // Common labels
        labels: {
            home: "Ballina",
            settings: "Cilësimet",
            profile: "Profili",
            about: "About",
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
            noBackup: "Nuk ka ende një backup",
            supportDev: "Ndihmo zhvillimin e aplikacionit",
            displayOptions: "Opsionet e shfaqjes",
            checkedItems: "Detyra të kryera",
        },

        // Button text
        buttons: {
            save: "Ruaj",
            cancel: "Anulo",
            submit: "Dërgo",
            delete: "Fshij",
            deleteAll: "Fshi të gjitha",
            edit: "Ndrysho",
            exit: "Dalje",
            yes: "Po",
            no: "Jo",
            ok: "OK",
            openSettings: "Hap Cilësimet",
        },

        // Form inputs
        forms: {
            inputPlaceholder: "Shkruaj tekst...",
            setReminder: "Cakto kujtesën...",
            newLabel: "Krijo etiketë të re",
            editLabel: "Ndrysho etiketën",
        },

        // Success/info messages
        messages: {
            loading: "Ngarkohet...",
            updateSuccess: "Aktualizimi ishte i suksesshëm",
            updateAvailable: "Përditësim i disponueshëm",
            nothingToDelete: "Asgjë për të fshirë",
        },

        // Error messages
        errors: {
            somethingWrong: "Diçka shkoi keq",
            invalidDate: "Data dhe ora nuk mund të jenë në të kaluarën",
            requiredField: "Ju lutemi shkruani të paktën një ose më shumë karaktere",
        },

        // Alert dialogs
        alerts: {
            deleteLabel: {
                title: "A jeni të sigurt?",
                message: "Fshij etiketën dhe të gjitha detyrat?",
                message2: "Kjo do të fshijë përgjithmonë të gjitha detyrat. Kjo veprim nuk mund të zhbëhet!",
            },
            deleteTask: {
                title: "A jeni të sigurt?",
                message1: "Fshij detyrën?",
                message2: "Fshij detyrën përgjithmonë?",
            },
            cancelReminder: {
                title: "A jeni të sigurt?",
                message: "Anulo kujtesën për këtë detyrë?",
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
                title: "Leja e njoftimeve",
                message: "Ju keni refuzuar lejen e njoftimeve. Ju lutemi aktivizoni atë në opsionet e pajisjes tuaj për të marrë njoftime.",
            },
            // Backup alerts
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
                info2: {
                    title: "Ruaj Backup",
                    message1: "Zgjidhni se si dëshironi të ruani backup-in tuaj:",
                    message2: "Ruaj në Pajisje",
                    message3: "Shpërndaj/Ngarko",
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

        // Notifications
        notifications: {
            taskReminder: "Kujtesa e detyrës",
            title1: "Njoftimet janë çaktivizuar",
            message1: "Shtyp për të aktivizuar te Cilësimet",
        },

        // Empty states
        empty: {
            noTasks: "Asnjë detyrë për të shfaqur. \n\n Përdorni fushën e mëposhtme për të krijuar detyra të reja.",
            noLabels: "Asnjë etiketë për të shfaqur. \n\n Përdorni butonin plus (+) për të krijuar etiketa të reja.",
            noReminders: "Asnjë kujtesë për të shfaqur. \n\n Kujtesat që krijoni do të shfaqen këtu.",
            noFavorites: "Asnjë e detyrë preferuar për të shfaqur. \n\n Mund të favorizoni detyra për t'i parë këtu.",
            noTrash: "Asnjë detyrë e fshirë për të shfaqur. \n\n Detyrat e fshira do të shfaqen këtu.",
        },

        // Settings screen specific
        settings: {
            clearStorage: "Pastro bazën e të dhënave",
            displayOptions: "Opsionet e shfaqjes",
        },

        // About screen specific
        about: {
            desc: "Nejon Tasker është një aplikacion i thjeshtë dhe efikas për menaxhimin e detyrave, i dizajnuar për t'ju ndihmuar të organizoni aktivitetet tuaja ditore me lehtësi.",
        },

        // Obboarding screen specific
        onboarding: {
            languageTitle: "Zgjidh gjuhën tënde",
            languageSubtitle: "Zgjidh gjuhën tënde të preferuar",
            next: "Vazhdo",
            start: "Fillo",
            skip: "Kalo",
            slide1Title: "Regjistro detyrat tua",
            slide1Description: "Krijo dhe menaxho detyrat e tua pa mundim. Qëndro i informuar për gjithçka që duhet të bësh.",
            slide2Title: "Organizo me etiketa",
            slide2Description: "Grupo detyrat duke përdorur etiketa me ngjyra. Tërhiq dhe lësho për të riorganizuar gjithçka sipas dëshirës tënde.",
            slide3Title: "Cakto kujtesa",
            slide3Description: "Mos humbisni detyra të rëndësishme. Merr njoftime pikërisht kur të nevojiten.",
            slide4Title: "Akses i shpejtë",
            slide4Description: "Zgjidh të preferuarat, shiko kujtesat dhe detyrat e fshira, dhe ndaj detyra me të tjerët.",
            slide5Title: "Personalizo & Siguro",
            slide5Description: "Ndërro midis temave, zgjidh gjuhën tënde, dhe mbroj të dhënat tua me backup të sigurt.",
        },
    },
};
