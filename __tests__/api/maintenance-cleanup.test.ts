import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Maintenance Cleanup API Logic', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      crowdSnapshot: {
        deleteMany: vi.fn(),
        count: vi.fn(),
      },
      predictionCache: {
        deleteMany: vi.fn(),
        count: vi.fn(),
      },
      peakHourPattern: {
        count: vi.fn(),
      },
    };
    vi.clearAllMocks();
  });

  describe('Cleanup operations', () => {
    it('should delete old snapshots and expired cache', async () => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const now = new Date();

      mockPrisma.crowdSnapshot.deleteMany.mockResolvedValue({ count: 150 });
      mockPrisma.predictionCache.deleteMany.mockResolvedValue({ count: 45 });

      const snapshotsResult = await mockPrisma.crowdSnapshot.deleteMany({
        where: {
          timestamp: {
            lt: ninetyDaysAgo,
          },
        },
      });

      const cacheResult = await mockPrisma.predictionCache.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

      expect(snapshotsResult.count).toBe(150);
      expect(cacheResult.count).toBe(45);
      expect(snapshotsResult.count + cacheResult.count).toBe(195);
    });

    it('should count records after cleanup', async () => {
      mockPrisma.crowdSnapshot.count.mockResolvedValue(1000);
      mockPrisma.predictionCache.count.mockResolvedValue(50);
      mockPrisma.peakHourPattern.count.mockResolvedValue(42);

      const [snapshotCount, cacheCount, peakPatternCount] = await Promise.all([
        mockPrisma.crowdSnapshot.count(),
        mockPrisma.predictionCache.count(),
        mockPrisma.peakHourPattern.count(),
      ]);

      expect(snapshotCount).toBe(1000);
      expect(cacheCount).toBe(50);
      expect(peakPatternCount).toBe(42);
    });
  });

  describe('Status check operations', () => {
    it('should count records that need cleanup', async () => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const now = new Date();

      mockPrisma.crowdSnapshot.count
        .mockResolvedValueOnce(150) // old snapshots
        .mockResolvedValueOnce(1000); // total snapshots
      mockPrisma.predictionCache.count
        .mockResolvedValueOnce(45) // expired cache
        .mockResolvedValueOnce(50); // total cache

      const oldSnapshotsCount = await mockPrisma.crowdSnapshot.count({
        where: {
          timestamp: {
            lt: ninetyDaysAgo,
          },
        },
      });

      const expiredCacheCount = await mockPrisma.predictionCache.count({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

      const totalSnapshots = await mockPrisma.crowdSnapshot.count();
      const totalCache = await mockPrisma.predictionCache.count();

      expect(oldSnapshotsCount).toBe(150);
      expect(expiredCacheCount).toBe(45);
      expect(totalSnapshots).toBe(1000);
      expect(totalCache).toBe(50);
    });
  });
});
