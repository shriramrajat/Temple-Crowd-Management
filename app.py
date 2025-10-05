"""
Temple Crowd Dashboard - Real-time crowd monitoring system
Built with Streamlit for temple administrators and visitors
"""

import streamlit as st
from datetime import datetime
import sys
import os
import time
import logging
from typing import Dict, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Add src directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

try:
    from data_simulation import generate_all_zone_data, ZoneData, get_fallback_crowd_data
except ImportError as e:
    logging.error(f"Failed to import data simulation module: {str(e)}")
    st.error("Critical error: Unable to load data simulation module")
    st.stop()


def initialize_session_state():
    """
    Initialize Streamlit session state variables with performance optimizations.
    """
    if 'last_refresh' not in st.session_state:
        st.session_state.last_refresh = datetime.now()
    if 'refresh_interval' not in st.session_state:
        st.session_state.refresh_interval = 5  # 5 seconds
    if 'zones_data' not in st.session_state:
        st.session_state.zones_data = {}
    if 'auto_refresh_enabled' not in st.session_state:
        st.session_state.auto_refresh_enabled = True
    if 'refresh_start_time' not in st.session_state:
        st.session_state.refresh_start_time = time.time()
    if 'performance_mode' not in st.session_state:
        # Enable performance mode for mobile devices (simplified animations)
        st.session_state.performance_mode = False
    if 'last_data_hash' not in st.session_state:
        # Track data changes to avoid unnecessary re-renders
        st.session_state.last_data_hash = None


def create_emergency_zone_data() -> Dict[str, ZoneData]:
    """
    Create emergency fallback zone data when all other methods fail.
    
    Returns:
        Dict[str, ZoneData]: Emergency zone data with safe defaults
    """
    try:
        fallback_data = get_fallback_crowd_data()
        emergency_zones = {}
        
        for zone_name, count in fallback_data.items():
            emergency_zones[zone_name] = ZoneData(
                name=zone_name,
                current_count=count,
                color="#CCCCCC",  # Gray for emergency mode
                status="Emergency",
                last_updated=datetime.now()
            )
        
        return emergency_zones
        
    except Exception as e:
        logging.error(f"Failed to create emergency zone data: {str(e)}")
        # Absolute last resort - hardcoded data
        return {
            "Gate": ZoneData("Gate", 100, "#CCCCCC", "Critical", datetime.now()),
            "Hall": ZoneData("Hall", 200, "#CCCCCC", "Critical", datetime.now()),
            "Exit": ZoneData("Exit", 50, "#CCCCCC", "Critical", datetime.now())
        }


def safe_generate_zone_data() -> Dict[str, ZoneData]:
    """
    Safely generate zone data with multiple fallback levels.
    
    Returns:
        Dict[str, ZoneData]: Zone data with error handling
    """
    try:
        # Primary method - normal data generation
        zones_data = generate_all_zone_data()
        
        # Validate that we got data for all expected zones
        expected_zones = ["Gate", "Hall", "Exit"]
        if all(zone in zones_data for zone in expected_zones):
            return zones_data
        else:
            logging.warning("Missing zones in generated data, using emergency fallback")
            return create_emergency_zone_data()
            
    except Exception as e:
        logging.error(f"Primary data generation failed: {str(e)}")
        return create_emergency_zone_data()


def handle_auto_refresh():
    """
    Handle automatic data refresh mechanism with 5-second intervals.
    Uses Streamlit's rerun functionality for timer-based updates.
    Includes comprehensive error handling and graceful degradation.
    """
    try:
        current_time = time.time()
        time_since_last_refresh = current_time - st.session_state.refresh_start_time
        
        # Check if it's time to refresh (5 seconds have passed)
        if (st.session_state.auto_refresh_enabled and 
            time_since_last_refresh >= st.session_state.refresh_interval):
            
            # Update refresh timing
            st.session_state.refresh_start_time = current_time
            st.session_state.last_refresh = datetime.now()
            
            # Generate new zone data with error handling
            try:
                new_zones_data = safe_generate_zone_data()
                st.session_state.zones_data = new_zones_data
                
                # Clear any previous error states
                if 'refresh_error_count' in st.session_state:
                    st.session_state.refresh_error_count = 0
                    
            except Exception as data_error:
                logging.error(f"Data generation failed during refresh: {str(data_error)}")
                
                # Track consecutive errors
                if 'refresh_error_count' not in st.session_state:
                    st.session_state.refresh_error_count = 0
                st.session_state.refresh_error_count += 1
                
                # If too many consecutive errors, disable auto-refresh
                if st.session_state.refresh_error_count >= 3:
                    st.session_state.auto_refresh_enabled = False
                    st.error("Auto-refresh disabled due to repeated errors. Use manual refresh button.")
                    return
                
                # Use existing data if available, otherwise create emergency data
                if not st.session_state.zones_data:
                    st.session_state.zones_data = create_emergency_zone_data()
                
                st.warning(f"Data refresh failed ({st.session_state.refresh_error_count}/3). Using previous data.")
                return
            
            # Trigger page rerun for automatic refresh
            try:
                st.rerun()
            except Exception as rerun_error:
                logging.error(f"Streamlit rerun failed: {str(rerun_error)}")
                st.error("Auto-refresh mechanism failed. Please use manual refresh.")
                st.session_state.auto_refresh_enabled = False
                
    except Exception as e:
        # Handle any unexpected errors in the refresh mechanism
        logging.error(f"Critical error in auto-refresh handler: {str(e)}")
        st.error(f"Auto-refresh system error: {str(e)}")
        
        # Disable auto-refresh to prevent infinite error loops
        st.session_state.auto_refresh_enabled = False
        
        # Ensure we have some data to display
        if not st.session_state.zones_data:
            st.session_state.zones_data = create_emergency_zone_data()


@st.cache_data(ttl=1)  # Cache for 1 second to reduce computation
def get_refresh_status():
    """
    Get current refresh status and timing information.
    Cached to improve performance and reduce unnecessary calculations.
    
    Returns:
        tuple: (seconds_until_next_refresh, is_refreshing)
    """
    try:
        current_time = time.time()
        refresh_start_time = st.session_state.get('refresh_start_time', current_time)
        refresh_interval = st.session_state.get('refresh_interval', 5)
        
        time_since_last_refresh = current_time - refresh_start_time
        seconds_until_next = max(0, refresh_interval - time_since_last_refresh)
        is_refreshing = seconds_until_next < 0.5  # Consider refreshing if less than 0.5 seconds left
        
        return seconds_until_next, is_refreshing
        
    except Exception as e:
        logging.warning(f"Error calculating refresh status: {str(e)}")
        return 5.0, False  # Safe defaults


def display_zone_card(zone_data: ZoneData):
    """
    Display individual zone information card with styling.
    Includes error handling for rendering failures.
    
    Args:
        zone_data: ZoneData object containing zone information
    """
    try:
        # Validate zone data
        if not zone_data or not hasattr(zone_data, 'name'):
            st.error("Invalid zone data")
            return
        
        # Create styled container for zone card
        with st.container():
            # Zone header with name
            zone_name = getattr(zone_data, 'name', 'Unknown Zone')
            st.markdown(f"### {zone_name}")
            
            # Zone metrics in a styled format
            col1, col2 = st.columns(2)
            
            with col1:
                try:
                    count = getattr(zone_data, 'current_count', 0)
                    st.metric(
                        label="Current Count",
                        value=f"{count} people"
                    )
                except Exception as metric_error:
                    logging.warning(f"Error displaying metric for {zone_name}: {str(metric_error)}")
                    st.text("Count: Data unavailable")
            
            with col2:
                try:
                    # Display status with color indicator
                    status_color = getattr(zone_data, 'color', '#CCCCCC')
                    status_text = getattr(zone_data, 'status', 'Unknown')
                    
                    # Validate color format
                    if not status_color.startswith('#'):
                        status_color = '#CCCCCC'
                    
                    st.markdown(
                        f"""
                        <div style="
                            background-color: {status_color}; 
                            padding: 10px; 
                            border-radius: 5px; 
                            text-align: center;
                            color: black;
                            font-weight: bold;
                        ">
                            Status: {status_text}
                        </div>
                        """, 
                        unsafe_allow_html=True
                    )
                except Exception as status_error:
                    logging.warning(f"Error displaying status for {zone_name}: {str(status_error)}")
                    st.text(f"Status: {getattr(zone_data, 'status', 'Error')}")
            
            # Last updated timestamp
            try:
                last_updated = getattr(zone_data, 'last_updated', datetime.now())
                if hasattr(last_updated, 'strftime'):
                    timestamp_str = last_updated.strftime('%H:%M:%S')
                else:
                    timestamp_str = str(last_updated)
                st.caption(f"Last updated: {timestamp_str}")
            except Exception as time_error:
                logging.warning(f"Error displaying timestamp for {zone_name}: {str(time_error)}")
                st.caption("Last updated: Unknown")
            
            # Add separator
            st.divider()
            
    except Exception as e:
        logging.error(f"Critical error displaying zone card: {str(e)}")
        st.error(f"Error displaying zone information: {str(e)}")
        
        # Fallback display
        try:
            zone_name = getattr(zone_data, 'name', 'Unknown Zone') if zone_data else 'Error Zone'
            st.markdown(f"### {zone_name}")
            st.text("Zone data temporarily unavailable")
            st.divider()
        except:
            st.error("Critical display error")


def render_crowd_density_legend():
    """
    Render the enhanced color-coded legend for crowd density levels.
    Optimized for responsive design across different screen sizes with professional styling.
    """
    st.markdown("#### 📊 Crowd Density Legend")
    st.markdown("*Use this guide to quickly assess crowd levels in each temple zone*")
    
    # Create responsive columns that stack on mobile
    col1, col2, col3 = st.columns([1, 1, 1])
    
    with col1:
        st.markdown(
            """
            <div style="
                background: linear-gradient(135deg, #90EE90, #98FB98); 
                padding: 15px; 
                border-radius: 12px; 
                text-align: center;
                border: 3px solid #228B22;
                color: black;
                font-weight: bold;
                font-size: clamp(12px, 2.5vw, 16px);
                min-height: 80px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                transition: transform 0.2s ease;
            ">
                🟢 LOW DENSITY<br>
                < 200 people<br>
                <small style="font-size: 10px; opacity: 0.8;">Comfortable capacity</small>
            </div>
            """, 
            unsafe_allow_html=True
        )
    
    with col2:
        st.markdown(
            """
            <div style="
                background: linear-gradient(135deg, #FFD700, #FFF8DC); 
                padding: 15px; 
                border-radius: 12px; 
                text-align: center;
                border: 3px solid #DAA520;
                color: black;
                font-weight: bold;
                font-size: clamp(12px, 2.5vw, 16px);
                min-height: 80px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                transition: transform 0.2s ease;
            ">
                🟡 MEDIUM DENSITY<br>
                200-400 people<br>
                <small style="font-size: 10px; opacity: 0.8;">Moderate capacity</small>
            </div>
            """, 
            unsafe_allow_html=True
        )
    
    with col3:
        st.markdown(
            """
            <div style="
                background: linear-gradient(135deg, #FF6B6B, #FFB6C1); 
                padding: 15px; 
                border-radius: 12px; 
                text-align: center;
                border: 3px solid #DC143C;
                color: black;
                font-weight: bold;
                font-size: clamp(12px, 2.5vw, 16px);
                min-height: 80px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                transition: transform 0.2s ease;
            ">
                🔴 HIGH DENSITY<br>
                > 400 people<br>
                <small style="font-size: 10px; opacity: 0.8;">Consider crowd management</small>
            </div>
            """, 
            unsafe_allow_html=True
        )


@st.cache_data(ttl=5)  # Cache border styles to improve performance
def get_zone_border_style(status: str) -> str:
    """
    Get enhanced border styling based on crowd density level.
    Cached to improve rendering performance.
    
    Args:
        status: Zone status string ("High", "Medium", "Low", etc.)
        
    Returns:
        str: CSS border style string
    """
    try:
        if status == "High":
            return "4px solid #DC143C"  # Thick red border for high density
        elif status == "Medium":
            return "3px solid #DAA520"  # Medium gold border
        else:
            return "2px solid #228B22"  # Thin green border for low density
    except Exception as e:
        logging.warning(f"Error getting border style: {str(e)}")
        return "2px solid #CCCCCC"  # Default gray border


@st.cache_data(ttl=5)  # Cache animation styles to improve performance
def get_zone_animation_style(status: str) -> str:
    """
    Get CSS animation style for high-density zones.
    Cached to improve rendering performance.
    
    Args:
        status: Zone status string ("High", "Medium", "Low", etc.)
        
    Returns:
        str: CSS animation style string
    """
    try:
        if status == "High":
            return """
            animation: pulse 2s infinite;
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(220, 20, 60, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(220, 20, 60, 0); }
                100% { box-shadow: 0 0 0 0 rgba(220, 20, 60, 0); }
            }
            """
        return ""
    except Exception as e:
        logging.warning(f"Error getting animation style: {str(e)}")
        return ""  # No animation on error


def render_temple_map_visualization(zones_data: Dict[str, ZoneData]):
    """
    Render the temple map with enhanced color-coded heatmap visualization.
    Includes comprehensive error handling for visualization failures.
    
    Args:
        zones_data: Dictionary containing zone data for all temple zones
    """
    try:
        st.markdown("### 🏛️ Temple Heatmap")
        
        # Validate input data
        if not zones_data or not isinstance(zones_data, dict):
            st.error("Invalid zone data for temple map")
            return
        
        # Display crowd density legend with error handling
        try:
            render_crowd_density_legend()
        except Exception as legend_error:
            logging.warning(f"Failed to render legend: {str(legend_error)}")
            st.markdown("**Legend:** Green = Low, Yellow = Medium, Red = High")
        
        st.markdown("---")
        
        # Create temple map container with styling
        with st.container():
            # Temple entrance (Gate zone) - Top row
            try:
                st.markdown("#### Entrance")
                # Responsive layout - single column on mobile, centered on desktop
                gate_col = st.columns([0.5, 3, 0.5])[1]  # More responsive centering
                with gate_col:
                    gate_data = zones_data.get("Gate")
                    if gate_data and hasattr(gate_data, 'name'):
                        try:
                            # Validate data attributes first
                            color = getattr(gate_data, 'color', '#CCCCCC')
                            count = getattr(gate_data, 'current_count', 0)
                            status = getattr(gate_data, 'status', 'Unknown')
                            
                            border_style = get_zone_border_style(status)
                            animation_style = get_zone_animation_style(status)
                            
                            # Ensure color is valid
                            if not color.startswith('#'):
                                color = '#CCCCCC'
                            
                            st.markdown(
                                f"""
                                <style>
                                .gate-zone {{
                                    {animation_style}
                                }}
                                @media (max-width: 768px) {{
                                    .gate-zone {{
                                        padding: 15px !important;
                                        font-size: 14px !important;
                                        margin: 5px 0 !important;
                                    }}
                                    .gate-zone span {{
                                        font-size: 18px !important;
                                    }}
                                    .gate-zone small {{
                                        font-size: 10px !important;
                                    }}
                                }}
                                </style>
                                <div class="gate-zone" style="
                                    background: linear-gradient(135deg, {color}, {color}dd); 
                                    padding: 20px; 
                                    border-radius: 10px; 
                                    text-align: center;
                                    border: {border_style};
                                    margin: 10px 0;
                                    color: black;
                                    font-weight: bold;
                                    font-size: clamp(14px, 3vw, 16px);
                                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                                    transition: all 0.3s ease;
                                    min-height: 80px;
                                    display: flex;
                                    flex-direction: column;
                                    justify-content: center;
                                ">
                                    🚪 GATE<br>
                                    <span style="font-size: clamp(18px, 4vw, 20px);">{count}</span> people<br>
                                    <small style="font-size: clamp(10px, 2vw, 12px); background-color: rgba(255,255,255,0.3); padding: 2px 6px; border-radius: 3px;">
                                        {status.upper()} DENSITY
                                    </small>
                                </div>
                                """, 
                                unsafe_allow_html=True
                            )
                        except Exception as gate_render_error:
                            logging.error(f"Error rendering gate visualization: {str(gate_render_error)}")
                            st.error("Gate visualization error")
                    else:
                        st.warning("Gate data unavailable")
            except Exception as gate_error:
                logging.error(f"Error in gate section: {str(gate_error)}")
                st.error("Error displaying gate area")
        
        # Add visual separator with flow indicators
        st.markdown(
            """
            <div style="text-align: center; margin: 15px 0;">
                <div style="font-size: 24px;">⬇️</div>
                <div style="font-size: 12px; color: #666;">Flow Direction</div>
            </div>
            """, 
            unsafe_allow_html=True
        )
        
        # Add visual separator with flow indicators
        st.markdown(
            """
            <div style="text-align: center; margin: 15px 0;">
                <div style="font-size: 24px;">⬇️</div>
                <div style="font-size: 12px; color: #666;">Flow Direction</div>
            </div>
            """, 
            unsafe_allow_html=True
        )
        
        # Temple main hall (Hall zone) - Middle row
        try:
            st.markdown("#### Main Temple Area")
            hall_col = st.columns([0.2, 3.6, 0.2])[1]  # Optimized for mobile and desktop
            with hall_col:
                hall_data = zones_data.get("Hall")
                if hall_data and hasattr(hall_data, 'name'):
                    try:
                        # Validate data attributes first
                        color = getattr(hall_data, 'color', '#CCCCCC')
                        count = getattr(hall_data, 'current_count', 0)
                        status = getattr(hall_data, 'status', 'Unknown')
                        
                        border_style = get_zone_border_style(status)
                        animation_style = get_zone_animation_style(status)
                        
                        # Ensure color is valid
                        if not color.startswith('#'):
                            color = '#CCCCCC'
                        
                        st.markdown(
                                f"""
                                <style>
                                .hall-zone {{
                                    {animation_style}
                                }}
                                @media (max-width: 768px) {{
                                    .hall-zone {{
                                        padding: 20px !important;
                                        font-size: 16px !important;
                                        min-height: 100px !important;
                                        margin: 5px 0 !important;
                                    }}
                                    .hall-zone span {{
                                        font-size: 20px !important;
                                    }}
                                    .hall-zone small {{
                                        font-size: 12px !important;
                                    }}
                                }}
                                </style>
                                <div class="hall-zone" style="
                                    background: linear-gradient(135deg, {color}, {color}dd); 
                                    padding: 30px; 
                                    border-radius: 15px; 
                                    text-align: center;
                                    border: {border_style};
                                    margin: 10px 0;
                                    color: black;
                                    font-weight: bold;
                                    font-size: clamp(16px, 3.5vw, 18px);
                                    min-height: clamp(100px, 15vw, 120px);
                                    display: flex;
                                    flex-direction: column;
                                    justify-content: center;
                                    box-shadow: 0 6px 12px rgba(0,0,0,0.3);
                                    transition: all 0.3s ease;
                                ">
                                    🏛️ MAIN HALL<br>
                                    <span style="font-size: clamp(20px, 5vw, 24px);">{count}</span> people<br>
                                    <small style="font-size: clamp(12px, 2.5vw, 14px); background-color: rgba(255,255,255,0.3); padding: 4px 8px; border-radius: 4px;">
                                        {status.upper()} DENSITY
                                    </small>
                                </div>
                                """, 
                                unsafe_allow_html=True
                            )
                    except Exception as hall_render_error:
                        logging.error(f"Error rendering hall visualization: {str(hall_render_error)}")
                        st.error("Hall visualization error")
                else:
                    st.warning("Hall data unavailable")
        except Exception as hall_error:
            logging.error(f"Error in hall section: {str(hall_error)}")
            st.error("Error displaying hall area")
        
        # Add visual separator with flow indicators
        st.markdown(
            """
            <div style="text-align: center; margin: 15px 0;">
                <div style="font-size: 24px;">⬇️</div>
                <div style="font-size: 12px; color: #666;">Flow Direction</div>
            </div>
            """, 
            unsafe_allow_html=True
        )
        
        # Temple exit (Exit zone) - Bottom row
        try:
            st.markdown("#### Exit")
            exit_col = st.columns([0.5, 3, 0.5])[1]  # Consistent with gate layout
            with exit_col:
                exit_data = zones_data.get("Exit")
                if exit_data and hasattr(exit_data, 'name'):
                    try:
                        # Validate data attributes first
                        color = getattr(exit_data, 'color', '#CCCCCC')
                        count = getattr(exit_data, 'current_count', 0)
                        status = getattr(exit_data, 'status', 'Unknown')
                        
                        border_style = get_zone_border_style(status)
                        animation_style = get_zone_animation_style(status)
                        
                        # Ensure color is valid
                        if not color.startswith('#'):
                            color = '#CCCCCC'
                        
                        st.markdown(
                                f"""
                                <style>
                                .exit-zone {{
                                    {animation_style}
                                }}
                                @media (max-width: 768px) {{
                                    .exit-zone {{
                                        padding: 15px !important;
                                        font-size: 14px !important;
                                        margin: 5px 0 !important;
                                    }}
                                    .exit-zone span {{
                                        font-size: 18px !important;
                                    }}
                                    .exit-zone small {{
                                        font-size: 10px !important;
                                    }}
                                }}
                                </style>
                                <div class="exit-zone" style="
                                    background: linear-gradient(135deg, {color}, {color}dd); 
                                    padding: 20px; 
                                    border-radius: 10px; 
                                    text-align: center;
                                    border: {border_style};
                                    margin: 10px 0;
                                    color: black;
                                    font-weight: bold;
                                    font-size: clamp(14px, 3vw, 16px);
                                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                                    transition: all 0.3s ease;
                                    min-height: 80px;
                                    display: flex;
                                    flex-direction: column;
                                    justify-content: center;
                                ">
                                    🚪 EXIT<br>
                                    <span style="font-size: clamp(18px, 4vw, 20px);">{count}</span> people<br>
                                    <small style="font-size: clamp(10px, 2vw, 12px); background-color: rgba(255,255,255,0.3); padding: 2px 6px; border-radius: 3px;">
                                        {status.upper()} DENSITY
                                    </small>
                                </div>
                                """, 
                                unsafe_allow_html=True
                            )
                    except Exception as exit_render_error:
                        logging.error(f"Error rendering exit visualization: {str(exit_render_error)}")
                        st.error("Exit visualization error")
                else:
                    st.warning("Exit data unavailable")
        except Exception as exit_error:
            logging.error(f"Error in exit section: {str(exit_error)}")
            st.error("Error displaying exit area")
                
    except Exception as e:
        logging.error(f"Critical error in temple map visualization: {str(e)}")
        st.error("Unable to display temple map. Please refresh the page.")
        
        # Fallback display
        try:
            st.markdown("### 🏛️ Temple Status (Text Mode)")
            for zone_name in ["Gate", "Hall", "Exit"]:
                if zone_name in zones_data:
                    zone_data = zones_data[zone_name]
                    count = getattr(zone_data, 'current_count', 'Unknown')
                    status = getattr(zone_data, 'status', 'Unknown')
                    st.text(f"{zone_name}: {count} people ({status})")
                else:
                    st.text(f"{zone_name}: Data unavailable")
        except Exception as fallback_error:
            logging.error(f"Fallback display failed: {str(fallback_error)}")
            st.text("Temple data temporarily unavailable")


def render_zone_information_display():
    """
    Render the zone information display using Streamlit columns.
    Includes comprehensive error handling and fallback mechanisms.
    """
    try:
        # Use existing zone data from session state, generate if not available
        if not st.session_state.zones_data:
            try:
                st.session_state.zones_data = safe_generate_zone_data()
                st.session_state.last_refresh = datetime.now()
            except Exception as data_error:
                logging.error(f"Failed to generate initial zone data: {str(data_error)}")
                st.error("Unable to load zone data. Please try refreshing the page.")
                return
        
        zones_data = st.session_state.zones_data
        
        # Validate zones_data structure
        if not isinstance(zones_data, dict):
            logging.error(f"Invalid zones_data type: {type(zones_data)}")
            st.error("Invalid zone data format. Please refresh the page.")
            return
        
        # Create responsive columns - stack on mobile, side-by-side on desktop
        try:
            # Use responsive column ratios
            col1, col2, col3 = st.columns([1, 1, 1])
            columns = [col1, col2, col3]
        except Exception as layout_error:
            logging.error(f"Failed to create column layout: {str(layout_error)}")
            # Fallback to single column layout for mobile compatibility
            columns = [st.container(), st.container(), st.container()]
        
        # Display each zone in its respective column
        zones = ["Gate", "Hall", "Exit"]
        
        for zone_name, column in zip(zones, columns):
            try:
                with column:
                    if zone_name in zones_data and zones_data[zone_name] is not None:
                        display_zone_card(zones_data[zone_name])
                    else:
                        # Create fallback zone display
                        logging.warning(f"Missing or invalid data for zone {zone_name}")
                        st.markdown(f"### {zone_name}")
                        st.warning(f"Data temporarily unavailable for {zone_name}")
                        
                        # Try to create emergency zone data for this zone
                        try:
                            emergency_data = create_emergency_zone_data()
                            if zone_name in emergency_data:
                                display_zone_card(emergency_data[zone_name])
                        except Exception as emergency_error:
                            logging.error(f"Failed to create emergency data for {zone_name}: {str(emergency_error)}")
                            st.text("Please try refreshing the page")
                        
                        st.divider()
                        
            except Exception as zone_error:
                logging.error(f"Error rendering zone {zone_name}: {str(zone_error)}")
                try:
                    with column:
                        st.markdown(f"### {zone_name}")
                        st.error(f"Error displaying {zone_name} data")
                        st.divider()
                except:
                    pass  # If even the error display fails, continue to next zone
                    
    except Exception as e:
        logging.error(f"Critical error in render_zone_information_display: {str(e)}")
        st.error("Critical error displaying zone information. Please refresh the page.")
        
        # Try to display a basic fallback
        try:
            st.markdown("### Emergency Mode")
            st.warning("Zone information is temporarily unavailable.")
            if st.button("🔄 Try to Reload Data"):
                st.session_state.zones_data = safe_generate_zone_data()
                st.rerun()
        except:
            st.text("Please refresh the page to restore functionality.")


def render_refresh_status_indicator():
    """
    Render refresh status indicator with timestamp and visual feedback.
    Shows current refresh status, next refresh countdown, and loading indicators.
    """
    seconds_until_next, is_refreshing = get_refresh_status()
    
    # Create responsive status indicator container
    with st.container():
        # Responsive layout - stack on mobile, side-by-side on desktop
        col1, col2, col3, col4 = st.columns([2, 2, 2, 1])
        
        with col1:
            # Last update timestamp
            last_update_str = st.session_state.last_refresh.strftime('%H:%M:%S')
            st.markdown(f"**🕒 Last Updated:** {last_update_str}")
        
        with col2:
            # Next refresh countdown
            if st.session_state.auto_refresh_enabled:
                if is_refreshing:
                    st.markdown("**🔄 Status:** Refreshing...")
                else:
                    st.markdown(f"**⏱️ Next Refresh:** {int(seconds_until_next)}s")
            else:
                st.markdown("**⏸️ Status:** Auto-refresh disabled")
        
        with col3:
            # Auto-refresh toggle
            auto_refresh_enabled = st.checkbox(
                "Auto-refresh enabled", 
                value=st.session_state.auto_refresh_enabled,
                help="Toggle automatic data refresh every 5 seconds"
            )
            if auto_refresh_enabled != st.session_state.auto_refresh_enabled:
                st.session_state.auto_refresh_enabled = auto_refresh_enabled
                if auto_refresh_enabled:
                    st.session_state.refresh_start_time = time.time()
        
        with col4:
            # Manual refresh button
            if st.button("🔄 Refresh", help="Manually refresh data now"):
                try:
                    st.session_state.zones_data = safe_generate_zone_data()
                    st.session_state.last_refresh = datetime.now()
                    st.session_state.refresh_start_time = time.time()
                    
                    # Clear error counts on successful manual refresh
                    if 'refresh_error_count' in st.session_state:
                        st.session_state.refresh_error_count = 0
                    
                    st.rerun()
                except Exception as manual_refresh_error:
                    logging.error(f"Manual refresh failed: {str(manual_refresh_error)}")
                    st.error("Manual refresh failed. Please try again.")
    
    # Visual loading indicator during refresh
    if is_refreshing and st.session_state.auto_refresh_enabled:
        st.markdown(
            """
            <div style="
                background: linear-gradient(90deg, #4CAF50, #45a049, #4CAF50);
                background-size: 200% 100%;
                animation: loading 1.5s ease-in-out infinite;
                height: 4px;
                border-radius: 2px;
                margin: 10px 0;
            ">
            </div>
            <style>
            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            </style>
            """,
            unsafe_allow_html=True
        )


def inject_responsive_css():
    """
    Inject enhanced responsive CSS for professional appearance and better user experience.
    Optimizes performance by reducing layout shifts and improving rendering across all devices.
    """
    st.markdown(
        """
        <style>
        /* Global responsive optimizations and professional styling */
        .main .block-container {
            padding-top: 1rem;
            padding-bottom: 1rem;
            max-width: 100%;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        
        /* Enhanced header styling */
        h1 {
            color: #2c3e50;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        
        h3 {
            color: #34495e;
            margin-top: 1.5rem;
        }
        
        /* Professional card styling */
        .stContainer > div {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 10px;
            padding: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin: 0.5rem 0;
        }
        
        /* Enhanced button styling */
        .stButton > button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .stButton > button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        
        /* Enhanced checkbox styling */
        .stCheckbox > label {
            font-weight: 500;
            color: #2c3e50;
        }
        
        /* Professional metric styling */
        .metric-container {
            background: rgba(255, 255, 255, 0.8);
            border-radius: 8px;
            padding: 1rem;
            border-left: 4px solid #3498db;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
            .main .block-container {
                padding-left: 0.5rem;
                padding-right: 0.5rem;
            }
            
            /* Optimize column spacing on mobile */
            .row-widget.stColumns > div {
                padding: 0 0.25rem;
                margin-bottom: 1rem;
            }
            
            /* Improve text readability on mobile */
            h1, h2, h3, h4 {
                font-size: clamp(1rem, 4vw, 2rem) !important;
                text-align: center;
            }
            
            /* Stack elements vertically on mobile */
            .stColumns {
                flex-direction: column;
            }
            
            /* Optimize button size for mobile */
            .stButton > button {
                width: 100%;
                margin: 0.25rem 0;
            }
        }
        
        /* Tablet optimizations */
        @media (min-width: 769px) and (max-width: 1024px) {
            .main .block-container {
                padding-left: 1.5rem;
                padding-right: 1.5rem;
            }
            
            h1 {
                text-align: center;
            }
        }
        
        /* Desktop enhancements */
        @media (min-width: 1025px) {
            .main .block-container {
                padding-left: 2rem;
                padding-right: 2rem;
            }
            
            /* Add hover effects for desktop */
            .stContainer:hover {
                transform: translateY(-2px);
                transition: transform 0.3s ease;
            }
        }
        
        /* Performance optimizations */
        * {
            box-sizing: border-box;
        }
        
        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }
        
        /* Reduce animation on low-performance devices */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
        
        /* Loading animation enhancement */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .main {
            animation: fadeIn 0.5s ease-in;
        }
        
        /* Professional divider styling */
        hr {
            border: none;
            height: 2px;
            background: linear-gradient(90deg, transparent, #3498db, transparent);
            margin: 2rem 0;
        }
        </style>
        """,
        unsafe_allow_html=True
    )


def main():
    """
    Main application entry point with comprehensive error handling and performance optimizations.
    """
    try:
        # Set page configuration with performance optimizations
        st.set_page_config(
            page_title="Temple Crowd Dashboard",
            page_icon="🏛️",
            layout="wide",
            initial_sidebar_state="collapsed"
        )
        
        # Inject responsive CSS for better mobile experience
        inject_responsive_css()
        
        # Initialize session state
        try:
            initialize_session_state()
        except Exception as init_error:
            logging.error(f"Session state initialization failed: {str(init_error)}")
            st.error("Application initialization failed. Please refresh the page.")
            return
        
        # Handle auto-refresh mechanism
        try:
            handle_auto_refresh()
        except Exception as refresh_error:
            logging.error(f"Auto-refresh handler failed: {str(refresh_error)}")
            # Continue without auto-refresh
            st.session_state.auto_refresh_enabled = False
        
        # Ensure we have zone data
        if not st.session_state.zones_data:
            try:
                st.session_state.zones_data = safe_generate_zone_data()
                st.session_state.last_refresh = datetime.now()
            except Exception as data_error:
                logging.error(f"Failed to generate initial zone data: {str(data_error)}")
                st.error("Unable to load dashboard data. Please refresh the page.")
                return
        
        # Main dashboard container
        with st.container():
            # Enhanced dashboard header with instructions
            st.title("🏛️ Temple Crowd Dashboard")
            st.markdown("**Real-time crowd monitoring system for temple administrators and visitors**")
            
            # Add helpful instructions
            with st.expander("ℹ️ How to Use This Dashboard", expanded=False):
                st.markdown("""
                **Welcome to the Temple Crowd Dashboard!**
                
                This dashboard provides real-time crowd density information for different temple zones:
                
                🚪 **Gate Zone** - Entry and exit area  
                🏛️ **Main Hall** - Primary worship area  
                🚪 **Exit Zone** - Departure area
                
                **Color Coding:**
                - 🟢 **Green (Low)**: Less than 200 people - Comfortable capacity
                - 🟡 **Yellow (Medium)**: 200-400 people - Moderate capacity  
                - 🔴 **Red (High)**: More than 400 people - High capacity, consider crowd management
                
                **Features:**
                - Auto-refresh every 5 seconds (can be toggled)
                - Manual refresh button available
                - Responsive design for mobile and desktop
                - Visual heatmap with temple layout
                """)
            
            # Show system status if there are issues
            if hasattr(st.session_state, 'refresh_error_count') and st.session_state.refresh_error_count > 0:
                st.warning(f"⚠️ System experiencing issues ({st.session_state.refresh_error_count} errors)")
            
            st.markdown("---")
            
            # Refresh status indicator
            try:
                render_refresh_status_indicator()
            except Exception as status_error:
                logging.error(f"Refresh status indicator failed: {str(status_error)}")
                st.warning("Status indicator unavailable")
            
            st.markdown("---")
            
            # Dashboard navigation and status information
            st.markdown("### 📍 Live Temple Zone Monitoring")
            
            # Add quick navigation/summary
            summary_col1, summary_col2, summary_col3, summary_col4 = st.columns([1, 1, 1, 1])
            
            try:
                zones_data = st.session_state.zones_data
                total_people = sum(getattr(zone, 'current_count', 0) for zone in zones_data.values())
                high_density_zones = sum(1 for zone in zones_data.values() if getattr(zone, 'status', '') == 'High')
                
                with summary_col1:
                    st.metric("Total Visitors", f"{total_people:,}", help="Total people across all temple zones")
                
                with summary_col2:
                    st.metric("Active Zones", "3", help="Number of monitored temple zones")
                
                with summary_col3:
                    alert_color = "🔴" if high_density_zones > 0 else "🟢"
                    st.metric("High Density Zones", f"{alert_color} {high_density_zones}", help="Zones requiring attention")
                
                with summary_col4:
                    avg_density = total_people // 3 if total_people > 0 else 0
                    density_status = "High" if avg_density > 400 else "Medium" if avg_density > 200 else "Low"
                    st.metric("Avg. Density", f"{density_status}", help="Average crowd density level")
                    
            except Exception as summary_error:
                logging.error(f"Summary metrics failed: {str(summary_error)}")
                st.warning("Summary metrics temporarily unavailable")
            
            # Temple map visualization
            try:
                render_temple_map_visualization(st.session_state.zones_data)
            except Exception as map_error:
                logging.error(f"Temple map visualization failed: {str(map_error)}")
                st.error("Temple map temporarily unavailable")
            
            st.markdown("---")
            
            # Zone information display
            try:
                render_zone_information_display()
            except Exception as display_error:
                logging.error(f"Zone information display failed: {str(display_error)}")
                st.error("Zone information temporarily unavailable")
            
            # Enhanced footer information
            st.markdown("---")
            
            # Professional footer with system information
            footer_col1, footer_col2, footer_col3 = st.columns([1, 1, 1])
            
            with footer_col1:
                try:
                    refresh_status = "✅ Enabled" if st.session_state.auto_refresh_enabled else "⏸️ Disabled"
                    st.markdown(f"**Auto-refresh:** {refresh_status}")
                    st.markdown(f"**Refresh Interval:** {st.session_state.refresh_interval} seconds")
                except Exception as footer_error:
                    logging.error(f"Footer display failed: {str(footer_error)}")
                    st.markdown("**Status:** Information unavailable")
            
            with footer_col2:
                st.markdown("**System Info:**")
                st.markdown("🏛️ Temple Zones: 3 (Gate, Hall, Exit)")
                st.markdown("📊 Data Source: Real-time simulation")
            
            with footer_col3:
                st.markdown("**Support:**")
                st.markdown("📧 Contact: temple-admin@example.com")
                st.markdown("🔧 Version: 1.0.0")
            
            # Add professional disclaimer
            st.markdown("---")
            st.markdown(
                """
                <div style="
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #007bff;
                    margin: 10px 0;
                    font-size: 12px;
                    color: #6c757d;
                ">
                    <strong>📋 Disclaimer:</strong> This dashboard displays simulated crowd data for demonstration purposes. 
                    In a production environment, this would connect to real sensor data or counting systems. 
                    The crowd density thresholds can be customized based on temple capacity and safety requirements.
                </div>
                """,
                unsafe_allow_html=True
            )
                
    except Exception as e:
        logging.error(f"Critical error in main application: {str(e)}")
        st.error("Critical application error. Please refresh the page.")
        
        # Emergency fallback display
        try:
            st.title("🏛️ Temple Crowd Dashboard - Emergency Mode")
            st.error("The dashboard is experiencing technical difficulties.")
            st.markdown("Please try the following:")
            st.markdown("1. Refresh the page")
            st.markdown("2. Check your internet connection")
            st.markdown("3. Contact technical support if the issue persists")
            
            if st.button("🔄 Emergency Restart"):
                # Clear all session state and restart
                for key in list(st.session_state.keys()):
                    del st.session_state[key]
                st.rerun()
                
        except Exception as emergency_error:
            logging.error(f"Emergency fallback failed: {str(emergency_error)}")
            st.text("Critical system error - please refresh the page")


if __name__ == "__main__":
    main()