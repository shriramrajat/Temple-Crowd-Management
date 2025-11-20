# Emergency Procedures - Crowd Risk Engine

## Quick Reference Card

**Emergency Hotline**: [Insert Emergency Contact]  
**System Status**: `/admin/crowd-risk/health`  
**Manual Activation**: `/admin/crowd-risk/monitor` → Emergency Mode Button

---

## Emergency Mode Activation

### Automatic Activation Triggers

Emergency mode activates automatically when:

1. **Density Threshold Breach**
   - Any area exceeds emergency threshold (typically 90%)
   - Sustained for 5+ seconds to avoid false positives

2. **Rapid Density Increase**
   - Density increases >20% in 60 seconds
   - Indicates potential crowd surge

3. **Multiple Critical Alerts**
   - 3+ critical alerts in adjacent areas within 5 minutes
   - Indicates spreading crowd pressure

### Manual Activation Procedure

**When to Activate Manually:**

- Visual observation of dangerous conditions
- Field staff reports of crowd issues
- Anticipation of crowd surge (e.g., event ending)
- Coordination with other emergency systems
- Precautionary measure during high-risk periods

**Activation Steps:**

1. **Access Dashboard**
   - Navigate to `/admin/crowd-risk/monitor`
   - Ensure you have emergency activation permissions

2. **Initiate Activation**
   - Click red "Emergency Mode" button (top-right)
   - Button is prominent and always visible

3. **Select Trigger Area**
   - Choose the area where emergency originates
   - System will auto-select adjacent areas

4. **Review Impact**
   - Confirm affected areas list
   - Verify notification recipients
   - Review actions that will be taken

5. **Confirm Activation**
   - Click "ACTIVATE EMERGENCY" button
   - System activates within 1 second
   - All admins receive immediate notification

