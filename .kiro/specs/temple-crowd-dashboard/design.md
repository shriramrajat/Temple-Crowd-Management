# Design Document

## Overview

The Temple Crowd Dashboard is a real-time monitoring application built with Streamlit that provides visual crowd density information for temple zones. The system uses simulated data to demonstrate crowd levels across three main areas (Gate, Hall, Exit) with color-coded heatmap visualization that updates every 5 seconds.

## Architecture

The application follows a simple client-server architecture using Streamlit's built-in capabilities:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Browser   │◄──►│  Streamlit App   │◄──►│  Data Simulator │
│                 │    │                  │    │                 │
│ - Dashboard UI  │    │ - UI Components  │    │ - Random Data   │
│ - Auto Refresh  │    │ - Layout Manager │    │ - Zone Updates  │
│ - Heatmap View  │    │ - State Manager  │    │ - Timing Logic  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components and Interfaces

### 1. Main Dashboard Component
- **Purpose**: Orchestrates the entire dashboard layout and refresh cycle
- **Responsibilities**: 
  - Initialize Streamlit page configuration
  - Manage auto-refresh timing (5-second intervals)
  - Coordinate between data simulation and visualization components

### 2. Data Simulation Component
- **Purpose**: Generates realistic crowd density values for each temple zone
- **Interface**:
  ```python
  def simulate_crowd_data() -> Dict[str, int]:
      # Returns: {"Gate": count, "Hall": count, "Exit": count}
  ```
- **Behavior**: 
  - Generates random values with realistic ranges for each zone
  - Gate: 50-600 people (high variability as entry/exit point)
  - Hall: 100-800 people (main congregation area)
  - Exit: 30-400 people (typically lower than gate)

### 3. Heatmap Visualization Component
- **Purpose**: Renders the temple map with color-coded zones
- **Interface**:
  ```python
  def render_temple_heatmap(crowd_data: Dict[str, int]) -> None:
      # Displays visual temple map with colored zones
  ```
- **Color Mapping**:
  - Green (#90EE90): < 200 people (Low density)
  - Yellow (#FFD700): 200-400 people (Medium density)  
  - Red (#FF6B6B): > 400 people (High density)

### 4. Zone Information Component
- **Purpose**: Displays detailed information for each temple zone
- **Interface**:
  ```python
  def display_zone_info(zone_name: str, count: int, color: str) -> None:
      # Shows zone details with current count and status
  ```

## Data Models

### Zone Data Structure
```python
@dataclass
class ZoneData:
    name: str           # Zone identifier ("Gate", "Hall", "Exit")
    current_count: int  # Current number of people
    color: str         # Color code based on density level
    status: str        # Text description ("Low", "Medium", "High")
    last_updated: datetime  # Timestamp of last update
```

### Dashboard State
```python
@dataclass
class DashboardState:
    zones: Dict[str, ZoneData]  # All zone information
    last_refresh: datetime      # Last data refresh time
    refresh_interval: int       # Seconds between updates (5)
    is_auto_refresh: bool      # Auto-refresh toggle state
```

## Error Handling

### Data Simulation Errors
- **Scenario**: Random number generation fails
- **Handling**: Use fallback default values (Gate: 100, Hall: 200, Exit: 50)
- **User Feedback**: Display warning message about using default values

### Visualization Errors
- **Scenario**: Streamlit component rendering fails
- **Handling**: Show error message and attempt to reload component
- **Fallback**: Display raw numerical data in table format

### Auto-Refresh Errors
- **Scenario**: Streamlit rerun mechanism fails
- **Handling**: Provide manual refresh button as backup
- **User Feedback**: Show last successful update timestamp

## Testing Strategy

### Unit Testing
- Test data simulation functions for correct value ranges
- Verify color mapping logic for different crowd density levels
- Validate zone data structure creation and updates

### Integration Testing
- Test complete dashboard rendering with simulated data
- Verify auto-refresh functionality works correctly
- Test responsive design on different screen sizes

### User Acceptance Testing
- Verify dashboard loads within 3 seconds
- Confirm color changes are visible and intuitive
- Test auto-refresh cycle maintains 5-second intervals
- Validate all zone information displays correctly

## Implementation Approach

### Phase 1: Core Structure
1. Set up Streamlit application with basic layout
2. Implement data simulation for three zones
3. Create basic zone display with numerical values

### Phase 2: Visual Enhancement
1. Implement color-coded heatmap visualization
2. Add temple map layout with zone positioning
3. Style components for better visual appeal

### Phase 3: Real-time Features
1. Implement 5-second auto-refresh mechanism
2. Add timestamp display for last update
3. Optimize performance for smooth updates

### Technical Considerations

- **Performance**: Use Streamlit's `st.rerun()` for efficient page updates
- **State Management**: Leverage Streamlit's session state for data persistence
- **Responsive Design**: Use Streamlit's column layout for mobile compatibility
- **Browser Compatibility**: Ensure compatibility with modern web browsers
- **Memory Usage**: Minimize memory footprint by not storing historical data