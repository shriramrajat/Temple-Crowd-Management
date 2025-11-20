# Notification Service

## Overview

The Notification Service handles email notifications for the Smart Darshan Slot Booking system. It provides functionality for sending booking confirmation and cancellation emails with embedded QR codes.

## Requirements

- **4.4**: Send QR code to user's email after booking confirmation
- **4.5**: Handle email delivery failures gracefully
- **5.2**: Send confirmation email with booking details

## Features

- ✅ Booking confirmation emails with embedded QR codes
- ✅ Booking cancellation emails
- ✅ Retry logic with exponential backoff (3 attempts)
- ✅ Error logging without blocking booking process
- ✅ Beautiful HTML email templates
- ✅ Responsive email design

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# Email Configuration (Resend)
RESEND_API_KEY="your-resend-api-key-here"
EMAIL_FROM="onboarding@resend.dev"
```

### Getting a Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use the test domain `onboarding@resend.dev`)
3. Generate an API key from the dashboard
4. Add the API key to your `.env` file

## Usage

### Import the Service

```typescript
import { notificationService } from "@/lib/services/notification.instance";
```

### Send Confirmation Email

```typescript
// After creating a booking and generating QR code
const emailSent = await notificationService.sendConfirmationEmail(
  booking,      // BookingData with slot information
  qrCodeDataUrl // Base64 encoded QR code image (data URL)
);

if (emailSent) {
  console.log("Confirmation email sent successfully");
} else {
  console.warn("Failed to send confirmation email");
}
```

### Send Cancellation Email

```typescript
// After cancelling a booking
const emailSent = await notificationService.sendCancellationEmail(
  cancelledBooking // BookingData with slot information
);

if (emailSent) {
  console.log("Cancellation email sent successfully");
} else {
  console.warn("Failed to send cancellation email");
}
```

## Email Templates

### Confirmation Email

The confirmation email includes:
- Personalized greeting with devotee name
- Booking details (ID, date, time slot, number of people)
- Embedded QR code image (250x250px)
- Important instructions for temple entry
- Professional gradient header design
- Responsive layout for mobile devices

### Cancellation Email

The cancellation email includes:
- Personalized greeting with devotee name
- Cancelled booking details (ID, date, time slot)
- Information about QR code invalidation
- Invitation to book another slot
- Professional gradient header design

## Error Handling

### Retry Logic

The service implements automatic retry with exponential backoff:
- **Attempt 1**: Immediate
- **Attempt 2**: 1 second delay
- **Attempt 3**: 2 seconds delay

### Graceful Failure

Email failures are logged but do not block the booking process:
- Booking creation succeeds even if email fails
- Cancellation succeeds even if email fails
- Users can still access QR codes via the website
- Errors are logged to console for monitoring

## Integration Points

### Booking Creation API

Located in: `app/api/bookings/route.ts`

```typescript
// After creating booking and generating QR code
try {
  const emailSent = await notificationService.sendConfirmationEmail(
    booking,
    qrCodeData
  );
  
  if (emailSent) {
    console.log(`Confirmation email sent to ${booking.email}`);
  }
} catch (emailError) {
  console.error("Email sending error:", emailError);
  // Booking still succeeds
}
```

### Booking Cancellation API

Located in: `app/api/bookings/[bookingId]/route.ts`

```typescript
// After cancelling booking
try {
  const emailSent = await notificationService.sendCancellationEmail(
    cancelledBooking
  );
  
  if (emailSent) {
    console.log(`Cancellation email sent to ${cancelledBooking.email}`);
  }
} catch (emailError) {
  console.error("Email sending error:", emailError);
  // Cancellation still succeeds
}
```

## Testing

### Test Email Sending

You can test email sending using the Resend test domain:

```typescript
// Use onboarding@resend.dev as FROM_EMAIL
// Send test emails to your own email address
```

### Monitor Email Delivery

1. Check Resend dashboard for delivery status
2. View email logs in console output
3. Check spam folder if emails not received

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` is set correctly
2. **Check Domain**: Ensure `EMAIL_FROM` uses a verified domain
3. **Check Logs**: Review console logs for error messages
4. **Check Resend Dashboard**: View delivery status and errors

### Emails Going to Spam

1. **Verify Domain**: Use a verified domain instead of test domain
2. **Add SPF/DKIM**: Configure DNS records for your domain
3. **Test Content**: Avoid spam trigger words in templates

### Rate Limiting

Resend has rate limits based on your plan:
- Free tier: 100 emails/day
- Paid plans: Higher limits

Monitor usage in Resend dashboard.

## Future Enhancements

- [ ] SMS notifications (optional)
- [ ] Reminder emails before slot time
- [ ] Multi-language email templates
- [ ] Email analytics and tracking
- [ ] Custom email templates per temple
- [ ] Attachment support for calendar invites

## Dependencies

- `resend`: Email service provider SDK
- `@/lib/services/booking.service`: Booking data types
- Environment variables for configuration

## Related Files

- `lib/services/notification.service.ts`: Service implementation
- `lib/services/notification.instance.ts`: Singleton instance
- `lib/services/index.ts`: Service exports
- `app/api/bookings/route.ts`: Booking creation integration
- `app/api/bookings/[bookingId]/route.ts`: Cancellation integration
