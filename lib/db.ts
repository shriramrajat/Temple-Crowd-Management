/**
 * Database Connection Utility
 * Provides a singleton Prisma client instance with connection pooling
 * Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 4.2, 6.1, 7.2
 */

import { PrismaClient } from "@/lib/generated/prisma";

/**
 * Global type declaration for Prisma client
 * Prevents multiple instances in development with hot reloading
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma client configuration
 */
const prismaClientOptions = {
  log:
    process.env.NODE_ENV === "development"
      ? (["query", "error", "warn"] as const)
      : (["error"] as const),
};

/**
 * Singleton Prisma client instance
 * 
 * In development, we use a global variable to prevent multiple instances
 * due to Next.js hot reloading. In production, we create a new instance.
 */
export const db =
  global.prisma ||
  new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}

/**
 * Graceful shutdown handler
 * Ensures database connections are properly closed
 * Only runs in Node.js runtime (not Edge Runtime)
 */
if (typeof window === "undefined" && typeof process !== "undefined" && process.on) {
  process.on("beforeExit", async () => {
    await db.$disconnect();
  });
}

/**
 * Export Prisma client type for use in services
 */
export type DbClient = typeof db;

/**
 * Get database client instance
 * 
 * @returns Prisma client instance
 */
export function getDbClient(): DbClient {
  return db;
}
