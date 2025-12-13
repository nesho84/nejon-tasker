import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("tasks.db");
  }
  return db;
}

export async function setupDatabase(): Promise<void> {
  const db = await getDB();

  try {
    await db.execAsync("PRAGMA foreign_keys = ON;");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS labels (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        color TEXT NOT NULL,
        category TEXT,
        order_position INTEGER NOT NULL DEFAULT 0,
        isFavorite INTEGER DEFAULT 0,
        isDeleted INTEGER DEFAULT 0,
        deletedAt TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        labelId TEXT NOT NULL,
        text TEXT NOT NULL,
        date TEXT NOT NULL,
        checked INTEGER DEFAULT 0,
        order_position INTEGER NOT NULL DEFAULT 0,
        reminderDateTime TEXT,
        reminderId TEXT,
        isFavorite INTEGER DEFAULT 0,
        isDeleted INTEGER DEFAULT 0,
        deletedAt TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (labelId) REFERENCES labels(id) ON DELETE CASCADE
      );
    `);

    // // Indexes for performance
    await db.execAsync("CREATE INDEX IF NOT EXISTS idx_labels_order ON labels(order_position);");
    await db.execAsync("CREATE INDEX IF NOT EXISTS idx_labels_favorite ON labels(isFavorite);");
    await db.execAsync("CREATE INDEX IF NOT EXISTS idx_labels_deleted ON labels(isDeleted);");
    await db.execAsync("CREATE INDEX IF NOT EXISTS idx_labels_category ON labels(category);");

    // In setupDatabase() - add these back:
    await db.execAsync("CREATE INDEX IF NOT EXISTS idx_tasks_labelId ON tasks(labelId);");
    await db.execAsync("CREATE INDEX IF NOT EXISTS idx_tasks_order ON tasks(order_position);");
    await db.execAsync("CREATE INDEX IF NOT EXISTS idx_tasks_deleted ON tasks(isDeleted);");
    await db.execAsync("CREATE INDEX IF NOT EXISTS idx_tasks_checked ON tasks(checked);");
  } catch (error) {
    console.error("Failed to setup database:", error);
  }
}