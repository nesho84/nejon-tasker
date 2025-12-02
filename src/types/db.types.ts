export type LabelRow = {
    id: string;
    title: string;
    color: string;
    category: string | null;
    order_position: number;
    isFavorite: number;
    isDeleted: number;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type TaskRow = {
    id: string;
    labelId: string;
    name: string;
    date: string;
    checked: number;
    order_position: number;
    reminderDateTime: string | null;
    reminderId: string | null;
    isFavorite: number;
    isDeleted: number;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
};