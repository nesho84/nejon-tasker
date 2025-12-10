import { Share } from "react-native";

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