import { Share } from "react-native";

// Returns true when a reminder has an id and its datetime is still in the future
export const isReminderActive = (dateTime: string | Date | null, reminderId: string | null): boolean => {
    if (!dateTime || !reminderId) return false;
    return new Date(dateTime).getTime() > new Date().getTime();
};

export const shareText = async (title: string, message: string) => {
    try {
        await Share.share(
            {
                title: title || "My Task",
                message: message,
            },
            {
                dialogTitle: title,
                subject: title,
            }
        );
    } catch (error) {
        console.error("Share failed:", error);
    }
};