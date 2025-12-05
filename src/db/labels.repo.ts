import { db } from "@/db/database";
import { Label } from "@/types/label.types";
import uuid from "react-native-uuid";

// Get all active labels
export function getLabels(): Label[] {
    const rows = db.getAllSync<Label>(
        "SELECT * FROM labels WHERE isDeleted = 0 ORDER BY order_position ASC"
    );
    return rows;
}

// Get a single label by ID
export function getLabelById(id: string): Label | null {
    const row = db.getFirstSync<Label>("SELECT * FROM labels WHERE id = ?", [id]);
    if (!row) return null;
    return row;
}

// Get labels by category
export function getLabelsByCategory(category: string): Label[] {
    const rows = db.getAllSync<Label>(
        "SELECT * FROM labels WHERE isDeleted = 0 AND category = ? ORDER BY order_position ASC",
        [category]
    );
    return rows;
}

// Create a new label
export function createLabel(data: { title: string; color: string; category?: string | null }): string {
    const id = uuid.v4();
    const now = new Date().toISOString();
    const maxOrder = db.getFirstSync<{ max: number }>(
        "SELECT MAX(order_position) as max FROM labels WHERE isDeleted = 0"
    );
    const order_position = (maxOrder?.max ?? -1) + 1;

    db.runSync(
        "INSERT INTO labels (id, title, color, category, order_position, isFavorite, isDeleted, deletedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 0, 0, NULL, ?, ?)",
        [id, data.title, data.color, data.category || null, order_position, now, now]
    );

    return id;
}

// Update label
export function updateLabel(id: string, data: { title?: string; color?: string; category?: string | null }): void {
    const existing = getLabelById(id);
    if (!existing) throw new Error("Label not found");

    const title = data.title ?? existing.title;
    const color = data.color ?? existing.color;
    const category = data.category !== undefined ? data.category : existing.category;
    const now = new Date().toISOString();

    db.runSync(
        "UPDATE labels SET title = ?, color = ?, category = ?, updatedAt = ? WHERE id = ?",
        [title, color, category, now, id]
    );
}

// Soft delete a label AND soft-delete its tasks
export function deleteLabel(id: string): void {
    const now = new Date().toISOString();
    db.withTransactionSync(() => {
        db.runSync(
            "UPDATE tasks SET isDeleted = 1, deletedAt = ?, updatedAt = ? WHERE labelId = ? AND isDeleted = 0",
            [now, now, id]
        );
        db.runSync(
            "UPDATE labels SET isDeleted = 1, deletedAt = ?, updatedAt = ? WHERE id = ?",
            [now, now, id]
        );
    });
}

// Permanent delete (hard delete)
export function deleteLabelPermanently(id: string): void {
    // This will cascade-delete tasks via FK ON DELETE CASCADE
    db.runSync("DELETE FROM labels WHERE id = ?", [id]);
}

// Get deleted labels (GLOBAL - for trash screen)
export function getDeletedLabels(): Label[] {
    const rows = db.getAllSync<Label>(
        "SELECT * FROM labels WHERE isDeleted = 1 ORDER BY deletedAt DESC"
    );
    return rows;
}

// Restore label and its tasks
export function restoreLabel(id: string): void {
    const now = new Date().toISOString();
    db.withTransactionSync(() => {
        db.runSync(
            "UPDATE labels SET isDeleted = 0, deletedAt = NULL, updatedAt = ? WHERE id = ?",
            [now, id]
        );
        db.runSync(
            "UPDATE tasks SET isDeleted = 0, deletedAt = NULL, updatedAt = ? WHERE labelId = ?",
            [now, id]
        );
    });
}

// Reorder labels
export function reorderLabels(labelIds: string[]): void {
    const now = new Date().toISOString();
    db.withTransactionSync(() => {
        labelIds.forEach((id, index) => {
            db.runSync(
                "UPDATE labels SET order_position = ?, updatedAt = ? WHERE id = ?",
                [index, now, id]
            );
        });
    });
}

// Get favorite labels (GLOBAL - for favorites screen)
export function getFavoriteLabels(): Label[] {
    const rows = db.getAllSync<Label>(
        "SELECT * FROM labels WHERE isDeleted = 0 AND isFavorite = 1 ORDER BY order_position ASC"
    );
    return rows;
}

// Toggle favorite
export function toggleLabelFavorite(id: string): void {
    const now = new Date().toISOString();
    db.runSync(
        `UPDATE labels SET isFavorite = CASE isFavorite WHEN 1 THEN 0 ELSE 1 END, updatedAt = ? WHERE id = ?`,
        [now, id]
    );
}