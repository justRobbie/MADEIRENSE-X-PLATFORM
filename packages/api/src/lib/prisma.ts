import { 
  PrismaClient
} from '@Madeirense/database';

import env from '../env';

// ***************************************************************************************************************

declare global {
  var __prisma: PrismaClient | undefined;
};

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
export const prisma = global.__prisma || new PrismaClient();

if (env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

export default prisma;