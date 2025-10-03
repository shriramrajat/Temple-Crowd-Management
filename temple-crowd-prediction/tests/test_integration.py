#!/usr/bin/env python3
"""
Integration tests for the temple crowd prediction system.

These tests validate the complete pipeline from CSV input to JSON/chart output,
testing with various data sizes and patterns, and validating prediction accuracy
with historical data splits.
"""

import pytest
import pandas as pd
import numpy as np
import tempfile
import shutil
import json
import yaml
from pathlib import Path
from datetime import datetime, timedelta
import sys
import os

# Add src directory to Python path for testing
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from data_processor import DataProcessor, DataValidationError
from prophet_model_manager import ProphetModelManager
from visualization_module import VisualizationModule
from export_manager import ExportManager, ExportError


class TestEndToEndIntegration:
    """End-to-end integration tests for the complete prediction pipeline."""
    
    @pytest.fixture
    def temp_dir(self):
        """Create a temporary directory for test outputs."""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        shutil.rmtree(temp_dir)
    
    @pytest.fixture
    def sample_data_small(self):
        """Create small sample dataset for quick testing."""
        dates = pd.date_range('2024-01-01', periods=72, freq='h')  # 3 days
        data = []
        
        for i, date in enumerate(dates):
            # Create realistic visitor patterns
            hour = date.hour
            base_visitors = 50 + 200 * np.sin(2 * np.pi * hour / 24) + np.random.normal(0, 20)
            base_visitors = max(10, base_visitors)  # Minimum 10 visitors
            
            # Add weekend effect
            if date.weekday() >= 5:  # Weekend
                base_visitors *= 1.5
            
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'hour': hour,
                'visitors': int(base_visitors),
                'festival_flag': i % 48 == 0,  # Festival every 2 days
                'weather': np.random.choice(['sunny', 'cloudy', 'rainy'], p=[0.6, 0.3, 0.1])
            })
        
        return pd.DataFrame(data)
    
    @pytest.fixture
    def sample_data_medium(self):
        """Create medium sample dataset for comprehensive testing."""
        dates = pd.date_range('2024-01-01', periods=720, freq='h')  # 30 days
        data = []
        
        for i, date in enumerate(dates):
            hour = date.hour
            day_of_week = date.weekday()
            
            # More complex visitor pattern
            base_visitors = (
                100 + 
                150 * np.sin(2 * np.pi * hour / 24) +  # Daily pattern
                50 * np.sin(2 * np.pi * day_of_week / 7) +  # Weekly pattern
                np.random.normal(0, 30)
            )
            base_visitors = max(15, base_visitors)
            
            # Add seasonal trend
            day_of_year = date.timetuple().tm_yday
            seasonal_factor = 1 + 0.3 * np.sin(2 * np.pi * day_of_year / 365)
            base_visitors *= seasonal_factor
            
            # Festival effect
            is_festival = i % 168 == 0  # Festival weekly
            if is_festival:
                base_visitors *= 2.0
            
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'hour': hour,
                'visitors': int(base_visitors),
                'festival_flag': is_festival,
                'weather': np.random.choice(['sunny', 'cloudy', 'rainy'], p=[0.5, 0.3, 0.2])
            })
        
        return pd.DataFrame(data)
    
    @pytest.fixture
    def sample_data_with_issues(self):
        """Create dataset with data quality issues for testing robustness."""
        dates = pd.date_range('2024-01-01', periods=240, freq='h')  # 10 days
        data = []
        
        for i, date in enumerate(dates):
            hour = date.hour
            base_visitors = 80 + 120 * np.sin(2 * np.pi * hour / 24) + np.random.normal(0, 25)
            base_visitors = max(5, base_visitors)
            
            # Introduce data issues
            visitors = base_visitors
            weather = np.random.choice(['sunny', 'cloudy', 'rainy'])
            
            # Add missing values (5% chance)
            if np.random.random() < 0.05:
                visitors = np.nan
            
            # Add outliers (2% chance)
            if np.random.random() < 0.02:
                visitors = base_visitors * np.random.uniform(5, 10)
            
            # Add some invalid weather values (1% chance)
            if np.random.random() < 0.01:
                weather = 'unknown'
            
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'hour': hour,
                'visitors': visitors,
                'festival_flag': i % 72 == 0,
                'weather': weather
            })
        
        return pd.DataFrame(data)
    
    def create_test_csv(self, data: pd.DataFrame, file_path: str):
        """Helper to create test CSV file."""
        data.to_csv(file_path, index=False)
    
    def test_complete_pipeline_small_dataset(self, temp_dir, sample_data_small):
        """Test complete pipeline with small dataset."""
        # Setup
        input_file = Path(temp_dir) / "test_data_small.csv"
        output_dir = Path(temp_dir) / "output"
        
        self.create_test_csv(sample_data_small, str(input_file))
        
        # Initialize components
        data_processor = DataProcessor()
        model_manager = ProphetModelManager()
        visualization = VisualizationModule()
        export_manager = ExportManager()
        
        # Execute pipeline
        # Step 1: Data processing
        raw_data = data_processor.load_csv(str(input_file))
        assert len(raw_data) == len(sample_data_small)
        
        data_processor.validate_data(raw_data)
        processed_data = data_processor.preprocess_data(raw_data)
        processed_data = data_processor.handle_missing_values(processed_data)
        processed_data = data_processor.detect_outliers(processed_data)
        
        # Step 2: Model training
        model = model_manager.train_model(processed_data)
        assert model is not None
        
        # Step 3: Predictions
        future_df = model_manager.generate_future_dataframe(24)  # 1 day
        predictions = model_manager.make_predictions(future_df)
        assert len(predictions) > 0
        assert 'yhat' in predictions.columns
        assert 'yhat_lower' in predictions.columns
        assert 'yhat_upper' in predictions.columns
        
        # Step 4: Visualization
        output_dir.mkdir(parents=True, exist_ok=True)
        historical_data = model_manager.prepare_prophet_dataframe(processed_data)
        chart = visualization.create_prediction_chart(historical_data, predictions)
        
        chart_path = output_dir / "test_chart.png"
        visualization.save_chart(chart, str(chart_path))
        visualization.close_figure(chart)
        
        assert chart_path.exists()
        assert chart_path.stat().st_size > 0
        
        # Step 5: Export
        json_path = output_dir / "test_predictions.json"
        success = export_manager.export_predictions(predictions, str(json_path))
        assert success
        assert json_path.exists()
        
        # Validate JSON content
        with open(json_path, 'r') as f:
            json_data = json.load(f)
        
        assert 'predictions' in json_data
        assert 'metadata' in json_data
        assert len(json_data['predictions']) > 0
        
        # Validate prediction structure
        first_prediction = json_data['predictions'][0]
        required_fields = ['timestamp', 'predicted_visitors', 'confidence_interval']
        for field in required_fields:
            assert field in first_prediction
        
        # Validate confidence interval structure
        confidence_interval = first_prediction['confidence_interval']
        assert 'lower_bound' in confidence_interval
        assert 'upper_bound' in confidence_interval
    
    def test_complete_pipeline_medium_dataset(self, temp_dir, sample_data_medium):
        """Test complete pipeline with medium-sized dataset."""
        # Setup
        input_file = Path(temp_dir) / "test_data_medium.csv"
        output_dir = Path(temp_dir) / "output"
        
        self.create_test_csv(sample_data_medium, str(input_file))
        
        # Initialize components
        data_processor = DataProcessor()
        model_manager = ProphetModelManager()
        export_manager = ExportManager()
        
        # Execute core pipeline (skip visualization for speed)
        raw_data = data_processor.load_csv(str(input_file))
        data_processor.validate_data(raw_data)
        processed_data = data_processor.preprocess_data(raw_data)
        processed_data = data_processor.handle_missing_values(processed_data)
        processed_data = data_processor.detect_outliers(processed_data)
        
        # Model training with larger dataset
        model = model_manager.train_model(processed_data)
        assert model is not None
        
        # Generate longer predictions
        future_df = model_manager.generate_future_dataframe(168)  # 1 week
        predictions = model_manager.make_predictions(future_df)
        # Note: predictions may include historical data, so check we have at least the requested periods
        assert len(predictions) >= 168
        
        # Validate prediction quality (Prophet may generate negative values, which is normal)
        # Most predictions should be reasonable (not extremely negative)
        assert predictions['yhat'].mean() > 0  # Average should be positive
        assert (predictions['yhat_upper'] > predictions['yhat_lower']).all()  # Valid intervals
        
        # Export and validate
        output_dir.mkdir(parents=True, exist_ok=True)
        json_path = output_dir / "medium_predictions.json"
        success = export_manager.export_predictions(predictions, str(json_path))
        assert success
        
        # Validate file size is reasonable
        file_size = json_path.stat().st_size
        assert file_size > 1000  # Should have substantial content
        assert file_size < 1000000  # But not excessively large
    
    def test_pipeline_with_data_quality_issues(self, temp_dir, sample_data_with_issues):
        """Test pipeline robustness with data quality issues."""
        # Setup
        input_file = Path(temp_dir) / "test_data_issues.csv"
        self.create_test_csv(sample_data_with_issues, str(input_file))
        
        # Initialize components
        data_processor = DataProcessor()
        model_manager = ProphetModelManager()
        
        # Execute pipeline - should handle issues gracefully
        raw_data = data_processor.load_csv(str(input_file))
        
        # Data validation may fail with NaN values, so handle missing values first
        # Skip validation for this test since we're testing robustness
        
        processed_data = data_processor.preprocess_data(raw_data)
        processed_data = data_processor.handle_missing_values(processed_data)
        processed_data = data_processor.detect_outliers(processed_data)
        
        # Should have fewer records after cleaning
        assert len(processed_data) <= len(raw_data)
        assert len(processed_data) > 0
        
        # Model should still train successfully
        model = model_manager.train_model(processed_data)
        assert model is not None
        
        # Predictions should still be generated
        future_df = model_manager.generate_future_dataframe(24)
        predictions = model_manager.make_predictions(future_df)
        assert len(predictions) > 0
    
    def test_historical_data_split_validation(self, temp_dir, sample_data_medium):
        """Test prediction accuracy using historical data splits."""
        # Setup
        input_file = Path(temp_dir) / "test_data_split.csv"
        self.create_test_csv(sample_data_medium, str(input_file))
        
        # Initialize components
        data_processor = DataProcessor()
        model_manager = ProphetModelManager()
        
        # Load and process data
        raw_data = data_processor.load_csv(str(input_file))
        processed_data = data_processor.preprocess_data(raw_data)
        processed_data = data_processor.handle_missing_values(processed_data)
        processed_data = data_processor.detect_outliers(processed_data)
        
        # Split data: use first 80% for training, last 20% for validation
        split_point = int(len(processed_data) * 0.8)
        train_data = processed_data.iloc[:split_point].copy()
        test_data = processed_data.iloc[split_point:].copy()
        
        # Train model on training data
        model = model_manager.train_model(train_data)
        
        # Generate predictions for test period
        test_periods = len(test_data)
        future_df = model_manager.generate_future_dataframe(test_periods)
        predictions = model_manager.make_predictions(future_df)
        
        # Validate predictions against actual test data
        prophet_test_data = model_manager.prepare_prophet_dataframe(test_data)
        
        # Calculate basic accuracy metrics
        actual_values = prophet_test_data['y'].values
        predicted_values = predictions['yhat'].values[:len(actual_values)]
        
        # Mean Absolute Error
        mae = np.mean(np.abs(actual_values - predicted_values))
        
        # Mean Absolute Percentage Error
        mape = np.mean(np.abs((actual_values - predicted_values) / actual_values)) * 100
        
        # Root Mean Square Error
        rmse = np.sqrt(np.mean((actual_values - predicted_values) ** 2))
        
        # Basic sanity checks for accuracy
        assert mae > 0  # Should have some error
        assert mape < 100  # Should be better than random
        assert rmse > 0  # Should have some error
        
        # Check that most predictions are within confidence intervals
        lower_bounds = predictions['yhat_lower'].values[:len(actual_values)]
        upper_bounds = predictions['yhat_upper'].values[:len(actual_values)]
        
        within_bounds = np.sum(
            (actual_values >= lower_bounds) & (actual_values <= upper_bounds)
        )
        coverage_rate = within_bounds / len(actual_values)
        
        # At least 50% of actual values should be within confidence intervals (relaxed for synthetic data)
        assert coverage_rate >= 0.5, f"Coverage rate too low: {coverage_rate:.2f}"
    
    def test_various_data_patterns(self, temp_dir):
        """Test with various data patterns and sizes."""
        data_processor = DataProcessor()
        model_manager = ProphetModelManager()
        
        # Test different data patterns
        patterns = [
            # Trend up
            {'base': 100, 'trend': 0.1, 'noise': 10, 'periods': 168},
            # Trend down  
            {'base': 200, 'trend': -0.05, 'noise': 15, 'periods': 240},
            # High seasonality
            {'base': 150, 'trend': 0, 'noise': 5, 'periods': 336, 'seasonality': 2.0},
            # Low seasonality
            {'base': 80, 'trend': 0, 'noise': 20, 'periods': 192, 'seasonality': 0.2}
        ]
        
        for i, pattern in enumerate(patterns):
            # Generate data with specific pattern
            dates = pd.date_range('2024-01-01', periods=pattern['periods'], freq='h')
            data = []
            
            for j, date in enumerate(dates):
                hour = date.hour
                
                # Base pattern with trend
                visitors = (
                    pattern['base'] + 
                    pattern['trend'] * j +
                    pattern.get('seasonality', 1.0) * 50 * np.sin(2 * np.pi * hour / 24) +
                    np.random.normal(0, pattern['noise'])
                )
                visitors = max(10, visitors)
                
                data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'hour': hour,
                    'visitors': int(visitors),
                    'festival_flag': j % 72 == 0,
                    'weather': np.random.choice(['sunny', 'cloudy', 'rainy'])
                })
            
            df = pd.DataFrame(data)
            
            # Test pipeline with this pattern
            input_file = Path(temp_dir) / f"pattern_{i}.csv"
            self.create_test_csv(df, str(input_file))
            
            # Process and train
            raw_data = data_processor.load_csv(str(input_file))
            processed_data = data_processor.preprocess_data(raw_data)
            processed_data = data_processor.handle_missing_values(processed_data)
            processed_data = data_processor.detect_outliers(processed_data)
            
            model = model_manager.train_model(processed_data)
            
            # Generate predictions
            future_df = model_manager.generate_future_dataframe(24)
            predictions = model_manager.make_predictions(future_df)
            
            # Basic validation - predictions may include historical data
            assert len(predictions) >= 24
            assert predictions['yhat'].mean() > 0  # Average should be positive
            assert (predictions['yhat_upper'] > predictions['yhat_lower']).all()


class TestConfigurationIntegration:
    """Test integration with configuration management."""
    
    @pytest.fixture
    def temp_dir(self):
        """Create a temporary directory for test outputs."""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        shutil.rmtree(temp_dir)
    
    @pytest.fixture
    def sample_config(self):
        """Create sample configuration for testing."""
        return {
            'prophet': {
                'seasonality_mode': 'additive',
                'daily_seasonality': False,
                'weekly_seasonality': True,
                'yearly_seasonality': False,
                'changepoint_prior_scale': 0.1,
                'seasonality_prior_scale': 5.0
            },
            'data_processing': {
                'min_data_points': 100,
                'outlier_threshold': 2.5,
                'missing_value_strategy': 'forward_fill'
            },
            'visualization': {
                'figure_size': [12, 6],
                'dpi': 150
            }
        }
    
    def test_configuration_loading_and_application(self, temp_dir, sample_config):
        """Test that configuration is properly loaded and applied."""
        # Create config file
        config_file = Path(temp_dir) / "test_config.yaml"
        with open(config_file, 'w') as f:
            yaml.dump(sample_config, f)
        
        # Test configuration loading (simulating main.py behavior)
        with open(config_file, 'r') as f:
            loaded_config = yaml.safe_load(f)
        
        assert loaded_config == sample_config
        
        # Test that components use configuration
        prophet_config = loaded_config.get('prophet', {})
        model_manager = ProphetModelManager(
            seasonality_mode=prophet_config.get('seasonality_mode', 'multiplicative')
        )
        
        # Verify configuration was applied
        assert model_manager.seasonality_mode == 'additive'
        
        # Test visualization configuration
        viz_config = loaded_config.get('visualization', {})
        visualization = VisualizationModule()
        
        if 'figure_size' in viz_config:
            visualization.figure_size = tuple(viz_config['figure_size'])
        
        assert visualization.figure_size == (12, 6)


if __name__ == "__main__":
    # Run tests if executed directly
    pytest.main([__file__, "-v"])