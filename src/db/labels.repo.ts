import { db } from "@/db/database";
import { Label } from "@/types/label.types";
import uuid from "react-native-uuid";

// Get active labels
export function getLabels(): Label[] {
    const rows = db.getAllSync<any>(
        "SELECT * FROM labels WHERE isDeleted = 0 ORDER BY order_position ASC"
    );
    return rows.map(row => ({
        ...row,
        order: row.order_position,
        isFavorite: Boolean(row.isFavorite),
        isDeleted: Boolean(row.isDeleted)
    }));
}

// Get favorite labels
export function getFavoriteLabels(): Label[] {
    const rows = db.getAllSync<any>(
        "SELECT * FROM labels WHERE isDeleted = 0 AND isFavorite = 1 ORDER BY order_position ASC"
    );
    return rows.map(row => ({
        ...row,
        order: row.order_position,
        isFavorite: Boolean(row.isFavorite),
        isDeleted: Boolean(row.isDeleted)
    }));
}

// Get deleted labels (trash)
export function getDeletedLabels(): Label[] {
    const rows = db.getAllSync<any>(
        "SELECT * FROM labels WHERE isDeleted = 1 ORDER BY deletedAt DESC"
    );
    return rows.map(row => ({
        ...row,
        order: row.order_position,
        isFavorite: Boolean(row.isFavorite),
        isDeleted: Boolean(row.isDeleted)
    }));
}

// Get labels by category
export function getLabelsByCategory(category: string): Label[] {
    const rows = db.getAllSync<any>(
        "SELECT * FROM labels WHERE isDeleted = 0 AND category = ? ORDER BY order_position ASC",
        [category]
    );
    return rows.map(row => ({
        ...row,
        order: row.order_position,
        isFavorite: Boolean(row.isFavorite),
        isDeleted: Boolean(row.isDeleted)
    }));
}

// Get single label
export function getLabel(id: string): Label | null {
    const row = db.getFirstSync<any>("SELECT * FROM labels WHERE id = ?", [id]);
    if (!row) return null;
    return {
        ...row,
        order: row.order_position,
        isFavorite: Boolean(row.isFavorite),
        isDeleted: Boolean(row.isDeleted)
    };
}

// Create label
export function createLabel(data: {
    title: string;
    color: string;
    category?: string | null
}): string {
    const id = uuid.v4();
    const now = new Date().toISOString();

    const maxOrder = db.getFirstSync<{ max: number }>(
        "SELECT MAX(order_position) as max FROM labels WHERE isDeleted = 0"
    );
    const order = (maxOrder?.max ?? -1) + 1;

    db.runSync(
        "INSERT INTO labels (id, title, color, category, order_position, isFavorite, isDeleted, deletedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 0, 0, NULL, ?, ?)",
        [id, data.title, data.color, data.category || null, order, now, now]
    );

    return id;
}

// Update label
export function updateLabel(
    id: string,
    data: { title?: string; color?: string; category?: string | null }
) {
    const existing = getLabel(id);
    if (!existing) throw new Error("Label not found");

    const title = data.title ?? existing.title;
    const color = data.color ?? existing.color;
    const category = data.category !== undefined ? data.category : existing.category;

    db.runSync(
        "UPDATE labels SET title = ?, color = ?, category = ?, updatedAt = ? WHERE id = ?",
        [title, color, category, new Date().toISOString(), id]
    );
}

// Soft delete
export function deleteLabel(id: string) {
    const now = new Date().toISOString();
    db.runSync(
        "UPDATE labels SET isDeleted = 1, deletedAt = ?, updatedAt = ? WHERE id = ?",
        [now, now, id]
    );
}

// Restore from trash
export function restoreLabel(id: string) {
    db.runSync(
        "UPDATE labels SET isDeleted = 0, deletedAt = NULL, updatedAt = ? WHERE id = ?",
        [new Date().toISOString(), id]
    );
}

// Permanent delete
export function deleteLabelPermanently(id: string) {
    db.runSync("DELETE FROM labels WHERE id = ?", [id]);
}

// Toggle favorite
export function toggleLabelFavorite(id: string) {
    const label = getLabel(id);
    if (!label) throw new Error("Label not found");

    db.runSync(
        "UPDATE labels SET isFavorite = ?, updatedAt = ? WHERE id = ?",
        [label.isFavorite ? 0 : 1, new Date().toISOString(), id]
    );
}

// Reorder labels
export function reorderLabels(labelIds: string[]) {
    db.withTransactionSync(() => {
        labelIds.forEach((id, index) => {
            db.runSync(
                "UPDATE labels SET order_position = ?, updatedAt = ? WHERE id = ?",
                [index, new Date().toISOString(), id]
            );
        });
    });
}