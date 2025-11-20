/**
 * Database Cleanup Script
 * 
 * This script performs maintenance tasks:
 * 1. Removes crowd snapshots older than 90 days
 * 2. Removes expired prediction cache entries
 * 
 * Usage:
 *   npx tsx scripts/cleanup-database.ts
 *   
 * Can be scheduled as a cron job for automated cleanup
 */

import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function cleanupOldCrowdSnapshots() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  console.log(`Cleaning up crowd snapshots older than ${ninetyDaysAgo.toISOString()}...`);

  const result = await prisma.crowdSnapshot.deleteMany({
    where: {
      timestamp: {
        lt: ninetyDaysAgo,
      },
    },
  });

  console.log(`✓ Deleted ${result.count} old crowd snapshots`);
  return result.count;
}

async function cleanupExpiredPredictionCache() {
  const now = new Date();

  console.log(`Cleaning up expired prediction cache entries (before ${now.toISOString()})...`);

  const result = await prisma.predictionCache.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });

  console.log(`✓ Deleted ${result.count} expired prediction cache entries`);
  return result.count;
}

async function getStorageStats() {
  const [snapshotCount, cacheCount, peakPatternCount] = await Promise.all([
    prisma.crowdSnapshot.count(),
    prisma.predictionCache.count(),
    prisma.peakHourPattern.count(),
  ]);

  console.log('\nCurrent database statistics:');
  console.log(`  - Crowd snapshots: ${snapshotCount}`);
  console.log(`  - Prediction cache entries: ${cacheCount}`);
  console.log(`  - Peak hour patterns: ${peakPatternCount}`);
}

async function main() {
  console.log('=== Database Cleanup Started ===\n');

  try {
    // Show stats before cleanup
    await getStorageStats();
    console.log('');

    // Perform cleanup operations
    const snapshotsDeleted = await cleanupOldCrowdSnapshots();
    const cacheDeleted = await cleanupExpiredPredictionCache();

    console.log('');

    // Show stats after cleanup
    await getStorageStats();

    console.log('\n=== Database Cleanup Completed ===');
    console.log(`Total records removed: ${snapshotsDeleted + cacheDeleted}`);

    process.exit(0);
  } catch (error) {
    console.error('Error during database cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
