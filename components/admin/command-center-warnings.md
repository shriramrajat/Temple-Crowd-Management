# High-Density Warning Component

## Overview

The `CommandCenterWarnings` component displays prominent visual warnings when crowd density exceeds safety thresholds in venue zones. It features pulsing animations, density metrics, and integrates with the map component for zone highlighting.

## Features

- **Prominent Visual Design**: Eye-catching cards with gradient backgrounds and pulsing animations
- **Real-time Updates**: Automatically displays warnings when density exceeds thresholds
- **Auto-dismiss**: Warnings automatically disappear when density returns below threshold
- **Zone Highlighting**: Clicking a warning highlights the affected zone on the map
- **Density Metrics**: Shows current density, threshold, and exceedance percentage
- **Responsive**: Works on desktop, tablet, and mobile devices

## Usage

```tsx
import CommandCenterWarnings from '@/components/admin/command-center-warnings';
import { useCommandCenterData } from '@/hooks/use-command-center-data';

function Dashboard() {
  const { warnings } = useCommandCenterData();

  const handleWarningClick = (warning) => {
    // Highlight zone on map or take other action
    console.log('Warning clicked:', warning);
  };

  return (
    <CommandCenterWarnings
      warnings={warnings}
      onWarningClick={handleWarningClick}
    />
  );
}
```

## Props

### `warnings` (required)
- Type: `HighDensityWarning[]`
- Description: Array of warning objects from the `useCommandCenterData` hook

### `onWarningClick` (optional)
- Type: `(warning: HighDensityWarning) => void`
- Description: Callback when a warning card is clicked
- Use case: Highlight the affected zone on the map

### `onWarningDismiss` (optional)
- Type: `(warningId: string) => void`
- Description: Callback when the dismiss button is clicked
- Use case: Manually dismiss a warning (if needed)

## Warning Logic

The warning logic is implemented in the `useCommandCenterData` hook:

1. **Initial Load**: Warnings are generated for zones with `densityLevel === 'critical'`
2. **Real-time Updates**: 
   - When a zone update shows `densityLevel === 'critical'`, a warning is created/updated
   - When density drops below critical, the warning is automatically removed
3. **WebSocket Messages**: The hook also processes `warning` type messages from the WebSocket

## Integration with Map

To coordinate warnings with the map component:

```tsx
function Dashboard() {
  const { warnings, zones } = useCommandCenterData();
  const [selectedZone, setSelectedZone] = useState(null);

  // Get zones that should be highlighted
  const highlightedZones = warnings
    .filter(w => w.status === 'active')
    .map(w => w.zoneId);

  const handleWarningClick = (warning) => {
    setSelectedZone(warning.zoneId);
  };

  return (
    <>
      <CommandCenterWarnings
        warnings={warnings}
        onWarningClick={handleWarningClick}
      />
      <CommandCenterMap
        zones={zones}
        selectedZone={selectedZone}
        highlightedZones={highlightedZones}
        onZoneSelect={setSelectedZone}
      />
    </>
  );
}
```

## Animations

The component uses custom CSS animations defined in `styles/globals.css`:

- **pulse-slow**: Subtle pulsing effect on the entire card (3s cycle)
- **gradient-x**: Animated gradient background (3s cycle)
- **flash**: Flashing border effect (2s cycle)

## Styling

The component uses:
- Red/orange gradient backgrounds for high visibility
- Pulsing icon in the header
- Progress bar showing exceedance percentage
- Responsive grid layout for density metrics
- Dark mode support

## Requirements Satisfied

- **5.1**: Triggers warnings when density exceeds threshold
- **5.2**: Displays warnings with visual prominence (colors, animations)
- **5.3**: Shows zone name, current density, and threshold
- **5.4**: Coordinates with map to highlight affected zones
- **5.5**: Auto-dismisses when density returns below threshold

## Example Dashboard Integration

See `app/admin/command-center/page.tsx` for a complete example of integrating all command center components including warnings.
