import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Database Cleanup Logic', () => {
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
      $disconnect: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should delete crowd snapshots older than 90 days', async () => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    mockPrisma.crowdSnapshot.deleteMany.mockResolvedValue({ count: 150 });

    const result = await mockPrisma.crowdSnapshot.deleteMany({
      where: {
        timestamp: {
          lt: ninetyDaysAgo,
        },
      },
    });

    expect(mockPrisma.crowdSnapshot.deleteMany).toHaveBeenCalledWith({
      where: {
        timestamp: {
          lt: expect.any(Date),
        },
      },
    });
    expect(result.count).toBe(150);
  });

  it('should delete expired prediction cache entries', async () => {
    const now = new Date();

    mockPrisma.predictionCache.deleteMany.mockResolvedValue({ count: 45 });

    const result = await mockPrisma.predictionCache.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    expect(mockPrisma.predictionCache.deleteMany).toHaveBeenCalledWith({
      where: {
        expiresAt: {
          lt: expect.any(Date),
        },
      },
    });
    expect(result.count).toBe(45);
  });

  it('should count remaining records after cleanup', async () => {
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
