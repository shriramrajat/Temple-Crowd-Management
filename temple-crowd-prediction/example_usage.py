#!/usr/bin/env python3
"""
Example usage script for the Temple Crowd Prediction System.
Demonstrates various ways to use the system programmatically.
"""

import os
import sys
import subprocess
from datetime import datetime, timedelta

def run_basic_example():
    """Run basic prediction example with sample data."""
    print("=" * 60)
    print("BASIC EXAMPLE: 7-day prediction with small sample data")
    print("=" * 60)
    
    cmd = [
        "python", "main.py",
        "--input-file", "data/sample_temple_data_small.csv",
        "--prediction-days", "7",
        "--output-dir", "output/basic_example"
    ]
    
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Basic example completed successfully!")
        print("Check output/basic_example/ for results")
    else:
        print("❌ Basic example failed:")
        print(result.stderr)
    
    return result.returncode == 0

def run_advanced_example():
    """Run advanced prediction example with full dataset."""
    print("\n" + "=" * 60)
    print("ADVANCED EXAMPLE: 30-day prediction with full dataset")
    print("=" * 60)
    
    cmd = [
        "python", "main.py",
        "--input-file", "data/sample_temple_data.csv",
        "--prediction-days", "30",
        "--output-dir", "output/advanced_example",
        "--log-level", "DEBUG"
    ]
    
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Advanced example completed successfully!")
        print("Check output/advanced_example/ for results")
    else:
        print("❌ Advanced example failed:")
        print(result.stderr)
    
    return result.returncode == 0

def run_custom_config_example():
    """Run example with custom configuration."""
    print("\n" + "=" * 60)
    print("CUSTOM CONFIG EXAMPLE: Using modified configuration")
    print("=" * 60)
    
    # Create custom config
    custom_config = """
# Custom Temple Crowd Prediction Configuration
prophet:
  seasonality_mode: 'additive'
  daily_seasonality: true
  weekly_seasonality: true
  yearly_seasonality: true
  changepoint_prior_scale: 0.1
  seasonality_prior_scale: 5.0

data_processing:
  min_data_points: 720
  outlier_threshold: 2.5
  missing_value_strategy: 'forward_fill'

visualization:
  figure_size: [12, 6]
  dpi: 200
  chart_style: 'seaborn-v0_8'
  confidence_interval_alpha: 0.2

export:
  json_indent: 4
  datetime_format: '%Y-%m-%d %H:%M:%S'
  include_confidence_intervals: true
"""
    
    # Write custom config
    with open("custom_config.yaml", "w") as f:
        f.write(custom_config)
    
    cmd = [
        "python", "main.py",
        "--input-file", "data/sample_temple_data_small.csv",
        "--prediction-days", "14",
        "--config-file", "custom_config.yaml",
        "--output-dir", "output/custom_config_example"
    ]
    
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Custom config example completed successfully!")
        print("Check output/custom_config_example/ for results")
    else:
        print("❌ Custom config example failed:")
        print(result.stderr)
    
    # Clean up
    if os.path.exists("custom_config.yaml"):
        os.remove("custom_config.yaml")
    
    return result.returncode == 0

def show_output_examples():
    """Display examples of expected output."""
    print("\n" + "=" * 60)
    print("OUTPUT EXAMPLES")
    print("=" * 60)
    
    print("\n📊 Expected Output Files:")
    print("- predictions.json: Hourly predictions with confidence intervals")
    print("- prediction_chart.png: Visualization of actual vs predicted data")
    print("- temple_crowd_prediction.log: Detailed execution logs")
    
    print("\n📈 Sample JSON Output Structure:")
    sample_json = """{
  "metadata": {
    "model_version": "1.0",
    "generation_timestamp": "2024-01-20T10:30:00Z",
    "prediction_period_days": 7,
    "input_data_period": "2024-01-01 to 2024-03-31"
  },
  "predictions": [
    {
      "timestamp": "2024-04-01T00:00:00Z",
      "predicted_visitors": 45.2,
      "lower_bound": 32.1,
      "upper_bound": 58.3
    },
    {
      "timestamp": "2024-04-01T01:00:00Z",
      "predicted_visitors": 38.7,
      "lower_bound": 25.4,
      "upper_bound": 52.0
    }
  ]
}"""
    print(sample_json)

def main():
    """Run all examples."""
    print("Temple Crowd Prediction System - Usage Examples")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists("main.py"):
        print("❌ Error: Please run this script from the temple-crowd-prediction directory")
        sys.exit(1)
    
    # Check if sample data exists
    if not os.path.exists("data/sample_temple_data_small.csv"):
        print("❌ Error: Sample data not found. Please run generate_sample_data.py first")
        sys.exit(1)
    
    success_count = 0
    total_examples = 3
    
    # Run examples
    if run_basic_example():
        success_count += 1
    
    if run_advanced_example():
        success_count += 1
    
    if run_custom_config_example():
        success_count += 1
    
    # Show output examples
    show_output_examples()
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"✅ Successful examples: {success_count}/{total_examples}")
    
    if success_count == total_examples:
        print("🎉 All examples completed successfully!")
        print("\nNext steps:")
        print("1. Check the output directories for generated files")
        print("2. Try running with your own data")
        print("3. Customize the configuration for your needs")
    else:
        print("⚠️  Some examples failed. Check the error messages above.")
        print("Common issues:")
        print("- Missing dependencies (run: pip install -r requirements.txt)")
        print("- Insufficient data (ensure minimum 30 days of data)")
        print("- File permission issues")

if __name__ == "__main__":
    main()