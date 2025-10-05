"""
Data simulation module for temple crowd monitoring dashboard.
Generates realistic crowd density values for different temple zones.
"""

import random
import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Optional


@dataclass
class ZoneData:
    """Data structure for temple zone information."""
    name: str
    current_count: int
    color: str
    status: str
    last_updated: datetime


def get_fallback_crowd_data() -> Dict[str, int]:
    """
    Get fallback default crowd values when data simulation fails.
    
    Returns:
        Dict[str, int]: Dictionary with zone names and safe default values
    """
    return {
        "Gate": 100,   # Safe default for gate area
        "Hall": 200,   # Safe default for main hall
        "Exit": 50     # Safe default for exit area
    }


def generate_crowd_data() -> Dict[str, int]:
    """
    Generate random crowd density values for each temple zone.
    Includes error handling with fallback to default values.
    
    Returns:
        Dict[str, int]: Dictionary with zone names as keys and crowd counts as values
    """
    try:
        # Define realistic value ranges for each zone
        zone_ranges = {
            "Gate": (50, 600),    # High variability as entry/exit point
            "Hall": (100, 800),   # Main congregation area
            "Exit": (30, 400)     # Typically lower than gate
        }
        
        crowd_data = {}
        for zone, (min_val, max_val) in zone_ranges.items():
            # Validate range values
            if min_val < 0 or max_val < 0 or min_val > max_val:
                logging.warning(f"Invalid range for zone {zone}: ({min_val}, {max_val})")
                raise ValueError(f"Invalid range for zone {zone}")
            
            # Generate random value within range
            crowd_data[zone] = random.randint(min_val, max_val)
        
        return crowd_data
        
    except (ValueError, TypeError, OSError) as e:
        # Log the error for debugging
        logging.error(f"Data simulation failed: {str(e)}")
        
        # Return fallback default values
        return get_fallback_crowd_data()
    
    except Exception as e:
        # Catch any unexpected errors
        logging.error(f"Unexpected error in data simulation: {str(e)}")
        return get_fallback_crowd_data()


def get_zone_color(crowd_count: int) -> str:
    """
    Determine zone color based on crowd density thresholds.
    Includes error handling for invalid input values.
    
    Args:
        crowd_count: Number of people in the zone
        
    Returns:
        str: Color code for the zone
    """
    try:
        # Validate input
        if not isinstance(crowd_count, (int, float)) or crowd_count < 0:
            logging.warning(f"Invalid crowd count: {crowd_count}, using default color")
            return "#CCCCCC"  # Gray for invalid/unknown data
        
        # Convert to int if float
        crowd_count = int(crowd_count)
        
        if crowd_count < 200:
            return "#90EE90"  # Light Green
        elif crowd_count <= 400:
            return "#FFD700"  # Gold/Yellow
        else:
            return "#FF6B6B"  # Light Red
            
    except Exception as e:
        logging.error(f"Error determining zone color: {str(e)}")
        return "#CCCCCC"  # Gray fallback color


def get_zone_status(crowd_count: int) -> str:
    """
    Determine status text based on crowd density thresholds.
    Includes error handling for invalid input values.
    
    Args:
        crowd_count: Number of people in the zone
        
    Returns:
        str: Status description
    """
    try:
        # Validate input
        if not isinstance(crowd_count, (int, float)) or crowd_count < 0:
            logging.warning(f"Invalid crowd count: {crowd_count}, using default status")
            return "Unknown"
        
        # Convert to int if float
        crowd_count = int(crowd_count)
        
        if crowd_count < 200:
            return "Low"
        elif crowd_count <= 400:
            return "Medium"
        else:
            return "High"
            
    except Exception as e:
        logging.error(f"Error determining zone status: {str(e)}")
        return "Unknown"


def create_zone_data(name: str, count: int, color: str = None, status: str = None) -> Optional[ZoneData]:
    """
    Create a ZoneData instance with current timestamp.
    If color and status are not provided, they will be determined based on count.
    Includes error handling for invalid inputs.
    
    Args:
        name: Zone name
        count: Current crowd count
        color: Color code for the zone (optional, will be auto-determined)
        status: Status text description (optional, will be auto-determined)
        
    Returns:
        ZoneData: Structured zone data object, or None if creation fails
    """
    try:
        # Validate inputs
        if not isinstance(name, str) or not name.strip():
            logging.error(f"Invalid zone name: {name}")
            return None
            
        if not isinstance(count, (int, float)) or count < 0:
            logging.warning(f"Invalid count for zone {name}: {count}, using 0")
            count = 0
        
        # Convert to int if float
        count = int(count)
        
        # Determine color and status if not provided
        if color is None:
            color = get_zone_color(count)
        if status is None:
            status = get_zone_status(count)
        
        # Validate color format (basic hex color check)
        if not isinstance(color, str) or not color.startswith('#'):
            logging.warning(f"Invalid color format for zone {name}: {color}")
            color = "#CCCCCC"  # Default gray
        
        return ZoneData(
            name=name.strip(),
            current_count=count,
            color=color,
            status=status,
            last_updated=datetime.now()
        )
        
    except Exception as e:
        logging.error(f"Error creating zone data for {name}: {str(e)}")
        return None

def generate_all_zone_data() -> Dict[str, ZoneData]:
    """
    Generate complete zone data with crowd counts, colors, and status for all zones.
    Includes comprehensive error handling and fallback mechanisms.
    
    Returns:
        Dict[str, ZoneData]: Dictionary with zone names as keys and ZoneData objects as values
    """
    try:
        # Generate crowd data with built-in error handling
        crowd_data = generate_crowd_data()
        zone_data = {}
        
        # Expected zones for validation
        expected_zones = ["Gate", "Hall", "Exit"]
        
        for zone_name in expected_zones:
            try:
                # Get count from crowd data, use fallback if missing
                count = crowd_data.get(zone_name, 0)
                
                # Create zone data with error handling
                zone_obj = create_zone_data(zone_name, count)
                
                if zone_obj is not None:
                    zone_data[zone_name] = zone_obj
                else:
                    # Create fallback zone data if creation failed
                    logging.warning(f"Failed to create zone data for {zone_name}, using fallback")
                    fallback_count = get_fallback_crowd_data().get(zone_name, 0)
                    zone_data[zone_name] = ZoneData(
                        name=zone_name,
                        current_count=fallback_count,
                        color="#CCCCCC",
                        status="Unknown",
                        last_updated=datetime.now()
                    )
                    
            except Exception as e:
                logging.error(f"Error processing zone {zone_name}: {str(e)}")
                # Create minimal fallback zone data
                fallback_count = get_fallback_crowd_data().get(zone_name, 0)
                zone_data[zone_name] = ZoneData(
                    name=zone_name,
                    current_count=fallback_count,
                    color="#CCCCCC",
                    status="Error",
                    last_updated=datetime.now()
                )
        
        # Ensure we have data for all expected zones
        for zone_name in expected_zones:
            if zone_name not in zone_data:
                logging.error(f"Missing zone data for {zone_name}, creating emergency fallback")
                fallback_count = get_fallback_crowd_data().get(zone_name, 0)
                zone_data[zone_name] = ZoneData(
                    name=zone_name,
                    current_count=fallback_count,
                    color="#CCCCCC",
                    status="Fallback",
                    last_updated=datetime.now()
                )
        
        return zone_data
        
    except Exception as e:
        logging.error(f"Critical error in generate_all_zone_data: {str(e)}")
        
        # Emergency fallback - create minimal working data
        fallback_data = get_fallback_crowd_data()
        emergency_zone_data = {}
        
        for zone_name, count in fallback_data.items():
            emergency_zone_data[zone_name] = ZoneData(
                name=zone_name,
                current_count=count,
                color="#CCCCCC",
                status="Emergency",
                last_updated=datetime.now()
            )
        
        return emergency_zone_data