export interface ILocator {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
};

export interface ILocatorError {
    code: number;
    message: string;
};