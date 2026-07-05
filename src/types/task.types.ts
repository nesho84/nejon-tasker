export interface Task {
    id: string;
    labelId: string;
    text: string;
    date: string; // ISO 8601
    checked: boolean;
    order_position: number;
    reminderDateTime: string | null; // when the reminder should fire (ISO 8601)
    reminderId: string | null;       // OS notification id backing this reminder (from scheduleNotificationAsync)
    isFavorite: boolean;
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
}
