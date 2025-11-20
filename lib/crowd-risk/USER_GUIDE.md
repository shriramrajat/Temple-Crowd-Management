# Crowd Risk Engine - User Guide

## Introduction

Welcome to the Crowd Risk Engine user guide. This document will help you understand and effectively use the system to monitor crowd safety and respond to alerts.

---

## Getting Started

### Accessing the System

1. **Login**: Navigate to your admin dashboard and log in with your credentials
2. **Navigate to Crowd Risk**: Click "Crowd Risk" in the main navigation menu
3. **Dashboard**: You'll see the main monitoring dashboard at `/admin/crowd-risk/monitor`

### Dashboard Overview

The main dashboard consists of four key sections:

1. **Area Monitoring Grid**: Real-time view of all monitored areas
2. **Active Alerts Panel**: Current unacknowledged alerts
3. **Alert History**: Recent alerts from the last 24 hours
4. **System Health**: Overall system status indicator

---

## Understanding Visual Indicators

### Color Coding System

The system uses a color-coded system to indicate crowd density levels:

| Color | Status | Meaning | Action Required |
|-------|--------|---------|-----------------|
| 🟢 Green | Normal | Density below warning threshold | Monitor normally |
| 🟡 Yellow | Warning | Density above warning, below critical | Increased attention |
| 🔴 Red | Critical | Density above critical, below emergency | Immediate attention |
| 🔴 Blinking | Emergency | Density above emergency threshold | Emergency response |

### Indicator Components

Each area card displays:

- **Area Name**: Location identifier
- **Current Density**: Percentage or people per square meter
- **Status Badge**: Color-coded indicator
- **Trend Arrow**: ↑ increasing, ↓ decreasing, → stable
- **Last Update**: Timestamp of last reading
- **Capacity**: Current vs. maximum capacity


---

## Working with Alerts

### Receiving Alerts

Alerts are delivered through multiple channels based on your preferences:

1. **Push Notifications**: In-app toast notifications (instant)
2. **SMS**: Text messages to your registered phone
3. **Email**: Email alerts to your registered address
4. **Audio**: Sound alerts for critical/emergency levels (in-app)

### Alert Information

Each alert contains:

- **Severity Level**: Warning, Critical, or Emergency
- **Area**: Location where threshold was exceeded
- **Current Density**: Actual density value
- **Threshold**: The threshold that was exceeded
- **Timestamp**: When the alert was generated
- **Suggested Actions**: Recommended response steps
- **Affected Count**: Estimated number of people affected

### Acknowledging Alerts

**Why Acknowledge?**
- Confirms you've seen the alert
- Removes from unacknowledged count
- Tracks response times
- Coordinates team response

**How to Acknowledge:**

1. **From Notification**:
   - Click on the toast notification
   - Click "Acknowledge" in the alert dialog

2. **From Alert List**:
   - Find alert in Active Alerts panel
   - Click the alert row
   - Click "Acknowledge" button

3. **Bulk Acknowledge**:
   - Select multiple alerts (checkbox)
   - Click "Acknowledge Selected"

**Best Practices:**
- Acknowledge alerts promptly
- Add notes about actions taken
- Don't acknowledge until you've reviewed the situation
- Coordinate with team to avoid duplicate responses


---

## Monitoring Areas

### Viewing Area Details

**To view detailed information for an area:**

1. Click on any area card in the monitoring grid
2. A detail panel opens showing:
   - Current density with large display
   - Density trend chart (last hour)
   - Active threshold configuration
   - Recent alerts for this area
   - Adjacent areas
   - Historical data

### Density Trend Charts

The trend chart shows:

- **X-axis**: Time (last 1 hour by default)
- **Y-axis**: Density percentage
- **Threshold Lines**: Horizontal lines showing warning, critical, emergency levels
- **Current Value**: Highlighted point on the chart
- **Color Zones**: Background shading for threshold levels

**Interpreting Trends:**

- **Steady Increase**: Potential crowd buildup, monitor closely
- **Rapid Spike**: Immediate attention needed
- **Fluctuating**: Normal crowd movement
- **Steady Decrease**: Crowd dispersing, positive sign
- **Plateau at High Level**: Sustained high density, concerning

### Comparing Areas

**To compare multiple areas:**

1. Navigate to `/admin/crowd-risk/analytics`
2. Select "Area Comparison" tab
3. Choose areas to compare (up to 4)
4. View side-by-side density trends
5. Identify patterns and correlations

**Use Cases:**

- Identify crowd flow patterns
- Detect crowd migration between areas
- Coordinate traffic management
- Plan resource allocation


---

## Configuring Thresholds

### When to Adjust Thresholds

Consider adjusting thresholds when:

- Alert frequency is too high (alert fatigue)
- Alert frequency is too low (missing issues)
- Area capacity has changed
- Event type has changed
- Historical data shows better values
- Seasonal or time-based patterns emerge

### Basic Threshold Configuration

**Steps:**

1. Click on area card
2. Click "Configure Thresholds" button
3. Adjust the three threshold values:
   - **Warning**: Early alert level
   - **Critical**: Urgent attention needed
   - **Emergency**: Dangerous conditions
4. Click "Save Configuration"
5. Changes apply within 10 seconds

**Guidelines:**

- Start conservative (lower thresholds)
- Adjust based on historical data
- Consider area type and purpose
- Coordinate with safety team
- Document reasons for changes

### Time-Based Profiles

**When to Use:**

- Different crowd patterns at different times
- Peak vs. off-peak hours
- Event-specific schedules
- Day vs. night operations

**Creating a Profile:**

1. In threshold configuration dialog
2. Click "Add Time Profile"
3. Set start time (HH:mm format)
4. Set end time (HH:mm format)
5. Configure thresholds for this period
6. Click "Add Profile"
7. Repeat for additional time periods
8. Save configuration

**Example Scenario:**

Morning rush (08:00-12:00):
- Warning: 50%, Critical: 65%, Emergency: 80%

Afternoon normal (12:00-18:00):
- Warning: 60%, Critical: 75%, Emergency: 90%

Evening exit (18:00-22:00):
- Warning: 55%, Critical: 70%, Emergency: 85%

**Important Rules:**

- Time ranges cannot overlap
- Start time must be before end time
- Threshold ordering still applies (W < C < E)
- Default thresholds used outside defined periods


---

## Using Analytics

### Accessing Analytics Dashboard

Navigate to `/admin/crowd-risk/analytics` to access historical data and trends.

### Available Reports

#### 1. Density Trends Report

**Purpose**: Visualize density patterns over time

**Features**:
- Line charts for each area
- Selectable time ranges (1h, 6h, 24h, 7d, 30d)
- Threshold lines overlaid
- Zoom and pan capabilities
- Export to CSV

**Use Cases**:
- Identify peak hours
- Plan staffing levels
- Optimize threshold values
- Predict crowd patterns

#### 2. Alert Frequency Report

**Purpose**: Analyze alert patterns

**Features**:
- Bar charts by severity, area, time
- Heatmap view by day/hour
- Comparison across time periods
- Filter by area or severity

**Use Cases**:
- Identify problem areas
- Evaluate threshold effectiveness
- Plan preventive measures
- Report to stakeholders

#### 3. Response Time Report

**Purpose**: Track team performance

**Features**:
- Average acknowledgment time
- Average resolution time
- Response time trends
- By admin, area, or severity

**Use Cases**:
- Evaluate team performance
- Identify training needs
- Optimize procedures
- Set performance goals

#### 4. Notification Performance Report

**Purpose**: Monitor system reliability

**Features**:
- Delivery success rates by channel
- Average delivery times
- Failure analysis
- Trend over time

**Use Cases**:
- Ensure system reliability
- Identify channel issues
- Optimize notification strategy
- Meet SLA targets (99.5%)

### Exporting Data

**To export data:**

1. Select desired report
2. Apply filters (time range, areas, etc.)
3. Click "Export Data" button
4. Choose format:
   - **CSV**: For spreadsheet analysis
   - **JSON**: For programmatic use
   - **PDF**: For reports and presentations
5. Download file

**Export Contents**:
- All visible data points
- Applied filters documented
- Timestamp of export
- Metadata (areas, time range, etc.)


---

## Managing Notification Preferences

### Accessing Preferences

1. Navigate to `/admin/crowd-risk/monitor`
2. Click your profile icon or "Settings"
3. Select "Notification Preferences"

### Channel Selection

**Available Channels:**

1. **Push Notifications**
   - Instant in-app alerts
   - Requires browser permission
   - Works when dashboard is open
   - Recommended: Always enabled

2. **SMS**
   - Text message alerts
   - Works anywhere with cell service
   - May have carrier delays (1-5 seconds)
   - Recommended: For critical and emergency

3. **Email**
   - Email alerts
   - Good for record keeping
   - May have delays (5-30 seconds)
   - Recommended: For all levels (archive)

**Configuration:**

- Select one or more channels
- At least one channel required
- Emergency mode overrides preferences
- Test notifications available

### Severity Filtering

**Choose which levels trigger notifications:**

- ☑️ **Warning**: Early alerts (may be frequent)
- ☑️ **Critical**: Urgent situations (recommended)
- ☑️ **Emergency**: Highest priority (strongly recommended)

**Recommendations by Role:**

**Safety Manager:**
- All channels: Push, SMS, Email
- All severities: Warning, Critical, Emergency

**Operations Manager:**
- Channels: Push, SMS
- Severities: Critical, Emergency

**Monitor Operator:**
- Channels: Push
- Severities: Warning, Critical, Emergency

### Area Filtering

**Options:**

1. **All Areas** (default)
   - Receive alerts from any monitored area
   - Recommended for safety managers

2. **Specific Areas**
   - Select areas you're responsible for
   - Reduces notification volume
   - Useful for zone-based teams

**Configuration:**

- Leave empty for all areas
- Select specific areas from list
- Can select multiple areas
- Changes apply immediately

### Testing Notifications

**To test your configuration:**

1. In notification preferences
2. Click "Send Test Notification"
3. Select channel to test
4. Receive test alert within seconds
5. Verify receipt and format

**Troubleshooting Tests:**

- **Push not received**: Check browser permissions
- **SMS not received**: Verify phone number
- **Email not received**: Check spam folder


---

## Best Practices

### Daily Operations

**Start of Shift:**

1. ✅ Check system health dashboard
2. ✅ Review overnight alerts and resolutions
3. ✅ Verify all areas are being monitored
4. ✅ Test notification channels
5. ✅ Review today's expected crowd patterns
6. ✅ Coordinate with team on threshold settings

**During Shift:**

1. ✅ Monitor dashboard continuously
2. ✅ Acknowledge alerts promptly (within 2 minutes)
3. ✅ Document actions taken for each alert
4. ✅ Communicate with field staff
5. ✅ Watch for trend patterns
6. ✅ Adjust thresholds if needed

**End of Shift:**

1. ✅ Review all alerts from shift
2. ✅ Ensure all alerts are acknowledged
3. ✅ Document any threshold changes made
4. ✅ Brief incoming shift on current status
5. ✅ Note any areas of concern
6. ✅ Export shift report if required

### Alert Response Guidelines

**Warning Level (Yellow):**

- **Response Time**: Within 5 minutes
- **Actions**:
  - Monitor trend closely
  - Alert field staff to watch area
  - Prepare crowd management resources
  - Consider preventive measures
- **Documentation**: Brief note on actions

**Critical Level (Red):**

- **Response Time**: Within 2 minutes
- **Actions**:
  - Immediate field staff deployment
  - Activate crowd control measures
  - Consider traffic redirection
  - Notify senior management
  - Prepare for escalation
- **Documentation**: Detailed action log

**Emergency Level (Red Blinking):**

- **Response Time**: Immediate
- **Actions**:
  - Follow emergency procedures
  - Deploy all available resources
  - Activate emergency protocols
  - Coordinate with emergency services
  - Consider emergency mode activation
- **Documentation**: Complete incident report

### Communication Protocols

**Internal Communication:**

- Use designated communication channels
- Provide clear, concise updates
- Include area, severity, and actions
- Confirm receipt of critical messages
- Maintain communication log

**External Communication:**

- Follow organizational guidelines
- Coordinate with public relations
- Provide accurate information only
- Avoid speculation
- Document all external communications

### Threshold Optimization

**Review Cycle:**

1. **Weekly**: Review alert frequency by area
2. **Monthly**: Analyze patterns and adjust thresholds
3. **Quarterly**: Comprehensive threshold review
4. **Annually**: Major threshold strategy review

**Optimization Process:**

1. Export alert history data
2. Identify areas with too many/few alerts
3. Analyze density patterns
4. Calculate optimal threshold values
5. Test new thresholds during low-risk period
6. Monitor results and fine-tune
7. Document changes and rationale

---

## Keyboard Shortcuts

Improve efficiency with keyboard shortcuts:

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Quick search areas |
| `Ctrl/Cmd + A` | View all alerts |
| `Ctrl/Cmd + H` | View alert history |
| `Ctrl/Cmd + S` | Open settings |
| `Ctrl/Cmd + E` | Emergency mode toggle |
| `Esc` | Close dialogs |
| `Space` | Acknowledge selected alert |
| `Arrow Keys` | Navigate area grid |
| `Enter` | Open selected area details |

---

## Mobile Access

### Mobile Browser

The dashboard is responsive and works on mobile browsers:

- **Recommended**: Chrome, Safari, Firefox
- **Minimum Screen**: 375px width (iPhone SE)
- **Features**: Full functionality available
- **Limitations**: Smaller charts, reduced grid size

### Mobile Best Practices

1. Use landscape orientation for better view
2. Enable browser notifications
3. Keep app in foreground for real-time updates
4. Use mobile data backup if WiFi unstable
5. Bookmark dashboard for quick access

---

## Getting Help

### In-App Help

- Click "?" icon in top-right corner
- Access context-sensitive help
- View video tutorials
- Search documentation

### Support Contacts

- **Technical Support**: support@your-domain.com
- **Emergency Hotline**: [Emergency Contact]
- **Training**: training@your-domain.com
- **Feedback**: feedback@your-domain.com

### Additional Resources

- [Full Documentation](./README.md)
- [API Reference](./API_REFERENCE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Emergency Procedures](./EMERGENCY_PROCEDURES.md)

---

**Document Version**: 1.0.0  
**Last Updated**: November 2025  
**For**: Crowd Risk Engine v1.0
