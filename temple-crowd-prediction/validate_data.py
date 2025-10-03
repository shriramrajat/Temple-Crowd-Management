#!/usr/bin/env python3
"""
Data validation script for Temple Crowd Prediction System.
Helps users validate their CSV data format before running predictions.
"""

import pandas as pd
import sys
from datetime import datetime
import argparse

def validate_csv_format(file_path):
    """
    Validate CSV file format for temple crowd prediction system.
    
    Args:
        file_path (str): Path to CSV file to validate
        
    Returns:
        bool: True if validation passes, False otherwise
    """
    print(f"Validating data file: {file_path}")
    print("=" * 50)
    
    try:
        # Load CSV
        df = pd.read_csv(file_path)
        print(f"✅ File loaded successfully: {len(df)} rows, {len(df.columns)} columns")
        
    except FileNotFoundError:
        print(f"❌ Error: File '{file_path}' not found")
        return False
    except Exception as e:
        print(f"❌ Error loading file: {e}")
        return False
    
    # Check required columns
    required_columns = ['date', 'hour', 'visitors', 'festival_flag', 'weather']
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        print(f"❌ Missing required columns: {missing_columns}")
        print(f"   Available columns: {list(df.columns)}")
        return False
    else:
        print(f"✅ All required columns present: {required_columns}")
    
    # Validate data types and ranges
    validation_passed = True
    
    # Validate dates
    try:
        pd.to_datetime(df['date'])
        print("✅ Date column format is valid")
    except Exception as e:
        print(f"❌ Date column validation failed: {e}")
        print("   Expected format: YYYY-MM-DD (e.g., 2024-01-15)")
        validation_passed = False
    
    # Validate hours
    if df['hour'].dtype not in ['int64', 'int32']:
        print(f"❌ Hour column should be integer, found: {df['hour'].dtype}")
        validation_passed = False
    elif not df['hour'].between(0, 23).all():
        invalid_hours = df[~df['hour'].between(0, 23)]['hour'].unique()
        print(f"❌ Invalid hour values found: {invalid_hours}")
        print("   Hours must be between 0-23")
        validation_passed = False
    else:
        print("✅ Hour column is valid (0-23 range)")
    
    # Validate visitors
    if df['visitors'].dtype not in ['int64', 'int32', 'float64']:
        print(f"❌ Visitors column should be numeric, found: {df['visitors'].dtype}")
        validation_passed = False
    else:
        # Check for negative values (excluding NaN)
        negative_visitors = df[df['visitors'] < 0]['visitors']
        if len(negative_visitors) > 0:
            print(f"⚠️  Warning: {len(negative_visitors)} negative visitor counts found")
            print("   These will be handled automatically during processing")
        
        # Check for extremely high values (potential outliers)
        q99 = df['visitors'].quantile(0.99)
        extreme_values = df[df['visitors'] > q99 * 5]['visitors']
        if len(extreme_values) > 0:
            print(f"⚠️  Warning: {len(extreme_values)} potentially extreme visitor counts found")
            print(f"   Values above {q99 * 5:.0f} may be outliers")
        
        print("✅ Visitors column format is valid")
    
    # Validate festival flag
    unique_festival_values = df['festival_flag'].dropna().unique()
    valid_festival_values = {True, False, 1, 0, '1', '0', 'True', 'False', 'true', 'false'}
    
    if not all(val in valid_festival_values for val in unique_festival_values):
        invalid_values = [val for val in unique_festival_values if val not in valid_festival_values]
        print(f"❌ Invalid festival_flag values: {invalid_values}")
        print("   Valid values: True, False, 1, 0")
        validation_passed = False
    else:
        print("✅ Festival flag column is valid")
    
    # Validate weather
    unique_weather = df['weather'].dropna().unique()
    common_weather_values = ['sunny', 'cloudy', 'rainy', 'partly_cloudy', 'overcast']
    uncommon_weather = [w for w in unique_weather if w not in common_weather_values]
    
    if uncommon_weather:
        print(f"⚠️  Warning: Uncommon weather values found: {uncommon_weather}")
        print(f"   Common values: {common_weather_values}")
        print("   Uncommon values will be handled during processing")
    
    print("✅ Weather column format is acceptable")
    
    # Data quality checks
    print("\nData Quality Summary:")
    print("-" * 30)
    
    # Missing values
    missing_counts = df.isnull().sum()
    total_missing = missing_counts.sum()
    
    if total_missing > 0:
        print(f"⚠️  Missing values found:")
        for col, count in missing_counts.items():
            if count > 0:
                percentage = (count / len(df)) * 100
                print(f"   {col}: {count} ({percentage:.1f}%)")
        print("   Missing values will be handled automatically")
    else:
        print("✅ No missing values found")
    
    # Data coverage
    date_range = pd.to_datetime(df['date'])
    min_date = date_range.min()
    max_date = date_range.max()
    total_days = (max_date - min_date).days + 1
    
    print(f"\nData Coverage:")
    print(f"   Date range: {min_date.strftime('%Y-%m-%d')} to {max_date.strftime('%Y-%m-%d')}")
    print(f"   Total days: {total_days}")
    print(f"   Total records: {len(df)}")
    print(f"   Expected records (24h/day): {total_days * 24}")
    
    if total_days < 30:
        print("⚠️  Warning: Less than 30 days of data. Minimum 30 days recommended for accurate predictions")
    else:
        print("✅ Sufficient data coverage for predictions")
    
    # Final validation result
    print("\n" + "=" * 50)
    if validation_passed:
        print("🎉 Data validation PASSED! Your file is ready for prediction.")
        print("\nTo run predictions:")
        print(f"python main.py --input-file {file_path} --prediction-days 7")
    else:
        print("❌ Data validation FAILED. Please fix the issues above before running predictions.")
    
    return validation_passed

def main():
    """Main function to run data validation."""
    parser = argparse.ArgumentParser(description='Validate CSV data for Temple Crowd Prediction System')
    parser.add_argument('file_path', help='Path to CSV file to validate')
    
    args = parser.parse_args()
    
    print("Temple Crowd Prediction System - Data Validator")
    print("=" * 60)
    
    success = validate_csv_format(args.file_path)
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()