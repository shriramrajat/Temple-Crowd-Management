# Admin Configuration Guide - Crowd Risk Engine

## Table of Contents

1. [Getting Started](#getting-started)
2. [Threshold Configuration](#threshold-configuration)
3. [Notification Preferences](#notification-preferences)
4. [Time-Based Profiles](#time-based-profiles)
5. [Area Management](#area-management)
6. [Emergency Mode Configuration](#emergency-mode-configuration)
7. [Audit Log Review](#audit-log-review)
8. [Best Practices](#best-practices)

---

## Getting Started

### First-Time Setup

When you first access the Crowd Risk Engine admin dashboard, follow these steps:

1. **Access the Dashboard**
   - Navigate to `/admin/crowd-risk/monitor`
   - Ensure you have admin permissions

2. **Review Default Settings**
   - Check default threshold configurations
   - Review notification preferences
   - Verify monitored areas

3. **Configure Your Preferences**
   - Set up notification channels
   - Configure severity filters
   - Select areas to monitor

4. **Test the System**
   - Send test notifications
   - Verify alert delivery
   - Check indicator displays

### Dashboard Overview

The admin dashboard consists of several key sections:

- **Area Monitoring Grid**: Real-time view of all monitored areas
- **Active Alerts Panel**: Current unacknowledged alerts
- **Alert History**: Recent alerts from the last 24 hours
- **System Health**: Overall system status indicator
- **Configuration Panel**: Access to threshold and notification settings

---

## Threshold Configuration

### Understanding Thresholds

Thresholds define the density levels at which alerts are triggered. There are three threshold levels:

| Level | Purpose | Typical Range | Action Required |
|-------|---------|---------------|-----------------|
| **Warning** | Early alert | 50-65% | Increased monitoring |
| **Critical** | Urgent attention | 70-80% | Immediate action |
| **Emergency** | Dangerous conditions | 85-95% | Emergency response |

### Accessing Threshold Configuration

**Method 1: From Area Card**

1. Navigate to `/admin/crowd-risk/monitor`
2. Click on any area card in the monitoring grid
3. Click the "Configure Thresholds" button
4. The configuration dialog opens

**Method 2: From Configuration Menu**

1. Click "Settings" in the top navigation
2. Select "Threshold Configuration"
3. Choose the area to configure
4. The configuration dialog opens

### Setting Basic Thresholds

#### Step-by-Step Instructions

1. **Open Configuration Dialog**
   - Select the area you want to configure
   - Click "Configure Thresholds"

2. **Enter Threshold Values**
   ```
   Warning Threshold:   [60] %
   Critical Threshold:  [75] %
   Emergency Threshold: [90] %
   ```

3. **Validation Rules**
   - All values must be positive numbers
   - Warning < Critical < Emergency (enforced automatically)
   - Values typically range from 0-100 for percentage-based density

4. **Save Configuration**
   - Click "Save Configuration"
   - Changes apply within 10 seconds
   - Confirmation message appears

#### Example Configurations

**Conservative (High Safety Margin)**
```
Warning:   50%
Critical:  65%
Emergency: 80%
```
Use for: High-risk areas, narrow corridors, areas with limited exits

**Moderate (Balanced)**
```
Warning:   60%
Critical:  75%
Emergency: 90%
```
Use for: Standard areas, main entrances, gathering spaces

**Permissive (Higher Capacity)**
```
Warning:   70%
Critical:  85%
Emergency: 95%
```
Use for: Open areas, temporary high-capacity events, areas with multiple exits

### Validation and Error Handling

#### Common Validation Errors

**Error: "Warning threshold must be less than critical threshold"**

❌ Invalid:
```
Warning:   80%
Critical:  70%  ← Error: Must be greater than warning
Emergency: 90%
```

✅ Valid:
```
Warning:   60%
Critical:  75%  ← Greater than warning
Emergency: 90%
```

**Error: "Critical threshold must be less than emergency threshold"**

❌ Invalid:
```
Warning:   60%
Critical:  90%
Emergency: 85%  ← Error: Must be greater than critical
```

✅ Valid:
```
Warning:   60%
Critical:  75%
Emergency: 90%  ← Greater than critical
```

**Error: "Threshold values must be positive"**

❌ Invalid:
```
Warning:   -10%  ← Error: Negative value
Critical:  75%
Emergency: 90%
```

✅ Valid:
```
Warning:   50%  ← Positive value
Critical:  75%
Emergency: 90%
```

### Threshold Adjustment Guidelines

#### When to Adjust Thresholds

**Increase Thresholds When:**
- Too many false alarms
- Alert fatigue among staff
- Historical data shows safe operation at higher densities
- Area capacity has increased
- Improved crowd management procedures

**Decrease Thresholds When:**
- Missing actual safety issues
- Historical incidents at current levels
- Area capacity has decreased
- Increased safety requirements
- High-risk events or conditions

#### Adjustment Process

1. **Analyze Current Performance**
   - Review alert frequency (last 7-30 days)
   - Check false alarm rate
   - Review missed incidents
   - Analyze density patterns

2. **Calculate Optimal Values**
   - Use analytics dashboard
   - Review density distribution
   - Identify 90th, 95th, 99th percentiles
   - Set thresholds based on percentiles

3. **Make Incremental Changes**
   - Adjust by 5-10% at a time
   - Don't make large jumps
   - Test during low-risk periods
   - Monitor results for 24-48 hours

4. **Document Changes**
   - Add reason in audit log
   - Note expected outcomes
   - Set review date
   - Communicate to team

#### Example Adjustment Scenario

**Problem**: Too many warning alerts (50+ per day)

**Analysis**:
- 90% of alerts are false alarms
- Actual incidents occur at 75%+ density
- Current warning threshold: 60%

**Solution**:
1. Increase warning threshold from 60% to 65%
2. Monitor for 48 hours
3. If still too many alerts, increase to 70%
4. Document changes in audit log

**Result**:
- Alert frequency reduced to 15 per day
- No missed incidents
- Improved staff response time

---

## Notification Preferences

### Channel Configuration

#### Available Channels

**1. Push Notifications**

**Characteristics**:
- Instant delivery (< 1 second)
- Requires browser permission
- Works when dashboard is open
- In-app toast notifications
- Sound alerts for critical/emergency

**Setup**:
1. Navigate to Notification Settings
2. Enable "Push Notifications"
3. Grant browser permission when prompted
4. Test notification delivery

**Best For**:
- Real-time monitoring
- Immediate awareness
- Dashboard operators

**2. SMS Notifications**

**Characteristics**:
- Fast delivery (1-5 seconds)
- Works anywhere with cell service
- No internet required
- Character limit (160 chars)
- May have carrier delays

**Setup**:
1. Navigate to Notification Settings
2. Enable "SMS Notifications"
3. Verify phone number in profile
4. Format: +1234567890 (international format)
5. Test SMS delivery

**Best For**:
- Mobile administrators
- Field staff
- Critical/emergency alerts only

**3. Email Notifications**

**Characteristics**:
- Slower delivery (5-30 seconds)
- Detailed information possible
- Good for record keeping
- Can include attachments
- May go to spam folder

**Setup**:
1. Navigate to Notification Settings
2. Enable "Email Notifications"
3. Verify email address in profile
4. Add sender to safe senders list
5. Test email delivery

**Best For**:
- Documentation
- Non-urgent alerts
- Detailed reports
- Audit trail

### Severity Filtering

#### Configuring Severity Levels

**Option 1: Receive All Alerts**
```
☑ Warning
☑ Critical
☑ Emergency
```
**Recommended for**: Safety managers, primary monitors

**Option 2: Critical and Emergency Only**
```
☐ Warning
☑ Critical
☑ Emergency
```
**Recommended for**: Operations managers, secondary monitors

**Option 3: Emergency Only**
```
☐ Warning
☐ Critical
☑ Emergency
```
**Recommended for**: Senior management, on-call staff

#### Severity Level Details

**Warning Level**
- **Frequency**: High (10-50 per day)
- **Urgency**: Low to moderate
- **Response Time**: Within 5 minutes
- **Typical Actions**: Monitor, prepare resources
- **Notification**: Push only (default)

**Critical Level**
- **Frequency**: Moderate (5-20 per day)
- **Urgency**: High
- **Response Time**: Within 2 minutes
- **Typical Actions**: Deploy staff, activate controls
- **Notification**: Push + SMS (recommended)

**Emergency Level**
- **Frequency**: Low (0-5 per day)
- **Urgency**: Immediate
- **Response Time**: Immediate
- **Typical Actions**: Emergency response, evacuation
- **Notification**: All channels (mandatory)

### Area Filtering

#### Configuring Area Filters

**Option 1: All Areas (Default)**
```
Area Filter: [Empty]
```
- Receive alerts from any monitored area
- Recommended for safety managers
- Highest alert volume

**Option 2: Specific Areas**
```
Area Filter: [Main Entrance, Exit Gate A, Corridor 1]
```
- Receive alerts only from selected areas
- Recommended for zone-based teams
- Reduced alert volume

**Option 3: Area Groups**
```
Area Group: [North Zone]
  - Main Entrance
  - Corridor 1
  - Gathering Space A
```
- Receive alerts from predefined groups
- Recommended for regional managers
- Organized alert management

#### Setting Up Area Filters

1. **Navigate to Notification Settings**
   - Click "Settings" → "Notification Preferences"

2. **Select Area Filter Mode**
   - Choose "All Areas" or "Specific Areas"

3. **Select Areas (if specific)**
   - Click "Add Area"
   - Select from dropdown
   - Repeat for multiple areas

4. **Save Configuration**
   - Click "Save Preferences"
   - Changes apply immediately

### Emergency Mode Override

**Important**: During emergency mode, all notification preferences are overridden:

- **All admins** receive notifications
- **All channels** are used
- **All severity filters** are bypassed
- **All area filters** are ignored

This ensures maximum awareness during critical situations.

### Testing Notifications

#### How to Test

1. **Navigate to Notification Settings**
   - Click "Settings" → "Notification Preferences"

2. **Click "Send Test Notification"**
   - Select channel to test
   - Test notification is sent immediately

3. **Verify Receipt**
   - **Push**: Check for toast notification
   - **SMS**: Check phone for text message
   - **Email**: Check inbox (and spam folder)

4. **Troubleshoot if Not Received**
   - See [Troubleshooting Guide](./TROUBLESHOOTING.md)

#### Test Notification Content

**Push Notification**:
```
🔔 Test Notification
This is a test notification from the Crowd Risk Engine.
If you received this, your push notifications are working correctly.
```

**SMS**:
```
TEST: Crowd Risk Engine notification test. Reply STOP to unsubscribe.
```

**Email**:
```
Subject: Test Notification - Crowd Risk Engine

This is a test notification from the Crowd Risk Engine.
If you received this email, your email notifications are configured correctly.

Please do not reply to this automated message.
```

---

## Time-Based Profiles

### Understanding Time-Based Profiles

Time-based profiles allow you to configure different thresholds for different times of day or event phases.

**Use Cases**:
- Peak hours vs. off-peak hours
- Event start vs. event end
- Day vs. night operations
- Weekday vs. weekend patterns

### Creating Time-Based Profiles

#### Step-by-Step Instructions

1. **Open Threshold Configuration**
   - Navigate to area configuration
   - Click "Configure Thresholds"

2. **Click "Add Time Profile"**
   - Time profile section appears

3. **Set Time Range**
   ```
   Start Time: [08:00]  (HH:mm format)
   End Time:   [12:00]  (HH:mm format)
   ```

4. **Configure Thresholds for This Period**
   ```
   Warning:   [50] %
   Critical:  [65] %
   Emergency: [80] %
   ```

5. **Add Additional Profiles**
   - Click "Add Another Profile"
   - Repeat steps 3-4

6. **Save Configuration**
   - Click "Save Configuration"
   - Profiles apply immediately

#### Example: Daily Event Schedule

**Morning Setup (06:00-09:00)**
```
Start Time: 06:00
End Time:   09:00
Warning:    40%  ← Lower (setup period)
Critical:   55%
Emergency:  70%
```

**Peak Hours (09:00-14:00)**
```
Start Time: 09:00
End Time:   14:00
Warning:    50%  ← Lower (high traffic expected)
Critical:   65%
Emergency:  80%
```

**Afternoon Normal (14:00-18:00)**
```
Start Time: 14:00
End Time:   18:00
Warning:    60%  ← Standard
Critical:   75%
Emergency:  90%
```

**Evening Exit (18:00-22:00)**
```
Start Time: 18:00
End Time:   22:00
Warning:    55%  ← Lower (exit rush)
Critical:   70%
Emergency:  85%
```

**Default (22:00-06:00)**
```
No profile (uses default thresholds)
Warning:    70%  ← Higher (low traffic)
Critical:   85%
Emergency:  95%
```

### Time Profile Validation

#### Validation Rules

1. **Time Format**
   - Must be HH:mm format (24-hour)
   - Valid: 08:00, 14:30, 23:59
   - Invalid: 8:00, 2:30 PM, 25:00

2. **Time Range**
   - Start time must be before end time
   - Valid: 08:00 to 12:00
   - Invalid: 12:00 to 08:00 (use two profiles: 12:00-23:59 and 00:00-08:00)

3. **No Overlaps**
   - Time ranges cannot overlap
   - Valid: 08:00-12:00 and 12:00-18:00
   - Invalid: 08:00-13:00 and 12:00-18:00 (overlap: 12:00-13:00)

4. **Threshold Ordering**
   - Warning < Critical < Emergency (same as basic thresholds)

#### Common Validation Errors

**Error: "Start time must be before end time"**

❌ Invalid:
```
Start Time: 18:00
End Time:   08:00  ← Error: Before start time
```

✅ Valid (split into two profiles):
```
Profile 1:
  Start Time: 18:00
  End Time:   23:59

Profile 2:
  Start Time: 00:00
  End Time:   08:00
```

**Error: "Time ranges overlap"**

❌ Invalid:
```
Profile 1: 08:00 - 13:00
Profile 2: 12:00 - 18:00  ← Error: Overlaps with Profile 1
```

✅ Valid:
```
Profile 1: 08:00 - 12:00
Profile 2: 12:00 - 18:00  ← No overlap (12:00 is boundary)
```

### Managing Time Profiles

#### Editing Profiles

1. Open threshold configuration
2. Find the profile to edit
3. Click "Edit" button
4. Modify time range or thresholds
5. Save changes

#### Deleting Profiles

1. Open threshold configuration
2. Find the profile to delete
3. Click "Delete" button
4. Confirm deletion
5. Default thresholds apply during deleted time range

#### Reordering Profiles

Profiles are automatically ordered by start time for clarity.

---

## Area Management

### Monitored Areas

#### Viewing All Areas

1. Navigate to `/admin/crowd-risk/monitor`
2. All monitored areas appear in the grid
3. Each card shows:
   - Area name
   - Current density
   - Threshold level
   - Last update time

#### Area Information

Click on any area card to view detailed information:

- **Current Density**: Real-time density value
- **Threshold Configuration**: Active thresholds
- **Density Trend**: Chart showing last hour
- **Recent Alerts**: Alerts for this area
- **Adjacent Areas**: Connected areas
- **Capacity**: Maximum capacity

### Area Types

Different area types may require different threshold strategies:

| Area Type | Characteristics | Threshold Strategy |
|-----------|----------------|-------------------|
| **Entrance** | High traffic, bottleneck | Lower thresholds |
| **Corridor** | Narrow, limited capacity | Lower thresholds |
| **Gathering Space** | Open, high capacity | Higher thresholds |
| **Exit** | Critical for evacuation | Lower thresholds |

### Adjacent Areas

Adjacent areas are important for:

- **Emergency Mode**: Expands notifications to adjacent areas
- **Crowd Flow**: Understanding crowd movement patterns
- **Coordinated Response**: Managing connected areas together

**Viewing Adjacent Areas**:
1. Click on area card
2. Scroll to "Adjacent Areas" section
3. Click on adjacent area to view its details

---

## Emergency Mode Configuration

### Emergency Mode Settings

#### Activation Thresholds

Emergency mode activates automatically when:

1. **Density Threshold Breach**
   - Any area exceeds emergency threshold
   - Sustained for 5+ seconds

2. **Rapid Density Increase**
   - Density increases >20% in 60 seconds

3. **Multiple Critical Alerts**
   - 3+ critical alerts in adjacent areas within 5 minutes

#### Manual Activation Permissions

Configure which admin roles can manually activate emergency mode:

**Recommended Permissions**:
- ✅ Super Admin: Full access
- ✅ Safety Admin: Full access
- ❌ Monitor Operator: View only
- ❌ Read Only: No access

**Setting Permissions**:
1. Navigate to "Settings" → "Permissions"
2. Select "Emergency Mode"
3. Configure role permissions
4. Save changes

### Emergency Response Configuration

#### Notification Expansion

Configure how notifications expand during emergency:

**Adjacent Area Expansion**:
```
Trigger Area: Main Entrance
Adjacent Areas (auto-selected):
  - Corridor 1
  - Corridor 2
  - Gathering Space A
```

**Notification Recipients**:
- All administrators (regardless of preferences)
- Pilgrims in trigger area
- Pilgrims in adjacent areas

#### Visual Indicators

Emergency mode activates special visual indicators:

- **Color**: Red
- **Blinking**: Yes (2 Hz / 2 cycles per second)
- **Sound**: Audio alert (if enabled)
- **Badge**: "EMERGENCY" badge on area cards

---

## Audit Log Review

### Accessing Audit Logs

1. Navigate to `/admin/crowd-risk/monitor`
2. Click "Settings" → "Audit Log"
3. Or click "View Audit Log" on any area card

### Audit Log Information

Each audit entry contains:

- **Timestamp**: When change was made
- **Admin ID**: Who made the change
- **Area ID**: Which area was affected
- **Previous Configuration**: Old threshold values
- **New Configuration**: New threshold values
- **Reason**: Optional notes about the change

### Filtering Audit Logs

**Filter Options**:
- **Date Range**: Last 24 hours, 7 days, 30 days, custom
- **Admin**: Specific administrator
- **Area**: Specific area
- **Change Type**: Threshold change, profile change, etc.

### Exporting Audit Logs

1. Apply desired filters
2. Click "Export Audit Log"
3. Choose format (CSV or JSON)
4. Download file

**Export Uses**:
- Compliance reporting
- Change tracking
- Performance analysis
- Training materials

---

## Best Practices

### Configuration Management

#### 1. Document All Changes

**Always include a reason when making configuration changes**:

✅ Good:
```
Reason: "Increased warning threshold from 60% to 65% due to 
high false alarm rate (45 alerts/day). Historical data shows 
safe operation at 70%. Monitoring for 48 hours."
```

❌ Bad:
```
Reason: [Empty]
```

#### 2. Make Incremental Changes

**Adjust thresholds gradually**:

✅ Good:
```
Day 1: 60% → 65% (monitor)
Day 3: 65% → 70% (if needed)
```

❌ Bad:
```
Day 1: 60% → 80% (too large a jump)
```

#### 3. Test During Low-Risk Periods

**Make changes when impact is minimal**:

✅ Good:
- Off-peak hours
- Low-attendance days
- After events

❌ Bad:
- During peak hours
- During high-risk events
- Without monitoring

#### 4. Coordinate with Team

**Communicate changes to all stakeholders**:

✅ Good:
- Notify team before changes
- Explain rationale
- Set review date
- Document outcomes

❌ Bad:
- Make changes without notice
- No explanation
- No follow-up

### Notification Management

#### 1. Balance Alert Volume

**Find the right balance**:

- Too many alerts → Alert fatigue
- Too few alerts → Missed incidents

**Target**: 10-30 alerts per day per area

#### 2. Use Appropriate Channels

**Match channel to urgency**:

- **Warning**: Push only
- **Critical**: Push + SMS
- **Emergency**: All channels

#### 3. Regular Testing

**Test notifications regularly**:

- Weekly: Test push notifications
- Monthly: Test SMS and email
- Quarterly: Full system test

### Performance Monitoring

#### 1. Review Analytics Weekly

**Check key metrics**:

- Alert frequency by area
- False alarm rate
- Response times
- Notification delivery rates

#### 2. Adjust Based on Data

**Use analytics to optimize**:

- Identify problem areas
- Adjust thresholds
- Improve response procedures

#### 3. Conduct Quarterly Reviews

**Comprehensive system review**:

- Review all configurations
- Analyze trends
- Update procedures
- Train staff

### Security and Compliance

#### 1. Audit Log Review

**Review audit logs monthly**:

- Verify all changes are authorized
- Check for unusual patterns
- Document compliance

#### 2. Access Control

**Maintain proper permissions**:

- Regular permission audits
- Remove inactive users
- Follow least privilege principle

#### 3. Data Retention

**Follow data retention policies**:

- Archive old alerts (90+ days)
- Maintain audit logs (7 years)
- Backup configurations

---

## Quick Reference

### Common Tasks

| Task | Steps | Time |
|------|-------|------|
| Set basic thresholds | Area card → Configure → Enter values → Save | 2 min |
| Add time profile | Configure → Add Profile → Set times → Save | 3 min |
| Configure notifications | Settings → Notifications → Select channels → Save | 2 min |
| Test notifications | Settings → Notifications → Send Test | 1 min |
| View audit log | Settings → Audit Log | 1 min |
| Activate emergency | Emergency Mode button → Confirm | 30 sec |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Quick search areas |
| `Ctrl/Cmd + S` | Open settings |
| `Ctrl/Cmd + E` | Emergency mode toggle |
| `Esc` | Close dialogs |

### Support Contacts

- **Technical Support**: support@your-domain.com
- **Emergency Hotline**: [Emergency Contact]
- **Training**: training@your-domain.com

---

**Document Version**: 1.0.0  
**Last Updated**: November 2025  
**Maintained by**: TeamDigitalDaredevils
