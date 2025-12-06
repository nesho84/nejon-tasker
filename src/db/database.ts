import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("tasks.db");

export function setupDatabase() {
  db.execSync("PRAGMA foreign_keys = ON;");

  db.execSync(`
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

  db.execSync(`
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

  // Indexes for performance
  db.execSync("CREATE INDEX IF NOT EXISTS idx_labels_order ON labels(order_position);");
  db.execSync("CREATE INDEX IF NOT EXISTS idx_labels_favorite ON labels(isFavorite);");
  db.execSync("CREATE INDEX IF NOT EXISTS idx_labels_deleted ON labels(isDeleted);");
  db.execSync("CREATE INDEX IF NOT EXISTS idx_labels_category ON labels(category);");

  db.execSync("CREATE INDEX IF NOT EXISTS idx_tasks_labelId ON tasks(labelId);");
  db.execSync("CREATE INDEX IF NOT EXISTS idx_tasks_order ON tasks(order_position);");
  db.execSync("CREATE INDEX IF NOT EXISTS idx_tasks_checked ON tasks(checked);");
  db.execSync("CREATE INDEX IF NOT EXISTS idx_tasks_favorite ON tasks(isFavorite);");
  db.execSync("CREATE INDEX IF NOT EXISTS idx_tasks_deleted ON tasks(isDeleted);");
}

// Run setup immediately when this module loads
setupDatabase();