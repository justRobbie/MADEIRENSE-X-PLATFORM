import { StorageAdapter } from "services/storage/types";

// ***************************************************************************************************************

export class WebStorageAdapter implements StorageAdapter {
    private storage: Storage;

    constructor(storageType: 'localStorage' | 'sessionStorage' = 'localStorage') {
        if (typeof window === 'undefined') {
            throw new Error('WebStorageAdapter can only be used in browser environments');
        }
        this.storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
    }

    async getItem(key: string): Promise<string | null> {
        try {
            return this.storage.getItem(key);
        } catch (error) {
            console.error('WebStorageAdapter getItem error:', error);
            return null;
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        try {
            this.storage.setItem(key, value);
        } catch (error) {
            console.error('WebStorageAdapter setItem error:', error);
            throw error;
        }
    }

    async removeItem(key: string): Promise<void> {
        try {
            this.storage.removeItem(key);
        } catch (error) {
            console.error('WebStorageAdapter removeItem error:', error);
            throw error;
        }
    }

    async getAllKeys(): Promise<string[]> {
        try {
            const keys: string[] = [];
            for (let i = 0; i < this.storage.length; i++) {
                const key = this.storage.key(i);
                if (key) keys.push(key);
            }
            return keys;
        } catch (error) {
            console.error('WebStorageAdapter getAllKeys error:', error);
            return [];
        }
    }

    async clear(): Promise<void> {
        try {
            this.storage.clear();
        } catch (error) {
            console.error('WebStorageAdapter clear error:', error);
            throw error;
        }
    }

    async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
        return keys.map(key => [key, this.storage.getItem(key)]);
    }

    async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
        keyValuePairs.forEach(([key, value]) => {
            this.storage.setItem(key, value);
        });
    }

    async multiRemove(keys: string[]): Promise<void> {
        keys.forEach(key => {
            this.storage.removeItem(key);
        });
    }
}

export class MemoryStorageAdapter implements StorageAdapter {
    private storage: Map<string, string> = new Map();

    async getItem(key: string): Promise<string | null> {
        return this.storage.get(key) || null;
    }

    async setItem(key: string, value: string): Promise<void> {
        this.storage.set(key, value);
    }

    async removeItem(key: string): Promise<void> {
        this.storage.delete(key);
    }

    async getAllKeys(): Promise<string[]> {
        return Array.from(this.storage.keys());
    }

    async clear(): Promise<void> {
        this.storage.clear();
    }

    async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
        return keys.map(key => [key, this.storage.get(key) || null]);
    }

    async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
        keyValuePairs.forEach(([key, value]) => {
            this.storage.set(key, value);
        });
    }

    async multiRemove(keys: string[]): Promise<void> {
        keys.forEach(key => {
            this.storage.delete(key);
        });
    }
}

export class AsyncStorageAdapter implements StorageAdapter {
    private AsyncStorage: any;

    constructor(AsyncStorage: any) {
        if (!AsyncStorage) {
            throw new Error('AsyncStorage is required for AsyncStorageAdapter');
        }
        this.AsyncStorage = AsyncStorage;
    }

    async getItem(key: string): Promise<string | null> {
        try {
            return await this.AsyncStorage.getItem(key);
        } catch (error) {
            console.error('AsyncStorageAdapter getItem error:', error);
            return null;
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        try {
            await this.AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error('AsyncStorageAdapter setItem error:', error);
            throw error;
        }
    }

    async removeItem(key: string): Promise<void> {
        try {
            await this.AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('AsyncStorageAdapter removeItem error:', error);
            throw error;
        }
    }

    async getAllKeys(): Promise<string[]> {
        try {
            return await this.AsyncStorage.getAllKeys();
        } catch (error) {
            console.error('AsyncStorageAdapter getAllKeys error:', error);
            return [];
        }
    }

    async clear(): Promise<void> {
        try {
            await this.AsyncStorage.clear();
        } catch (error) {
            console.error('AsyncStorageAdapter clear error:', error);
            throw error;
        }
    }

    async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
        try {
            return await this.AsyncStorage.multiGet(keys);
        } catch (error) {
            console.error('AsyncStorageAdapter multiGet error:', error);
            return keys.map(key => [key, null]);
        }
    }

    async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
        try {
            await this.AsyncStorage.multiSet(keyValuePairs);
        } catch (error) {
            console.error('AsyncStorageAdapter multiSet error:', error);
            throw error;
        }
    }

    async multiRemove(keys: string[]): Promise<void> {
        try {
            await this.AsyncStorage.multiRemove(keys);
        } catch (error) {
            console.error('AsyncStorageAdapter multiRemove error:', error);
            throw error;
        }
    }
}
