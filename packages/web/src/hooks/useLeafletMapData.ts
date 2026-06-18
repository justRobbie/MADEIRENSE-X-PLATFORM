import { 
    useEffect, 
    useState
} from "react";

// ***************************************************************************************************************

export const useLeafletMapData = (dataUrl: string | undefined, cacheKey: string) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async (url: string) => {
            try {
                const cachedData = (window as (Window & typeof globalThis) & { mapDataCache:  Record<string, any> }).mapDataCache?.[cacheKey];

                if (cachedData) {
                    setData(cachedData);

                    setLoading(false);

                    return;
                }

                setLoading(true);

                const response = await fetch(url);

                if (!response.ok) throw new Error('Failed to fetch data');

                const jsonData = await response.json();

                if (!(window as (Window & typeof globalThis) & { mapDataCache:  Record<string, any> }).mapDataCache) 
                    (window as (Window & typeof globalThis) & { mapDataCache:  Record<string, any> }).mapDataCache = {};

                (window as (Window & typeof globalThis) & { mapDataCache:  Record<string, any> }).mapDataCache[cacheKey] = jsonData;

                setData(jsonData);
            } catch (err) {
                setError((err as Error));
            } finally {
                setLoading(false);
            }
        };

        if (dataUrl) fetchData(dataUrl);
    }, [
        cacheKey,
        dataUrl
    ]);

    return { 
        data, 
        error,
        loading
    };
};
