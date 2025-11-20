/**
 * Services Index
 * Central export point for all service modules
 */

export * from "./slot.service";
export { slotService } from "./slot.instance";

export * from "./qr.service";
export { getQRService } from "./qr.instance";

export * from "./booking.service";
export { bookingService, getBookingService } from "./booking.instance";

export * from "./notification.service";
export { notificationService, getNotificationService } from "./notification.instance";

export * from "./historical-data-service";
export { historicalDataService, getHistoricalDataService } from "./historical-data.instance";

export * from "./token-service";

export * from "./email-service";
