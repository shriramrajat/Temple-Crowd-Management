/**
 * Slot Service Instance
 * Pre-configured instance of SlotService with database client
 */

import { db } from "@/lib/db";
import { SlotService } from "./slot.service";

/**
 * Singleton instance of SlotService
 * Use this in API routes and server components
 */
export const slotService = new SlotService(db);
