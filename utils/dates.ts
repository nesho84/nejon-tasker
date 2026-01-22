export const dates = {
    now(): string {
        return new Date().toISOString();
    },

    format(isoString: string): string {
        const date = new Date(isoString);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', '');
    },

    formatDate(isoString: string): string {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    formatTime(isoString: string): string {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

export const isReminderActive = (dateTime: string | Date | null, reminderId: string | null): boolean => {
    if (!dateTime || !reminderId) return false;

    const currentDateTime = new Date();
    const reminderDateTime = new Date(dateTime);
    const timeDifferenceInSeconds = (reminderDateTime.getTime() - currentDateTime.getTime()) / 1000;

    return timeDifferenceInSeconds > 0;
};