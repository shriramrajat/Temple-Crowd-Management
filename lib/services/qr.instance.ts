/**
 * QR Service Singleton Instance
 * Provides a singleton instance of QRService for use across the application
 */

import { getDbClient } from "@/lib/db";
import { QRService } from "./qr.service";

/**
 * Singleton instance of QRService
 */
let qrServiceInstance: QRService | null = null;

/**
 * Get or create QRService instance
 * 
 * @returns QRService instance
 */
export function getQRService(): QRService {
  if (!qrServiceInstance) {
    const dbClient = getDbClient();
    qrServiceInstance = new QRService(dbClient);
  }
  return qrServiceInstance;
}

/**
 * Reset QRService instance (useful for testing)
 */
export function resetQRService(): void {
  qrServiceInstance = null;
}
