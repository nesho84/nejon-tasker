export interface Label {
    id: string;
    title: string;
    color: string;
    category: string | null;
    order_position: number;
    isFavorite: boolean;
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
}