# Temple Crowd Prediction System

A Python-based application that uses Facebook Prophet to forecast hourly visitor counts for temples based on historical data, festivals, and weather conditions. The system helps temple administrators optimize staffing, crowd control, and visitor experience planning through accurate time series forecasting.

## Features

- **Time Series Forecasting**: Uses Facebook Prophet for accurate hourly visitor predictions
- **External Regressors**: Incorporates festival flags and weather conditions for enhanced accuracy
- **Data Quality Handling**: Automatically handles missing values and outliers
- **Visualization**: Generates charts comparing actual vs predicted visitor counts
- **JSON Export**: Provides structured prediction data for integration with other systems
- **Configurable Parameters**: Customizable model settings and prediction periods

## Project Structure

```
temple-crowd-prediction/
├── src/                          # Source code modules
│   ├── __init__.py              # Package initialization
│   ├── data_processor.py        # Data loading and preprocessing
│   ├── prophet_model_manager.py # Prophet model configuration and training
│   ├── visualization_module.py  # Chart generation and visualization
│   └── export_manager.py        # JSON export and file operations
├── data/                        # Input data directory
│   ├── sample_temple_data.csv   # Full sample dataset (3 years)
│   └── sample_temple_data_small.csv # Small sample dataset (3 months)
├── output/                      # Output files (charts, JSON predictions)
├── config.yaml                  # Configuration file for model parameters
├── main.py                      # Main application entry point
├── generate_sample_data.py      # Script to generate sample data
├── validate_data.py             # Data validation utility
├── example_usage.py             # Usage examples and demonstrations
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## Installation

1. **Clone or download the project** to your local machine

2. **Navigate to the project directory**:
```bash
cd temple-crowd-prediction
```

3. **Create a virtual environment** (recommended):
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

4. **Install dependencies**:
```bash
pip install -r requirements.txt
```

5. **Verify installation** by running the help command:
```bash
python main.py --help
```

## Quick Start

### Using Sample Data

To get started quickly with the provided sample data:

```bash
# Run with small sample dataset (3 months)
python main.py --input-file data/sample_temple_data_small.csv --prediction-days 7

# Run with full sample dataset (3 years)
python main.py --input-file data/sample_temple_data.csv --prediction-days 30
```

### Using Your Own Data

```bash
python main.py --input-file path/to/your/data.csv --output-dir output --prediction-days 30
```

## Usage Examples

### Basic Usage
```bash
# Predict next 7 days using sample data
python main.py --input-file data/sample_temple_data_small.csv --prediction-days 7
```

### Advanced Usage
```bash
# Custom output directory and extended prediction period
python main.py \
  --input-file data/sample_temple_data.csv \
  --output-dir custom_output \
  --prediction-days 60 \
  --log-level DEBUG
```

### Configuration File Usage
```bash
# Use custom configuration file
python main.py \
  --input-file data/sample_temple_data.csv \
  --config-file custom_config.yaml
```

## Command Line Arguments

| Argument | Description | Default | Required |
|----------|-------------|---------|----------|
| `--input-file` | Path to CSV file with visitor data | - | Yes |
| `--output-dir` | Directory for output files | `output` | No |
| `--prediction-days` | Number of days to predict | `30` | No |
| `--config-file` | Path to configuration YAML file | `config.yaml` | No |
| `--log-level` | Logging level (DEBUG, INFO, WARNING, ERROR) | `INFO` | No |

## Input Data Format

The CSV file must contain the following columns in any order:

| Column | Type | Description | Example Values |
|--------|------|-------------|----------------|
| `date` | String | Date in YYYY-MM-DD format | `2024-01-15` |
| `hour` | Integer | Hour of day (0-23) | `14` |
| `visitors` | Integer | Number of visitors (non-negative) | `150` |
| `festival_flag` | Boolean | Festival day indicator | `True`, `False`, `1`, `0` |
| `weather` | String | Weather condition | `sunny`, `rainy`, `cloudy`, `partly_cloudy` |

### Sample Data Row
```csv
date,hour,visitors,festival_flag,weather
2024-01-15,14,150,False,sunny
2024-01-15,15,180,False,partly_cloudy
2024-01-16,6,95,True,cloudy
```

### Data Requirements
- **Minimum Data**: At least 30 days of historical data recommended
- **Missing Values**: System handles missing values automatically
- **Outliers**: Automatic outlier detection and handling
- **Weather Categories**: Supports `sunny`, `cloudy`, `rainy`, `partly_cloudy`, `overcast`

## Output Files

The system generates the following output files in the specified output directory:

### 1. predictions.json
JSON file containing hourly predictions with confidence intervals:

```json
{
  "metadata": {
    "model_version": "1.0",
    "generation_timestamp": "2024-01-20T10:30:00Z",
    "prediction_period_days": 30,
    "input_data_period": "2022-01-01 to 2024-01-19"
  },
  "predictions": [
    {
      "timestamp": "2024-01-20T00:00:00Z",
      "predicted_visitors": 45.2,
      "lower_bound": 32.1,
      "upper_bound": 58.3
    },
    {
      "timestamp": "2024-01-20T01:00:00Z",
      "predicted_visitors": 38.7,
      "lower_bound": 25.4,
      "upper_bound": 52.0
    }
  ]
}
```

### 2. prediction_chart.png
Visualization showing:
- Historical actual visitor counts (blue line)
- Predicted visitor counts (orange line)
- Confidence intervals (shaded area)
- Festival days (marked with vertical lines)

### 3. Application Logs
Detailed logs of the prediction process including:
- Data validation results
- Model training progress
- Prediction generation status
- Any warnings or errors encountered

## Configuration

The system uses a YAML configuration file (`config.yaml`) to customize model parameters:

```yaml
# Prophet Model Configuration
prophet:
  seasonality_mode: 'multiplicative'  # 'additive' or 'multiplicative'
  yearly_seasonality: true
  weekly_seasonality: true
  daily_seasonality: true
  changepoint_prior_scale: 0.05      # Flexibility of trend changes
  seasonality_prior_scale: 10.0      # Flexibility of seasonality
  holidays_prior_scale: 10.0         # Flexibility of holiday effects

# Data Processing Configuration
data_processing:
  outlier_threshold: 3.0             # Standard deviations for outlier detection
  missing_value_strategy: 'interpolate'  # 'interpolate', 'forward_fill', 'drop'
  min_data_points: 720               # Minimum hourly data points (30 days)

# Output Configuration
output:
  chart_width: 12                    # Chart width in inches
  chart_height: 8                    # Chart height in inches
  chart_dpi: 300                     # Chart resolution
  include_confidence_intervals: true  # Show confidence bands in chart
```

### Customizing Configuration

1. **Copy the default config**:
```bash
cp config.yaml my_config.yaml
```

2. **Edit parameters** as needed

3. **Use custom config**:
```bash
python main.py --input-file data/sample_temple_data.csv --config-file my_config.yaml
```

## Utility Scripts

### Generating Sample Data

To create your own sample data for testing:

```bash
# Generate 3 years of sample data (default)
python generate_sample_data.py

# Generate custom date range
python -c "
from generate_sample_data import generate_sample_data
generate_sample_data('2023-01-01', '2023-12-31', 'data/custom_sample.csv')
"
```

### Validating Your Data

Before running predictions, validate your CSV file format:

```bash
# Validate your data file
python validate_data.py path/to/your/data.csv

# Validate sample data
python validate_data.py data/sample_temple_data_small.csv
```

The validator checks for:
- Required columns and correct data types
- Date format validation
- Hour range validation (0-23)
- Visitor count validation
- Festival flag format
- Weather condition values
- Missing values and data quality issues

### Running Examples

Try different usage scenarios with the example script:

```bash
# Run all usage examples
python example_usage.py
```

This script demonstrates:
- Basic prediction with small dataset
- Advanced prediction with full dataset
- Custom configuration usage
- Expected output formats

## Troubleshooting

### Common Issues

**1. "Insufficient data" error**
- Ensure you have at least 30 days of historical data
- Check that your CSV file has the required columns
- Verify date format is YYYY-MM-DD

**2. "Prophet model fitting failed"**
- Check for missing values in the date/visitors columns
- Ensure visitor counts are non-negative
- Try reducing `changepoint_prior_scale` in config

**3. "File not found" errors**
- Verify input file path is correct
- Ensure output directory exists or can be created
- Check file permissions

**4. Memory issues with large datasets**
- Use smaller prediction periods
- Consider data sampling for very large datasets
- Monitor system memory usage

### Getting Help

1. **Enable debug logging**:
```bash
python main.py --input-file data/sample_temple_data.csv --log-level DEBUG
```

2. **Check the logs** in the output directory for detailed error information

3. **Validate your data** format matches the requirements exactly

## Performance Notes

- **Training Time**: Scales with data size; 1-3 years of hourly data typically takes 1-5 minutes
- **Memory Usage**: Approximately 100MB per year of hourly data
- **Prediction Speed**: Fast once model is trained; predictions generate in seconds

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Development Status

This project is feature-complete and ready for production use. All core modules have been implemented and tested according to the implementation plan.