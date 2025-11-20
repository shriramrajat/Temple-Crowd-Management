import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

/**
 * API endpoint for database cleanup
 * 
 * POST /api/maintenance/cleanup
 * 
 * Performs:
 * - Removes crowd snapshots older than 90 days
 * - Removes expired prediction cache entries
 * 
 * Returns statistics about deleted records
 */
export async function POST(request: NextRequest) {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const now = new Date();

    // Clean up old crowd snapshots
    const snapshotsResult = await prisma.crowdSnapshot.deleteMany({
      where: {
        timestamp: {
          lt: ninetyDaysAgo,
        },
      },
    });

    // Clean up expired prediction cache
    const cacheResult = await prisma.predictionCache.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // Get current statistics
    const [snapshotCount, cacheCount, peakPatternCount] = await Promise.all([
      prisma.crowdSnapshot.count(),
      prisma.predictionCache.count(),
      prisma.peakHourPattern.count(),
    ]);

    return NextResponse.json({
      success: true,
      cleanup: {
        snapshotsDeleted: snapshotsResult.count,
        cacheEntriesDeleted: cacheResult.count,
        totalDeleted: snapshotsResult.count + cacheResult.count,
      },
      currentStats: {
        crowdSnapshots: snapshotCount,
        predictionCache: cacheCount,
        peakHourPatterns: peakPatternCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database cleanup error:', error);
    return NextResponse.json(
      {
        error: 'Failed to perform database cleanup',
        code: 'CLEANUP_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check cleanup status without performing cleanup
 */
export async function GET(request: NextRequest) {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const now = new Date();

    // Count records that would be deleted
    const [oldSnapshotsCount, expiredCacheCount, totalSnapshots, totalCache] = await Promise.all([
      prisma.crowdSnapshot.count({
        where: {
          timestamp: {
            lt: ninetyDaysAgo,
          },
        },
      }),
      prisma.predictionCache.count({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      }),
      prisma.crowdSnapshot.count(),
      prisma.predictionCache.count(),
    ]);

    return NextResponse.json({
      cleanupNeeded: {
        oldSnapshots: oldSnapshotsCount,
        expiredCache: expiredCacheCount,
        total: oldSnapshotsCount + expiredCacheCount,
      },
      currentStats: {
        totalSnapshots,
        totalCache,
      },
      thresholds: {
        snapshotRetentionDays: 90,
        cacheExpiration: 'dynamic',
      },
    });
  } catch (error) {
    console.error('Error checking cleanup status:', error);
    return NextResponse.json(
      {
        error: 'Failed to check cleanup status',
        code: 'STATUS_CHECK_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
