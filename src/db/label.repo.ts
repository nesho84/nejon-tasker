import { getDB } from "@/db/database";
import { Label } from "@/types/label.types";

// ------------------------------------------------------------
// Load all labels from database on app startup
// ------------------------------------------------------------
export async function loadAllLabels(): Promise<Label[]> {
    const db = await getDB();
    try {
        const rows = await db.getAllAsync<Label>(
            "SELECT * FROM labels ORDER BY order_position DESC"
        );
        return rows;
    } catch (error) {
        console.error('Failed to load labels from database:', error);
        throw error;
    }
}

// ------------------------------------------------------------
// Insert label
// ------------------------------------------------------------
export async function insertLabel(label: Label): Promise<void> {
    const db = await getDB();
    try {
        await db.runAsync(
            `INSERT INTO labels (
                id, title, color, category, order_position,
                isFavorite, isDeleted, deletedAt, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                label.id,
                label.title,
                label.color,
                label.category,
                label.order_position,
                label.isFavorite ? 1 : 0,
                label.isDeleted ? 1 : 0,
                label.deletedAt,
                label.createdAt,
                label.updatedAt
            ]
        );
    } catch (error) {
        console.error('Failed to insert label:', error);
        throw error;
    }
}

// ------------------------------------------------------------
// Update label
// ------------------------------------------------------------
export async function updateLabel(label: Label): Promise<void> {
    const db = await getDB();
    try {
        await db.runAsync(
            `UPDATE labels SET
                title = ?, color = ?, category = ?, order_position = ?,
                isFavorite = ?, isDeleted = ?, deletedAt = ?, updatedAt = ?
            WHERE id = ?`,
            [
                label.title,
                label.color,
                label.category,
                label.order_position,
                label.isFavorite ? 1 : 0,
                label.isDeleted ? 1 : 0,
                label.deletedAt,
                label.updatedAt,
                label.id
            ]
        );
    } catch (error) {
        console.error('Failed to update label:', error);
        throw error;
    }
}

// ------------------------------------------------------------
// Delete a label (only if no active tasks)
// ------------------------------------------------------------
export async function deleteLabel(id: string): Promise<void> {
    const db = await getDB();
    try {
        // This will cascade-delete tasks via FK ON DELETE CASCADE
        await db.runAsync("DELETE FROM labels WHERE id = ?", [id]);
    } catch (error) {
        console.error('Failed to delete label:', error);
        throw error;
    }
}

// ------------------------------------------------------------
// Reorder labels
// ------------------------------------------------------------
export async function reorderLabels(labelIds: string[]): Promise<void> {
    const db = await getDB();
    try {
        const now = new Date().toISOString();
        await db.withTransactionAsync(async () => {
            for (let i = 0; i < labelIds.length; i++) {
                await db.runAsync(
                    "UPDATE labels SET order_position = ?, updatedAt = ? WHERE id = ?",
                    [i, now, labelIds[i]]
                );
            }
        });
    } catch (error) {
        console.error('Failed to reorder labels:', error);
        throw error;
    }
}