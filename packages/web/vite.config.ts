import { 
    defineConfig,
    loadEnv
} from "vite";

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// ***************************************************************************************************************

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        build: {
            rollupOptions: {
                external: [
                    "@Madeirense/database"
                ]
            }
        },
        optimizeDeps: {
            exclude: [
                "@Madeirense/database"
            ],
            include: [
                "@Madeirense/shared"
            ]
        },
        plugins: [
            react(),
            tsconfigPaths({ 
                loose: true,
                root: "../../"
            })
        ],
        server: {
            port: parseInt(env.VITE_PORT) || 3000,
            proxy: {
                "/api": {
                    target: "http://localhost:3001",
                    changeOrigin: true
                }
            }
        }
    }
});