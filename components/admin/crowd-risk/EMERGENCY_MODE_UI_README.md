# Emergency Mode UI Controls - Task 9.2 Implementation

## Overview

This document describes the implementation of emergency mode UI controls for the Crowd Risk Engine, completing Task 9.2 from the implementation plan.

## Requirements Coverage

### Requirement 5.4: Manual Emergency Activation
- ✅ Emergency activation button for admin dashboard
- ✅ Manual activation by authorized administrators
- ✅ Area selection for targeted emergency response
- ✅ Confirmation dialog to prevent accidental activation

### Requirement 5.5: Emergency Deactivation and Logging
- ✅ Emergency mode status indicator with real-time updates
- ✅ Deactivation confirmation dialog
- ✅ Display of affected areas during emergency
- ✅ Audit logging support (admin ID, timestamp, trigger type)

## Components Implemented

### 1. EmergencyModeControls Component
**File:** `components/admin/crowd-risk/emergency-mode-controls.tsx`

Main component providing comprehensive emergency mode management:

#### Features:
- **Emergency Status Indicator**
  - Prominent visual alert with animation (pulsing red border)
  - Displays trigger area, activation time, and trigger type
  - Shows admin ID who activated emergency mode
  - Lists all affected areas with badges
  - Elapsed time since activation
  - Quick deactivation button

- **Emergency Activation Controls**
  - Area selection grid for targeted activation
  - Quick activate button for current area
  - Warning message explaining emergency mode effects
  - Disabled state when emergency is already active

- **Activation Confirmation Dialog**
  - Clear warning about emergency mode consequences
  - Lists all actions that will be triggered
  - Requires explicit confirmation
  - Cancel option to prevent accidental activation

- **Deactivation Confirmation Dialog**
  - Confirmation required before deactivation
  - Shows duration of emergency mode
  - Lists actions that will occur on deactivation
  - Ensures situation is resolved before deactivating

#### Props:
```typescript
interface EmergencyModeControlsProps {
  areas: MonitoredArea[];           // List of monitored areas
  currentAreaId?: string;            // Current area for quick activation
  adminId: string;                   // Admin performing the action
  onEmergencyActivate?: (areaId: string, adminId: string) => void;
  onEmergencyDeactivate?: (adminId: string) => void;
}
```

#### Usage Example:
```tsx
import { EmergencyModeControls } from '@/components/admin/crowd-risk';

<EmergencyModeControls
  areas={monitoredAreas}
  currentAreaId="area-2"
  adminId="admin-001"
  onEmergencyActivate={(areaId, adminId) => {
    console.log(`Emergency activated for ${areaId} by ${adminId}`);
  }}
  onEmergencyDeactivate={(adminId) => {
    console.log(`Emergency deactivated by ${adminId}`);
  }}
/>
```

### 2. EmergencyStatusBadge Component
**File:** `components/admin/crowd-risk/emergency-status-badge.tsx`

Compact status indicator for headers and navigation:

#### Features:
- Displays "EMERGENCY MODE" with alert icon when active
- Shows "Normal Operations" with check icon when inactive
- Pulsing animation during emergency
- Optional visibility control when inactive
- Minimal footprint for header placement

#### Props:
```typescript
interface EmergencyStatusBadgeProps {
  className?: string;              // Additional CSS classes
  showWhenInactive?: boolean;      // Show badge even when not in emergency
}
```

#### Usage Example:
```tsx
import { EmergencyStatusBadge } from '@/components/admin/crowd-risk';

// In header or navigation
<EmergencyStatusBadge showWhenInactive />

// Only show during emergency
<EmergencyStatusBadge />
```

### 3. Emergency Mode Demo Page
**File:** `app/admin/crowd-risk/emergency-demo/page.tsx`

Demonstration page showcasing all emergency mode UI features:

#### Features:
- Interactive emergency mode controls
- Activity log showing activation/deactivation events
- Monitored areas overview with adjacency information
- Feature documentation and requirements coverage
- Mock data for testing without backend service

#### Access:
Navigate to `/admin/crowd-risk/emergency-demo` to view the demo.

## Integration with EmergencyModeManager (Task 9.1)

The UI components are designed to integrate with the EmergencyModeManager service (to be implemented in Task 9.1). Currently, they use mock state for demonstration purposes.

### Integration Points:

```typescript
// TODO: Replace mock state with actual EmergencyModeManager
import { getEmergencyModeManager } from '@/lib/crowd-risk';

// Subscribe to emergency state changes
useEffect(() => {
  const manager = getEmergencyModeManager();
  const unsubscribe = manager.onEmergencyStateChange((state) => {
    setEmergencyState(state);
  });
  return unsubscribe;
}, []);

// Activate emergency mode
const handleActivate = (areaId: string) => {
  const manager = getEmergencyModeManager();
  manager.activateEmergency(areaId, EmergencyTrigger.MANUAL, adminId);
};

// Deactivate emergency mode
const handleDeactivate = () => {
  const manager = getEmergencyModeManager();
  manager.deactivateEmergency(adminId);
};
```

## UI/UX Design Decisions

### Visual Hierarchy
1. **Emergency Active State**: Red, pulsing alert at the top of the page
2. **Activation Controls**: Clearly separated with warning messages
3. **Confirmation Dialogs**: Modal dialogs requiring explicit user action

### Color Scheme
- **Emergency Active**: Red (`destructive` variant) with pulsing animation
- **Normal State**: Green/secondary colors
- **Warning Messages**: Amber/yellow for cautionary information

### Accessibility
- Clear visual indicators with icons
- Descriptive text for all actions
- Confirmation dialogs prevent accidental activation
- Keyboard navigation support through Radix UI components

### Responsive Design
- Grid layouts adapt to screen size (1/2/3 columns)
- Mobile-friendly button sizes
- Scrollable area lists for small screens

## Testing Recommendations

### Manual Testing
1. **Activation Flow**
   - Click area selection button
   - Verify confirmation dialog appears
   - Confirm activation
   - Verify status indicator appears
   - Check affected areas are displayed correctly

2. **Deactivation Flow**
   - Click deactivate button in status indicator
   - Verify confirmation dialog appears
   - Confirm deactivation
   - Verify status indicator disappears

3. **Edge Cases**
   - Try activating when already active (should be disabled)
   - Cancel activation dialog
   - Cancel deactivation dialog
   - Test with different areas and adjacency configurations

### Integration Testing (After Task 9.1)
1. Verify state synchronization with EmergencyModeManager
2. Test notification delivery on activation/deactivation
3. Verify audit logging captures all events
4. Test automatic activation from threshold breach
5. Verify adjacent area expansion logic

## Files Created

1. `components/admin/crowd-risk/emergency-mode-controls.tsx` - Main controls component
2. `components/admin/crowd-risk/emergency-status-badge.tsx` - Compact status badge
3. `app/admin/crowd-risk/emergency-demo/page.tsx` - Demo page
4. `components/admin/crowd-risk/EMERGENCY_MODE_UI_README.md` - This documentation

## Files Modified

1. `components/admin/crowd-risk/index.ts` - Added exports for new components

## Next Steps

1. **Task 9.1**: Implement EmergencyModeManager service
2. **Task 9.3**: Integrate emergency mode with notification services
3. **Integration**: Connect UI components to EmergencyModeManager
4. **Testing**: Comprehensive testing with real backend service
5. **Task 10.1-10.2**: Integrate emergency controls into admin dashboard

## Dependencies

- React 19
- Radix UI components (Button, Card, Badge, AlertDialog, Alert)
- Lucide React icons
- Sonner for toast notifications
- Tailwind CSS for styling

## Notes

- Components use mock state until EmergencyModeManager is implemented
- All TODO comments mark integration points for Task 9.1
- Components follow existing patterns from other crowd-risk components
- Fully typed with TypeScript for type safety
- Responsive and accessible design using Radix UI primitives
