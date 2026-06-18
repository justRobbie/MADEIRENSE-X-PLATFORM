import { PrismaClient } from '../generated/client/index.js';

// ***************************************************************************************************************

declare global {
    var __prisma: PrismaClient | undefined
};

export const prisma = globalThis.__prisma ?? new PrismaClient({
    log: (process.env.NODE_ENV ?? 'development') === 'development' ? [
        'query',
        'error',
        'warn'
    ] : [
        'error'
    ],
});

if ((process.env.NODE_ENV ?? 'development') !== 'production') {
    globalThis.__prisma = prisma
}

export default prisma;