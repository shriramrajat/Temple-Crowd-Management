# Troubleshooting Guide - Crowd Risk Engine

## Quick Diagnostic Steps

When experiencing issues:

1. ✅ Check system health dashboard (`/admin/crowd-risk/health`)
2. ✅ Verify internet connection
3. ✅ Check browser console for errors (F12)
4. ✅ Try refreshing the page (Ctrl+F5 / Cmd+Shift+R)
5. ✅ Verify you're using a supported browser
6. ✅ Check if issue affects all users or just you

---

## Common Issues

### Issue 1: Not Receiving Notifications

#### Symptoms

- Alerts appear on dashboard but no notifications received
- Some notification channels work, others don't
- Notifications delayed or intermittent

#### Diagnostic Steps

**Step 1: Check Notification Preferences**

```
Navigate to: Settings → Notification Preferences
Verify:
- At least one channel is selected
- Severity filter includes the alert level
- Area filter includes the alert area (or is empty for all)
```

**Step 2: Check Channel-Specific Settings**

**For Push Notifications:**
1. Check browser notification permissions
   - Chrome: Settings → Privacy → Site Settings → Notifications
   - Firefox: Preferences → Privacy → Permissions → Notifications
   - Safari: Preferences → Websites → Notifications
2. Ensure notifications are allowed for your domain
3. Check if "Do Not Disturb" mode is enabled

**For SMS:**
1. Verify phone number in admin profile
2. Check phone number format (+1234567890)
3. Verify SMS service status in health dashboard
4. Check for carrier issues or blocks

**For Email:**
1. Verify email address in admin profile
2. Check spam/junk folder
3. Add sender to safe senders list
4. Verify email service status in health dashboard

