export interface Task {
    id: string;
    labelId: string;
    text: string;
    date: string; // ISO 8601
    checked: boolean;
    order_position: number;
    reminderDateTime: string | null;
    reminderId: string | null;
    isFavorite: boolean;
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
}