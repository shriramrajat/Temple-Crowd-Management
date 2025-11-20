/**
 * Historical Data Service Instance
 * Provides a singleton instance of HistoricalDataService
 */

import { getDbClient } from "@/lib/db";
import { HistoricalDataService } from "./historical-data-service";

/**
 * Singleton instance of HistoricalDataService
 */
let historicalDataServiceInstance: HistoricalDataService | null = null;

/**
 * Get or create HistoricalDataService instance
 * 
 * @returns HistoricalDataService instance
 */
export function getHistoricalDataService(): HistoricalDataService {
  if (!historicalDataServiceInstance) {
    const db = getDbClient();
    historicalDataServiceInstance = new HistoricalDataService(db);
  }
  return historicalDataServiceInstance;
}

/**
 * Export for direct use
 */
export const historicalDataService = getHistoricalDataService();
