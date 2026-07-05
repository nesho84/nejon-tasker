import Storage from "expo-sqlite/kv-store";
import { StateStorage } from "zustand/middleware";

// Async StateStorage backed by expo-sqlite's built-in kv-store (own db file, separate from tasks.db)
export const kvStorage: StateStorage = {
    getItem: (name) => Storage.getItem(name),
    setItem: (name, value) => Storage.setItem(name, value),
    removeItem: (name) => Storage.removeItem(name),
};
