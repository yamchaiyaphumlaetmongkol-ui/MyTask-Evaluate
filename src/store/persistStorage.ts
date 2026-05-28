import { createJSONStorage } from "zustand/middleware";

/**
 * Shared localStorage adapter for persisted zustand stores.
 * Keeps a single storage factory to avoid repeating inline lambdas.
 */
export const persistLocalStorage = createJSONStorage(() => localStorage);
