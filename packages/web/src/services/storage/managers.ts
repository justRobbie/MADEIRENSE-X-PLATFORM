import { 
    AsyncStorageAdapter, 
    MemoryStorageAdapter, 
    WebStorageAdapter
} from "services/storage/adapters";

import type { 
    StorageAdapter, 
    storageDataType, 
    storageItemType, 
    StorageKey, 
    StorageKeyType, 
    storageType
} from "services/storage/types";

// ***************************************************************************************************************

export class CrossPlatformStorageManager {
    private adapters: Map<storageType, StorageAdapter> = new Map();

    constructor() {
        this.adapters.set('L_', new MemoryStorageAdapter());
        this.adapters.set('S_', new MemoryStorageAdapter());
        this.adapters.set('P_', new MemoryStorageAdapter());
    }

    INIT_WEB() {
        this.autoInitialize();
    };

    INIT_MOBILE(AsyncStorage: any) {
        this.autoInitialize(AsyncStorage);
    };

    INIT_CUSTOM(config: {
        localStorage?: StorageAdapter;
        sessionStorage?: StorageAdapter;
        persistentStorage?: StorageAdapter;
    }) {
        this.initializeAdapters(config);
    };

    /**
     * Initialize storage adapters for the current platform
     */
    initializeAdapters(config: {
        localStorage?: StorageAdapter;
        sessionStorage?: StorageAdapter;
        persistentStorage?: StorageAdapter;
    }): void {
        if (config.localStorage) {
            this.adapters.set('L_', config.localStorage);
        }
        if (config.sessionStorage) {
            this.adapters.set('S_', config.sessionStorage);
        }
        if (config.persistentStorage) {
            this.adapters.set('P_', config.persistentStorage);
        }
    };

    /**
     * Auto-initialize adapters based on the current environment
     */
    autoInitialize(AsyncStorage?: any): void {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                // Web environment
                this.adapters.set('L_', new WebStorageAdapter('localStorage'));
                this.adapters.set('S_', new WebStorageAdapter('sessionStorage'));
                this.adapters.set('P_', new WebStorageAdapter('localStorage')); // Use localStorage for persistence on web
            } else if (AsyncStorage) {
                // Mobile environment with AsyncStorage
                const asyncAdapter = new AsyncStorageAdapter(AsyncStorage);
                this.adapters.set('L_', asyncAdapter); // Use AsyncStorage for all types on mobile
                this.adapters.set('S_', new MemoryStorageAdapter()); // Session storage as memory on mobile
                this.adapters.set('P_', asyncAdapter);
            }
            // Otherwise, keep memory adapters as fallback
        } catch (error) {
            console.warn('Failed to auto-initialize storage adapters, using memory storage:', error);
        }
    }

    /**
     * Parse a storage key into its components
     */
    private parseKey<K extends (string) = "PROPERTY">(key: string): StorageKey<K> {
        const match = key.match(/^(L_|S_|P_)([^$]+)\$(.+)$/);
        if (!match) {
            throw new Error(`Invalid storage key format: ${key}. Expected format: [L_|S_|P_][ITEM_TYPE]$[DATA_NAME]`);
        }

        return {
            storageType: match[1] as storageType,
            itemType: match[2] as storageItemType,
    
            dataName: match[3] as storageDataType<K>
        };
    }

    /**
     * Build a storage key from components
     */
    private buildKey<T extends (string) = "PROPERTY">(storageType: storageType, itemType: storageItemType, dataName: storageDataType<T>): StorageKeyType {

        return `${storageType}${itemType}$${dataName}` as StorageKeyType;
    }

    /**
     * Get the appropriate storage adapter based on storage type
     */
    private getAdapter(storageType: storageType): StorageAdapter {
        const adapter = this.adapters.get(storageType);
        if (!adapter) {
            throw new Error(`No adapter found for storage type: ${storageType}`);
        }
        return adapter;
    }

    /**
     * Set an item in storage
     */
    async setItem<T, K extends (string) = "PROPERTY">(key: string, value: T): Promise<void>;
    async setItem<T, K extends (string) = "PROPERTY">(storageType: storageType, itemType: storageItemType, dataName: storageDataType<K>, value: T): Promise<void>;
    async setItem<T, K extends (string) = "PROPERTY">(
        keyOrstorageType: string | storageType,
        itemTypeOrValue?: string | T,
        dataName?: storageDataType<K>,
        value?: T
    ): Promise<void> {
        let finalKey: string;
        let finalValue: T;

        if (typeof keyOrstorageType === 'string' && arguments.length === 2) {
            // setItem(key, value) format
            finalKey = keyOrstorageType;
            finalValue = itemTypeOrValue as T;
        } else if (arguments.length === 4) {
            // setItem(storageType, itemType, dataName, value) format
            finalKey = this.buildKey(
                keyOrstorageType as storageType,
                itemTypeOrValue as storageItemType,
        
                dataName!
            );
            finalValue = value!;
        } else {
            throw new Error('Invalid arguments. Use either setItem(key, value) or setItem(storageType, itemType, dataName, value)');
        }

        try {
            const { storageType } = this.parseKey<K>(finalKey);
            const adapter = this.getAdapter(storageType);
            await adapter.setItem(finalKey, JSON.stringify(finalValue));
        } catch (error) {
            console.error('Failed to set storage item:', error);
            throw error;
        }
    }

    /**
     * Get an item from storage
     */
    async getItem<T, K extends (string) = "PROPERTY">(key: StorageKeyType): Promise<T | null>;
    async getItem<T, K extends (string) = "PROPERTY">(storageType: storageType, itemType: storageItemType, dataName: storageDataType<K>): Promise<T | null>;
    async getItem<T, K extends (string) = "PROPERTY">(
        keyOrstorageType: string | storageType,
        itemType?: storageItemType,

        dataName?: storageDataType<K>
    ): Promise<T | null> {
        let finalKey: string;

        if (typeof keyOrstorageType === 'string' && arguments.length === 1) {
            // getItem(key) format
            finalKey = keyOrstorageType;
        } else if (arguments.length === 3) {
            // getItem(storageType, itemType, dataName) format
            finalKey = this.buildKey(
                keyOrstorageType as storageType,
                itemType!,
                dataName!
            );
        } else {
            throw new Error('Invalid arguments. Use either getItem(key) or getItem(storageType, itemType, dataName)');
        }

        try {
            const { storageType } = this.parseKey<K>(finalKey);
            const adapter = this.getAdapter(storageType);
            const item = await adapter.getItem(finalKey);

            if (item === null) {
                return null;
            }

            return JSON.parse(item) as T;
        } catch (error) {
            console.error('Failed to get storage item:', error);
            return null;
        }
    }

    /**
     * Remove an item from storage
     */
    async removeItem<K extends (string) = "PROPERTY">(key: StorageKeyType): Promise<void>;
    async removeItem<K extends (string) = "PROPERTY">(storageType: storageType, itemType: storageItemType, dataName: storageDataType<K>): Promise<void>;
    async removeItem<K extends (string) = "PROPERTY">(
        keyOrstorageType: string | storageType,
        itemType?: storageItemType,

        dataName?: storageDataType<K>
    ): Promise<void> {
        let finalKey: string;

        if (typeof keyOrstorageType === 'string' && arguments.length === 1) {
            // removeItem(key) format
            finalKey = keyOrstorageType;
        } else if (arguments.length === 3) {
            // removeItem(storageType, itemType, dataName) format
            finalKey = this.buildKey(
                keyOrstorageType as storageType,
                itemType!,
                dataName!
            );
        } else {
            throw new Error('Invalid arguments. Use either removeItem(key) or removeItem(storageType, itemType, dataName)');
        }

        try {
            const { storageType } = this.parseKey<K>(finalKey);
            const adapter = this.getAdapter(storageType);
            await adapter.removeItem(finalKey);
        } catch (error) {
            console.error('Failed to remove storage item:', error);
            throw error;
        }
    }

    /**
     * Check if an item exists in storage
     */
    async hasItem<K extends (string) = "PROPERTY">(key: StorageKeyType): Promise<boolean>;
    async hasItem<K extends (string) = "PROPERTY">(storageType: storageType, itemType: storageItemType, dataName: storageDataType<K>): Promise<boolean>;
    async hasItem<K extends (string) = "PROPERTY">(
        keyOrstorageType: string | storageType,
        itemType?: storageItemType,

        dataName?: storageDataType<K>
    ): Promise<boolean> {
        let finalKey: string;

        if (typeof keyOrstorageType === 'string' && arguments.length === 1) {
            finalKey = keyOrstorageType;
        } else if (arguments.length === 3) {
            finalKey = this.buildKey(
                keyOrstorageType as storageType,
                itemType!,
                dataName!
            );
        } else {
            throw new Error('Invalid arguments. Use either hasItem(key) or hasItem(storageType, itemType, dataName)');
        }

        try {
            const { storageType } = this.parseKey<K>(finalKey);
            const adapter = this.getAdapter(storageType);
            const item = await adapter.getItem(finalKey);
            return item !== null;
        } catch (error) {
            console.error('Failed to check storage item:', error);
            return false;
        }
    }

    /**
     * Get all keys that match a pattern
     */
    async getKeys<K extends (string) = "PROPERTY">(storageType?: storageType, itemType?: storageItemType): Promise<StorageKeyType[]> {

        const keys: StorageKeyType[] = [];

        // If no filters specified, get all keys from all storages
        const storageTypes: storageType[] = storageType ? [storageType] : ['L_', 'S_', 'P_'];

        for (const type of storageTypes) {
            try {
                const adapter = this.getAdapter(type);
                const allKeys = await adapter.getAllKeys();

                for (const key of allKeys) {
                    try {
                        const parsed = this.parseKey<K>(key);

                        // Apply filters
                        if (storageType && parsed.storageType !== storageType) continue;
                        if (itemType && parsed.itemType !== itemType) continue;

                        keys.push(key as StorageKeyType);
                    } catch {
                        // Skip invalid keys
                        continue;
                    }
                }
            } catch (error) {
                console.error(`Failed to get keys for storage type ${type}:`, error);
            }
        }

        return keys;
    }

    /**
     * Get all items of a specific type
     */
    async getItemsByType<T, K extends (string) = "PROPERTY">(storageType?: storageType, itemType?: storageItemType): Promise<Record<string, T>> {

        const items: Record<string, T> = {};
        const keys = await this.getKeys(storageType, itemType);

        // Use batch operations if available
        const groupedKeys = new Map<storageType, string[]>();

        keys.forEach(key => {
            const { storageType } = this.parseKey<K>(key);
            if (!groupedKeys.has(storageType)) {
                groupedKeys.set(storageType, []);
            }
            groupedKeys.get(storageType)!.push(key);
        });

        for (const [type, keysForType] of groupedKeys) {
            try {
                const adapter = this.getAdapter(type);

                if (adapter.multiGet) {
                    // Use batch operation
                    const results = await adapter.multiGet(keysForType);
                    results.forEach(([key, value]) => {
                        if (value !== null) {
                            try {
                                const parsed = this.parseKey<K>(key);
                                items[parsed.dataName] = JSON.parse(value);
                            } catch (error) {
                                console.error('Failed to parse item:', error);
                            }
                        }
                    });
                } else {
                    // Fallback to individual operations
                    for (const key of keysForType) {
                        const value = await this.getItem<T>(key as StorageKeyType);
                        if (value !== null) {
                            const parsed = this.parseKey<K>(key);
                            items[parsed.dataName] = value;
                        }
                    }
                }
            } catch (error) {
                console.error(`Failed to get items for storage type ${type}:`, error);
            }
        }

        return items;
    }

    /**
     * Set multiple items efficiently
     */
    async setItems<T, K extends (string) = "PROPERTY">(items: Array<{
        key: string;
        value: T;
    }> | Array<{
        storageType: storageType;
        itemType: storageItemType;

        dataName: storageDataType<K>;
        value: T;
    }>): Promise<void> {
        // Group items by storage type for batch operations
        const groupedItems = new Map<storageType, Array<[string, string]>>();

        items.forEach(item => {
            let key: string;
            let value: T;

            if ('key' in item) {
                key = item.key;
                value = item.value;
            } else {
                key = this.buildKey(item.storageType, item.itemType, item.dataName);
                value = item.value;
            }

            const { storageType } = this.parseKey<K>(key);
            if (!groupedItems.has(storageType)) {
                groupedItems.set(storageType, []);
            }
            groupedItems.get(storageType)!.push([key, JSON.stringify(value)]);
        });

        // Execute batch operations
        const promises = Array.from(groupedItems.entries()).map(async ([type, keyValuePairs]) => {
            try {
                const adapter = this.getAdapter(type);

                if (adapter.multiSet) {
                    await adapter.multiSet(keyValuePairs);
                } else {
                    // Fallback to individual operations
                    await Promise.all(
                        keyValuePairs.map(([key, value]) => adapter.setItem(key, value))
                    );
                }
            } catch (error) {
                console.error(`Failed to set items for storage type ${type}:`, error);
                throw error;
            }
        });

        await Promise.all(promises);
    }

    /**
     * Clear all items of a specific type
     */
    async clearItemsByType<K extends (string) = "PROPERTY">(storageType?: storageType, itemType?: storageItemType): Promise<void> {

        const keys = await this.getKeys(storageType, itemType);

        if (keys.length === 0) return;

        // Group keys by storage type for batch operations
        const groupedKeys = new Map<storageType, string[]>();
        keys.forEach(key => {
            const { storageType } = this.parseKey<K>(key);
            if (!groupedKeys.has(storageType)) {
                groupedKeys.set(storageType, []);
            }
            groupedKeys.get(storageType)!.push(key);
        });

        // Execute batch operations
        const promises = Array.from(groupedKeys.entries()).map(async ([type, keysForType]) => {
            try {
                const adapter = this.getAdapter(type);

                if (adapter.multiRemove) {
                    await adapter.multiRemove(keysForType);
                } else {
                    // Fallback to individual operations
                    await Promise.all(
                        keysForType.map(key => adapter.removeItem(key))
                    );
                }
            } catch (error) {
                console.error(`Failed to clear items for storage type ${type}:`, error);
                throw error;
            }
        });

        await Promise.all(promises);
    }

    /**
     * Clear all items from all storages (matching the key format)
     */
    async clearAll(): Promise<void> {
        await this.clearItemsByType();
    }

    /**
     * Get storage usage statistics
     */
    async getStorageStats(): Promise<{
        localStorage: { count: number; keys: StorageKeyType[] };
        sessionStorage: { count: number; keys: StorageKeyType[] };
        persistentStorage: { count: number; keys: StorageKeyType[] };
    }> {
        const [localKeys, sessionKeys, persistentKeys] = await Promise.all([
            this.getKeys('L_'),
            this.getKeys('S_'),
            this.getKeys('P_')
        ]);

        return {
            localStorage: {
                count: localKeys.length,
                keys: localKeys
            },
            sessionStorage: {
                count: sessionKeys.length,
                keys: sessionKeys
            },
            persistentStorage: {
                count: persistentKeys.length,
                keys: persistentKeys
            }
        };
    }

    /**
     * Health check for all storage adapters
     */
    async healthCheck(): Promise<{
        localStorage: boolean;
        sessionStorage: boolean;
        persistentStorage: boolean;
        errors: string[];
    }> {
        const errors: string[] = [];
        const results = {
            localStorage: false,
            sessionStorage: false,
            persistentStorage: false
        };

        const testKey = 'HEALTH_CHECK_TEST';
        const testValue = 'test';

        for (const [type, name] of [
            ['L_', 'localStorage'],
            ['S_', 'sessionStorage'],
            ['P_', 'persistentStorage']
        ] as const) {
            try {
                const adapter = this.getAdapter(type);
                await adapter.setItem(testKey, testValue);
                const retrieved = await adapter.getItem(testKey);
                await adapter.removeItem(testKey);

                if (retrieved === testValue) {
                    results[name] = true;
                } else {
                    errors.push(`${name}: Retrieved value doesn't match set value`);
                }
            } catch (error) {
                errors.push(`${name}: ${error}`);
            }
        }

        return { ...results, errors };
    }
};