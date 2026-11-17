import Storage from "expo-sqlite/kv-store";
import { StateStorage } from "zustand/middleware";

// StateStorage backed by expo-sqlite's built-in kv-store (own db file, separate from tasks.db).
// Reads stay async (hydration); writes are sync, so they land in call order — async writes can finish out of order.
export const kvStorage: StateStorage = {
    getItem: (name) => Storage.getItem(name),
    setItem: (name, value) => Storage.setItemSync(name, value),
    removeItem: (name) => Storage.removeItemSync(name),
};
