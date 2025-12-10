import { db } from "@/db/database";
import { Label } from "@/types/label.types";
import uuid from "react-native-uuid";

// Get all active labels
export async function getAllLabels(): Promise<Label[]> {
    const rows = await db.getAllAsync<Label>(
        "SELECT * FROM labels WHERE isDeleted = 0 ORDER BY order_position ASC"
    );
    return rows;
}

// Get a single label by ID
export async function getLabelById(id: string): Promise<Label | null> {
    const row = await db.getFirstAsync<Label>("SELECT * FROM labels WHERE id = ?", [id]);
    if (!row) return null;
    return row;
}

// Get labels by category
export async function getLabelsByCategory(category: string): Promise<Label[]> {
    const rows = await db.getAllAsync<Label>(
        "SELECT * FROM labels WHERE isDeleted = 0 AND category = ? ORDER BY order_position ASC",
        [category]
    );
    return rows;
}

// Create a new label
export async function createLabel(data: { title: string; color: string; category?: string | null }): Promise<string> {
    const id = uuid.v4();
    const now = new Date().toISOString();
    const maxOrder = await db.getFirstAsync<{ max: number }>(
        "SELECT MAX(order_position) as max FROM labels WHERE isDeleted = 0"
    );
    const order_position = (maxOrder?.max ?? -1) + 1;

    await db.runAsync(
        "INSERT INTO labels (id, title, color, category, order_position, isFavorite, isDeleted, deletedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 0, 0, NULL, ?, ?)",
        [id, data.title, data.color, data.category || null, order_position, now, now]
    );

    return id;
}

// Update label
export async function updateLabel(id: string, data: { title?: string; color?: string; category?: string | null }): Promise<void> {
    const existing = await getLabelById(id);
    if (!existing) throw new Error("Label not found");

    const title = data.title ?? existing.title;
    const color = data.color ?? existing.color;
    const category = data.category !== undefined ? data.category : existing.category;
    const now = new Date().toISOString();

    await db.runAsync(
        "UPDATE labels SET title = ?, color = ?, category = ?, updatedAt = ? WHERE id = ?",
        [title, color, category, now, id]
    );
}

// Soft delete a label AND soft-delete its tasks
export async function deleteLabel(id: string): Promise<void> {
    const now = new Date().toISOString();
    await db.withTransactionAsync(async () => {
        await db.runAsync(
            "UPDATE tasks SET isDeleted = 1, deletedAt = ?, updatedAt = ? WHERE labelId = ? AND isDeleted = 0",
            [now, now, id]
        );
        await db.runAsync(
            "UPDATE labels SET isDeleted = 1, deletedAt = ?, updatedAt = ? WHERE id = ?",
            [now, now, id]
        );
    });
}

// Permanent delete (hard delete)
export async function deleteLabelPermanently(id: string): Promise<void> {
    // This will cascade-delete tasks via FK ON DELETE CASCADE
    await db.runAsync("DELETE FROM labels WHERE id = ?", [id]);
}

// Get deleted labels (GLOBAL - for trash screen)
export async function getDeletedLabels(): Promise<Label[]> {
    const rows = await db.getAllAsync<Label>(
        "SELECT * FROM labels WHERE isDeleted = 1 ORDER BY deletedAt DESC"
    );
    return rows;
}

// Restore label and its tasks
export async function restoreLabel(id: string): Promise<void> {
    const now = new Date().toISOString();
    await db.withTransactionAsync(async () => {
        await db.runAsync(
            "UPDATE labels SET isDeleted = 0, deletedAt = NULL, updatedAt = ? WHERE id = ?",
            [now, id]
        );
        await db.runAsync(
            "UPDATE tasks SET isDeleted = 0, deletedAt = NULL, updatedAt = ? WHERE labelId = ?",
            [now, id]
        );
    });
}

// Reorder labels
export async function reorderLabels(labelIds: string[]): Promise<void> {
    const now = new Date().toISOString();
    await db.withTransactionAsync(async () => {
        for (const [index, id] of labelIds.entries()) {
            await db.runAsync(
                "UPDATE labels SET order_position = ?, updatedAt = ? WHERE id = ?",
                [index, now, id]
            );
        };
    });
}

// Get favorite labels (GLOBAL - for favorites screen)
export async function getFavoriteLabels(): Promise<Label[]> {
    const rows = await db.getAllAsync<Label>(
        "SELECT * FROM labels WHERE isDeleted = 0 AND isFavorite = 1 ORDER BY order_position ASC"
    );
    return rows;
}

// Toggle favorite
export async function toggleLabelFavorite(id: string): Promise<void> {
    const now = new Date().toISOString();
    await db.runAsync(
        "UPDATE labels SET isFavorite = CASE isFavorite WHEN 1 THEN 0 ELSE 1 END, updatedAt = ? WHERE id = ?",
        [now, id]
    );
}