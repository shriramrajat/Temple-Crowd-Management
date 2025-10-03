# Design Document

## Overview

The temple crowd prediction system is a Python-based application that leverages Facebook Prophet for time series forecasting of hourly visitor counts. The system processes historical visitor data with contextual factors (festivals, weather) to generate accurate predictions with confidence intervals. The architecture follows a modular design with clear separation between data processing, model training, prediction generation, and output formatting.

## Architecture

The system follows a pipeline architecture with the following main components:

```
CSV Input → Data Processor → Prophet Model → Prediction Engine → Output Generator
                ↓                ↓               ↓               ↓
           Validation &      Model Training   Forecasting    Chart & JSON
           Preprocessing    with Regressors   with CI        Export
```

### Core Components:

1. **Data Processor**: Handles CSV loading, validation, and preprocessing
2. **Prophet Model Manager**: Configures and trains the Prophet model with external regressors
3. **Prediction Engine**: Generates forecasts with confidence intervals
4. **Visualization Module**: Creates actual vs predicted charts
5. **Export Manager**: Handles JSON output formatting and file operations

## Components and Interfaces

### DataProcessor Class
```python
class DataProcessor:
    def load_csv(self, file_path: str) -> pd.DataFrame
    def validate_data(self, df: pd.DataFrame) -> bool
    def preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame
    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame
    def detect_outliers(self, df: pd.DataFrame) -> pd.DataFrame
```

### ProphetModelManager Class
```python
class ProphetModelManager:
    def __init__(self, seasonality_mode: str = 'multiplicative')
    def add_regressors(self, model: Prophet, regressor_names: List[str]) -> Prophet
    def train_model(self, df: pd.DataFrame) -> Prophet
    def generate_future_dataframe(self, model: Prophet, periods: int) -> pd.DataFrame
    def make_predictions(self, model: Prophet, future_df: pd.DataFrame) -> pd.DataFrame
```

### VisualizationModule Class
```python
class VisualizationModule:
    def create_prediction_chart(self, actual_data: pd.DataFrame, predictions: pd.DataFrame) -> plt.Figure
    def save_chart(self, figure: plt.Figure, output_path: str) -> None
    def format_chart_styling(self, figure: plt.Figure) -> plt.Figure
```

### ExportManager Class
```python
class ExportManager:
    def format_predictions_json(self, predictions: pd.DataFrame) -> dict
    def save_json(self, data: dict, output_path: str) -> None
    def validate_json_output(self, file_path: str) -> bool
```

## Data Models

### Input Data Schema
```python
@dataclass
class VisitorData:
    date: datetime
    hour: int
    visitors: int
    festival_flag: bool
    weather: str  # categorical: 'sunny', 'rainy', 'cloudy', etc.
```

### Prophet Data Format
```python
# Prophet requires specific column names
prophet_df = pd.DataFrame({
    'ds': datetime,  # timestamp
    'y': int,        # target variable (visitors)
    'festival': bool,  # regressor
    'weather_encoded': float  # encoded weather regressor
})
```

### Prediction Output Schema
```python
@dataclass
class PredictionResult:
    timestamp: datetime
    predicted_visitors: float
    lower_bound: float
    upper_bound: float
    actual_visitors: Optional[float] = None
```

## Error Handling

### Data Validation Errors
- **Missing Required Columns**: Raise `DataValidationError` with specific missing column names
- **Invalid Date Formats**: Attempt parsing with multiple formats, raise `DateParsingError` if all fail
- **Negative Visitor Counts**: Log warning and apply floor of 0
- **Invalid Hour Values**: Raise `ValueError` for hours outside 0-23 range

### Model Training Errors
- **Insufficient Data**: Require minimum 30 days of data, raise `InsufficientDataError`
- **Prophet Fitting Failures**: Catch Prophet exceptions and provide user-friendly error messages
- **Regressor Issues**: Validate regressor data completeness before model training

### Output Generation Errors
- **File Permission Issues**: Handle with graceful fallback to alternative output locations
- **JSON Serialization Errors**: Implement custom JSON encoder for datetime objects
- **Chart Generation Failures**: Provide text-based summary if visualization fails

## Testing Strategy

### Unit Tests
- **Data Processing Functions**: Test CSV loading, validation, and preprocessing with various input scenarios
- **Prophet Model Configuration**: Verify correct regressor addition and model parameter settings
- **Prediction Formatting**: Test JSON output structure and datetime serialization
- **Error Handling**: Test all error conditions with appropriate mock data

### Integration Tests
- **End-to-End Pipeline**: Test complete workflow from CSV input to JSON/chart output
- **Prophet Model Training**: Test with real-world data patterns and edge cases
- **File I/O Operations**: Test reading/writing operations with various file permissions

### Data Quality Tests
- **Outlier Detection**: Verify outlier identification and handling mechanisms
- **Missing Value Imputation**: Test various missing data patterns and imputation strategies
- **Data Validation**: Test validation logic with malformed and edge-case data

### Performance Tests
- **Large Dataset Handling**: Test with datasets of varying sizes (1 month to 5+ years)
- **Memory Usage**: Monitor memory consumption during model training and prediction
- **Execution Time**: Benchmark key operations for performance optimization opportunities

## Implementation Notes

### Prophet Configuration
- Use multiplicative seasonality for visitor patterns that scale with overall volume
- Enable daily and weekly seasonality detection
- Add yearly seasonality for annual festival cycles
- Configure changepoint detection for trend changes

### Weather Data Encoding
- Use one-hot encoding for categorical weather conditions
- Handle unknown weather categories gracefully
- Consider weather impact correlation analysis

### Festival Flag Handling
- Treat as binary regressor in Prophet
- Consider festival type categorization for enhanced accuracy
- Account for festival preparation/aftermath periods

### Output Formatting
- Ensure JSON timestamps are ISO 8601 formatted
- Include metadata in JSON output (model version, generation timestamp)
- Provide both hourly and daily aggregated predictions