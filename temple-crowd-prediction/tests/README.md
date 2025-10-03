# Temple Crowd Prediction - Integration and Performance Tests

This directory contains comprehensive integration and performance tests for the temple crowd prediction system.

## Test Structure

### Integration Tests (`test_integration.py`)

End-to-end integration tests that validate the complete pipeline from CSV input to JSON/chart output:

- **TestEndToEndIntegration**: Complete pipeline testing with various data scenarios
  - `test_complete_pipeline_small_dataset`: Tests with 3 days of data (72 records)
  - `test_complete_pipeline_medium_dataset`: Tests with 30 days of data (720 records)
  - `test_pipeline_with_data_quality_issues`: Tests robustness with missing values and outliers
  - `test_historical_data_split_validation`: Tests prediction accuracy using train/test splits
  - `test_various_data_patterns`: Tests with different trend and seasonality patterns

- **TestConfigurationIntegration**: Tests configuration loading and application
  - `test_configuration_loading_and_application`: Validates YAML config integration

### Performance Tests (`test_performance.py`)

Performance and scalability tests that measure execution time and memory usage:

- **TestPerformanceMetrics**: Performance testing with various dataset sizes
  - `test_data_processing_performance`: Tests data processing with 1 month to 1 year of data
  - `test_model_training_performance`: Tests Prophet model training performance
  - `test_visualization_performance`: Tests chart generation performance
  - `test_export_performance`: Tests JSON export performance
  - `test_end_to_end_performance_large_dataset`: Complete pipeline with 1 year of data

- **TestMemoryOptimization**: Memory usage and leak detection
  - `test_memory_cleanup_after_operations`: Validates proper memory cleanup

## Running Tests

### Prerequisites

Install test dependencies:
```bash
pip install -r requirements.txt
```

Required packages for testing:
- `pytest>=7.2.0`
- `pytest-cov>=4.0.0`
- `psutil>=5.9.0` (for performance monitoring)

### Running Individual Test Suites

**Integration Tests Only:**
```bash
python -m pytest tests/test_integration.py -v
```

**Performance Tests Only:**
```bash
python -m pytest tests/test_performance.py -v -s
```

**All Tests:**
```bash
python -m pytest tests/ -v -s
```

### Using the Test Runner

Use the provided test runner script for convenience:

```bash
# Run all tests
python run_tests.py

# Run only integration tests
python run_tests.py --test-type integration

# Run only performance tests
python run_tests.py --test-type performance

# Verbose output
python run_tests.py --verbose
```

## Test Data

Tests automatically generate synthetic data with realistic patterns:

- **Daily patterns**: Visitor counts follow realistic hourly patterns
- **Weekly patterns**: Weekend effects and weekday variations
- **Seasonal patterns**: Annual trends and festival effects
- **Data quality issues**: Missing values, outliers, and invalid data for robustness testing

## Performance Benchmarks

### Expected Performance Metrics

**Data Processing:**
- Loading: < 1 second per 10,000 records
- Validation: < 0.5 seconds per 20,000 records
- Memory usage: < 200MB for 1 year of data

**Model Training:**
- Training time: < 30 seconds per year of data
- Memory usage: < 500MB for 1 year of data
- Prediction generation: < 5 seconds

**Visualization:**
- Chart creation: < 10 seconds
- Chart saving: < 3 seconds

**Export:**
- JSON export: < 2 seconds for 1 month of predictions
- Memory usage: < 50MB
- File size: < 10MB for 1 month of predictions

### Performance Test Coverage

1. **Scalability Testing**: Tests with datasets from 30 days to 1 year
2. **Memory Monitoring**: Tracks peak memory usage and detects leaks
3. **Execution Time**: Measures performance of each pipeline component
4. **Resource Optimization**: Validates efficient resource usage

## Test Validation

### Integration Test Coverage

- ✅ Complete pipeline execution
- ✅ Data validation and preprocessing
- ✅ Prophet model training and prediction
- ✅ Visualization generation
- ✅ JSON export functionality
- ✅ Configuration management
- ✅ Error handling and robustness
- ✅ Data quality issue handling
- ✅ Prediction accuracy validation

### Performance Test Coverage

- ✅ Data processing scalability
- ✅ Model training performance
- ✅ Memory usage optimization
- ✅ Visualization performance
- ✅ Export performance
- ✅ End-to-end pipeline performance
- ✅ Memory leak detection

## Troubleshooting

### Common Issues

**Import Errors:**
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Verify Python path includes the `src` directory

**Performance Test Failures:**
- Performance thresholds may need adjustment based on hardware
- Tests are designed for typical development machines
- Adjust timeout values in test code if needed

**Memory Tests:**
- Memory tests may be sensitive to system load
- Run tests on a clean system for accurate results
- Garbage collection timing may affect results

### Test Environment

Tests are designed to run on:
- Python 3.8+
- Windows/Linux/macOS
- Minimum 4GB RAM recommended
- Temporary disk space for test outputs

## Contributing

When adding new tests:

1. Follow existing test patterns and naming conventions
2. Include both positive and negative test cases
3. Add performance benchmarks for new features
4. Update this README with new test descriptions
5. Ensure tests clean up temporary files and resources

## Test Results Interpretation

### Integration Test Results

- **PASSED**: All pipeline components work correctly together
- **FAILED**: Check error messages for specific component failures

### Performance Test Results

Performance metrics are logged during test execution:
- Execution times for each component
- Memory usage patterns
- Resource utilization statistics

Use these metrics to:
- Identify performance bottlenecks
- Validate optimization improvements
- Monitor performance regression
- Plan capacity requirements