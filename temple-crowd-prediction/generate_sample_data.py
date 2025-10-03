#!/usr/bin/env python3
"""
Sample data generator for temple crowd prediction system.
Creates realistic CSV data with seasonal patterns, weather conditions, festivals, and data quality issues.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import math

def generate_sample_data(start_date='2022-01-01', end_date='2024-12-31', output_file='data/sample_temple_data.csv'):
    """
    Generate realistic temple visitor data with seasonal patterns and external factors.
    
    Args:
        start_date (str): Start date in YYYY-MM-DD format
        end_date (str): End date in YYYY-MM-DD format
        output_file (str): Output CSV file path
    """
    
    # Create date range
    start = datetime.strptime(start_date, '%Y-%m-%d')
    end = datetime.strptime(end_date, '%Y-%m-%d')
    
    # Generate hourly data
    data = []
    current_date = start
    
    # Define festival dates (major Hindu festivals)
    festival_dates = [
        # 2022 festivals
        '2022-03-01', '2022-03-18', '2022-04-14', '2022-05-03', '2022-08-11', 
        '2022-08-30', '2022-09-10', '2022-10-05', '2022-10-24', '2022-11-08',
        # 2023 festivals  
        '2023-02-18', '2023-03-07', '2023-04-04', '2023-04-22', '2023-08-30',
        '2023-09-19', '2023-09-28', '2023-10-15', '2023-10-24', '2023-11-12',
        # 2024 festivals
        '2024-03-08', '2024-03-25', '2024-04-13', '2024-05-10', '2024-08-19',
        '2024-09-07', '2024-09-16', '2024-10-02', '2024-10-31', '2024-11-01'
    ]
    
    festival_set = set(festival_dates)
    weather_conditions = ['sunny', 'cloudy', 'rainy', 'partly_cloudy', 'overcast']
    weather_weights = [0.4, 0.25, 0.15, 0.15, 0.05]  # Sunny weather more common
    
    print(f"Generating data from {start_date} to {end_date}...")
    
    while current_date <= end:
        date_str = current_date.strftime('%Y-%m-%d')
        is_festival = date_str in festival_set
        
        # Generate data for each hour of the day
        for hour in range(24):
            # Base visitor pattern with realistic temple visiting hours
            base_visitors = get_base_visitors_for_hour(hour)
            
            # Apply seasonal patterns
            seasonal_multiplier = get_seasonal_multiplier(current_date)
            
            # Apply day of week pattern (weekends busier)
            day_multiplier = get_day_multiplier(current_date.weekday())
            
            # Apply festival effect
            festival_multiplier = 2.5 if is_festival else 1.0
            
            # Calculate base visitor count
            visitors = int(base_visitors * seasonal_multiplier * day_multiplier * festival_multiplier)
            
            # Add random variation
            visitors = max(0, int(visitors + np.random.normal(0, visitors * 0.2)))
            
            # Weather effect
            weather = np.random.choice(weather_conditions, p=weather_weights)
            weather_multiplier = get_weather_multiplier(weather)
            visitors = max(0, int(visitors * weather_multiplier))
            
            data.append({
                'date': date_str,
                'hour': hour,
                'visitors': visitors,
                'festival_flag': is_festival,
                'weather': weather
            })
        
        current_date += timedelta(days=1)
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Add some data quality issues for testing
    df = add_data_quality_issues(df)
    
    # Save to CSV
    df.to_csv(output_file, index=False)
    print(f"Sample data saved to {output_file}")
    print(f"Generated {len(df)} records from {start_date} to {end_date}")
    print(f"Data shape: {df.shape}")
    print(f"Festival days: {df['festival_flag'].sum() // 24}")
    print(f"Weather distribution:\n{df['weather'].value_counts()}")
    
    return df

def get_base_visitors_for_hour(hour):
    """Get base visitor count for a given hour with realistic temple visiting patterns."""
    # Temple visiting patterns: early morning peak, evening peak, low at night
    if 5 <= hour <= 8:  # Early morning prayers
        return 80 + (hour - 5) * 20
    elif 9 <= hour <= 11:  # Morning visitors
        return 120 - (hour - 9) * 10
    elif 12 <= hour <= 16:  # Afternoon lull
        return 60 + (hour - 12) * 5
    elif 17 <= hour <= 20:  # Evening peak
        return 100 + (hour - 17) * 15
    elif 21 <= hour <= 22:  # Late evening
        return 130 - (hour - 21) * 30
    else:  # Night hours
        return 20

def get_seasonal_multiplier(date):
    """Apply seasonal patterns - higher during festival seasons."""
    month = date.month
    
    # Festival seasons (higher activity)
    if month in [3, 4, 10, 11]:  # Spring and autumn festival seasons
        return 1.4
    elif month in [8, 9]:  # Monsoon festival season
        return 1.2
    elif month in [12, 1]:  # Winter season
        return 1.1
    else:  # Regular months
        return 1.0

def get_day_multiplier(weekday):
    """Apply day of week patterns - weekends and Mondays busier."""
    if weekday == 0:  # Monday (auspicious day)
        return 1.3
    elif weekday in [5, 6]:  # Weekend
        return 1.4
    else:  # Weekdays
        return 1.0

def get_weather_multiplier(weather):
    """Apply weather effects on visitor counts."""
    weather_effects = {
        'sunny': 1.1,
        'partly_cloudy': 1.0,
        'cloudy': 0.95,
        'overcast': 0.9,
        'rainy': 0.7
    }
    return weather_effects.get(weather, 1.0)

def add_data_quality_issues(df):
    """Add realistic data quality issues for testing data handling."""
    df_copy = df.copy()
    
    # Add missing values (2% of data)
    missing_indices = np.random.choice(df_copy.index, size=int(len(df_copy) * 0.02), replace=False)
    
    for idx in missing_indices:
        # Randomly choose which column to make missing
        col_to_miss = np.random.choice(['visitors', 'weather', 'festival_flag'])
        if col_to_miss == 'visitors':
            df_copy.loc[idx, 'visitors'] = np.nan
        elif col_to_miss == 'weather':
            df_copy.loc[idx, 'weather'] = np.nan
        else:
            df_copy.loc[idx, 'festival_flag'] = np.nan
    
    # Add some outliers (0.5% of data)
    outlier_indices = np.random.choice(df_copy.index, size=int(len(df_copy) * 0.005), replace=False)
    
    for idx in outlier_indices:
        # Create unrealistic visitor counts
        if np.random.random() > 0.5:
            # Extremely high count
            df_copy.loc[idx, 'visitors'] = df_copy.loc[idx, 'visitors'] * np.random.uniform(5, 10)
        else:
            # Negative count (data entry error)
            df_copy.loc[idx, 'visitors'] = -np.random.randint(1, 50)
    
    # Add some invalid weather entries
    invalid_weather_indices = np.random.choice(df_copy.index, size=int(len(df_copy) * 0.001), replace=False)
    for idx in invalid_weather_indices:
        df_copy.loc[idx, 'weather'] = 'unknown'
    
    print(f"Added data quality issues:")
    print(f"- Missing values: {df_copy.isnull().sum().sum()}")
    print(f"- Negative visitor counts: {(df_copy['visitors'] < 0).sum()}")
    print(f"- Unknown weather entries: {(df_copy['weather'] == 'unknown').sum()}")
    
    return df_copy

if __name__ == "__main__":
    # Generate sample data for 3 years
    generate_sample_data()
    
    # Also generate a smaller dataset for quick testing
    generate_sample_data(
        start_date='2024-01-01', 
        end_date='2024-03-31', 
        output_file='data/sample_temple_data_small.csv'
    )