import { QueryClientConfig } from '@tanstack/react-query';

// ***************************************************************************************************************

const dependencies = {
    "@tanstack/react-query": {
        queries: {
            refetchOnWindowFocus: false
        }
    } as QueryClientConfig
};

export default dependencies;