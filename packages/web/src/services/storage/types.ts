/**
 * - `L_` [Local storage]()
 * - `S_` [Session storage]()
 * - `P_` Persistent (mobile)
 */
export type storageType = 'L_' | 'S_' | 'P_'; 

export type storageItemType = (
    | 'APP' 
    | 'CACHE' 
    | 'PROFILE' 
    | 'REFRESH' 
    | 'SESSION' 
    | 'SETTINGS'
    | 'USER' 
);

export type storageDataType<T extends (string) = "PROPERTY"> = (
    | 'BACKOFFICE_STAFF_LIST_LIMIT' 
    | 'CONFIG' 
    | 'DATA' 
    | 'PAGINATION'
    | 'PREFERENCES' 
    | 'TEMP' 
    | 'THEME' 
    | 'TOKEN' 
    | T
);

export type StorageKeyType = `${storageType}${storageItemType}$${storageDataType}`;

export interface StorageKey<K extends (string) = "PROPERTY"> {
    storageType: storageType;
    itemType: storageItemType;
    dataName: storageDataType<K>;
};

export interface StorageAdapter {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    getAllKeys(): Promise<string[]>;
    clear(): Promise<void>;
    multiGet?(keys: string[]): Promise<Array<[string, string | null]>>;
    multiSet?(keyValuePairs: Array<[string, string]>): Promise<void>;
    multiRemove?(keys: string[]): Promise<void>;
};