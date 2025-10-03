#!/usr/bin/env python3
"""
Performance tests for the temple crowd prediction system.

These tests measure execution time and memory usage during model training,
test with large datasets, and identify potential bottlenecks for optimization.
"""

import pytest
import pandas as pd
import numpy as np
import tempfile
import shutil
import time
import psutil
import os
from pathlib import Path
from datetime import datetime, timedelta
import sys
import gc
from typing import Dict, List, Tuple

# Add src directory to Python path for testing
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from data_processor import DataProcessor
from prophet_model_manager import ProphetModelManager
from visualization_module import VisualizationModule
from export_manager import ExportManager


class PerformanceMonitor:
    """Utility class for monitoring performance metrics."""
    
    def __init__(self):
        self.process = psutil.Process(os.getpid())
        self.start_time = None
        self.start_memory = None
        self.peak_memory = None
    
    def start_monitoring(self):
        """Start performance monitoring."""
        gc.collect()  # Clean up before monitoring
        self.start_time = time.time()
        self.start_memory = self.process.memory_info().rss / 1024 / 1024  # MB
        self.peak_memory = self.start_memory
    
    def update_peak_memory(self):
        """Update peak memory usage."""
        current_memory = self.process.memory_info().rss / 1024 / 1024  # MB
        self.peak_memory = max(self.peak_memory, current_memory)
    
    def get_metrics(self) -> Dict[str, float]:
        """Get current performance metrics."""
        if self.start_time is None:
            raise ValueError("Monitoring not started")
        
        self.update_peak_memory()
        current_time = time.time()
        current_memory = self.process.memory_info().rss / 1024 / 1024  # MB
        
        return {
            'execution_time': current_time - self.start_time,
            'start_memory_mb': self.start_memory,
            'current_memory_mb': current_memory,
            'peak_memory_mb': self.peak_memory,
            'memory_increase_mb': current_memory - self.start_memory,
            'peak_memory_increase_mb': self.peak_memory - self.start_memory
        }


class TestPerformanceMetrics:
    """Performance tests for various dataset sizes and operations."""
    
    @pytest.fixture
    def temp_dir(self):
        """Create a temporary directory for test outputs."""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        shutil.rmtree(temp_dir)
    
    def generate_large_dataset(self, days: int, add_complexity: bool = True) -> pd.DataFrame:
        """Generate large dataset for performance testing."""
        periods = days * 24  # Hours
        dates = pd.date_range('2023-01-01', periods=periods, freq='h')
        data = []
        
        for i, date in enumerate(dates):
            hour = date.hour
            day_of_week = date.weekday()
            day_of_year = date.timetuple().tm_yday
            
            # Complex visitor pattern if requested
            if add_complexity:
                base_visitors = (
                    120 +  # Base level
                    80 * np.sin(2 * np.pi * hour / 24) +  # Daily pattern
                    40 * np.sin(2 * np.pi * day_of_week / 7) +  # Weekly pattern
                    30 * np.sin(2 * np.pi * day_of_year / 365) +  # Yearly pattern
                    20 * np.sin(2 * np.pi * i / (24 * 7)) +  # Bi-weekly pattern
                    np.random.normal(0, 25)  # Noise
                )
            else:
                base_visitors = (
                    100 + 
                    50 * np.sin(2 * np.pi * hour / 24) +
                    np.random.normal(0, 20)
                )
            
            base_visitors = max(10, base_visitors)
            
            # Add festival effects
            is_festival = (i % (24 * 14) == 0)  # Bi-weekly festivals
            if is_festival:
                base_visitors *= np.random.uniform(1.5, 3.0)
            
            # Add seasonal trends
            seasonal_factor = 1 + 0.4 * np.sin(2 * np.pi * day_of_year / 365)
            base_visitors *= seasonal_factor
            
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'hour': hour,
                'visitors': int(base_visitors),
                'festival_flag': is_festival,
                'weather': np.random.choice(
                    ['sunny', 'cloudy', 'rainy', 'windy'], 
                    p=[0.4, 0.3, 0.2, 0.1]
                )
            })
        
        return pd.DataFrame(data)
    
    def create_test_csv(self, data: pd.DataFrame, file_path: str):
        """Helper to create test CSV file."""
        data.to_csv(file_path, index=False)
    
    @pytest.mark.parametrize("dataset_size", [
        30,   # 1 month
        90,   # 3 months  
        180,  # 6 months
        365,  # 1 year
    ])
    def test_data_processing_performance(self, temp_dir, dataset_size):
        """Test data processing performance with various dataset sizes."""
        monitor = PerformanceMonitor()
        
        # Generate test data
        test_data = self.generate_large_dataset(dataset_size, add_complexity=False)
        input_file = Path(temp_dir) / f"perf_data_{dataset_size}d.csv"
        self.create_test_csv(test_data, str(input_file))
        
        # Initialize data processor
        data_processor = DataProcessor()
        
        # Test data loading performance
        monitor.start_monitoring()
        raw_data = data_processor.load_csv(str(input_file))
        load_metrics = monitor.get_metrics()
        
        # Test validation performance
        monitor.start_monitoring()
        data_processor.validate_data(raw_data)
        validation_metrics = monitor.get_metrics()
        
        # Test preprocessing performance
        monitor.start_monitoring()
        processed_data = data_processor.preprocess_data(raw_data)
        preprocessing_metrics = monitor.get_metrics()
        
        # Test missing value handling performance
        monitor.start_monitoring()
        processed_data = data_processor.handle_missing_values(processed_data)
        missing_value_metrics = monitor.get_metrics()
        
        # Test outlier detection performance
        monitor.start_monitoring()
        processed_data = data_processor.detect_outliers(processed_data)
        outlier_metrics = monitor.get_metrics()
        
        # Performance assertions
        total_records = len(test_data)
        
        # Data loading should be fast (< 1 second per 10k records)
        max_load_time = max(1.0, total_records / 10000)
        assert load_metrics['execution_time'] < max_load_time, \
            f"Data loading too slow: {load_metrics['execution_time']:.2f}s for {total_records} records"
        
        # Validation should be very fast (< 0.5 seconds per 10k records)
        max_validation_time = max(0.5, total_records / 20000)
        assert validation_metrics['execution_time'] < max_validation_time, \
            f"Validation too slow: {validation_metrics['execution_time']:.2f}s"
        
        # Memory usage should be reasonable (< 100MB increase for 1 year of data)
        max_memory_increase = min(200, dataset_size / 2)  # Scale with dataset size
        assert outlier_metrics['peak_memory_increase_mb'] < max_memory_increase, \
            f"Memory usage too high: {outlier_metrics['peak_memory_increase_mb']:.1f}MB"
        
        # Log performance metrics for analysis
        print(f"\nPerformance metrics for {dataset_size} days ({total_records} records):")
        print(f"  Data loading: {load_metrics['execution_time']:.3f}s")
        print(f"  Validation: {validation_metrics['execution_time']:.3f}s")
        print(f"  Preprocessing: {preprocessing_metrics['execution_time']:.3f}s")
        print(f"  Missing values: {missing_value_metrics['execution_time']:.3f}s")
        print(f"  Outlier detection: {outlier_metrics['execution_time']:.3f}s")
        print(f"  Peak memory increase: {outlier_metrics['peak_memory_increase_mb']:.1f}MB")
    
    @pytest.mark.parametrize("dataset_size", [
        60,   # 2 months
        180,  # 6 months
        365,  # 1 year
    ])
    def test_model_training_performance(self, temp_dir, dataset_size):
        """Test Prophet model training performance with large datasets."""
        monitor = PerformanceMonitor()
        
        # Generate and prepare test data
        test_data = self.generate_large_dataset(dataset_size, add_complexity=True)
        input_file = Path(temp_dir) / f"model_perf_{dataset_size}d.csv"
        self.create_test_csv(test_data, str(input_file))
        
        # Process data
        data_processor = DataProcessor()
        raw_data = data_processor.load_csv(str(input_file))
        processed_data = data_processor.preprocess_data(raw_data)
        processed_data = data_processor.handle_missing_values(processed_data)
        processed_data = data_processor.detect_outliers(processed_data)
        
        # Test model training performance
        model_manager = ProphetModelManager()
        
        monitor.start_monitoring()
        model = model_manager.train_model(processed_data)
        training_metrics = monitor.get_metrics()
        
        # Test prediction generation performance
        monitor.start_monitoring()
        future_df = model_manager.generate_future_dataframe(168)  # 1 week
        prediction_metrics = monitor.get_metrics()
        
        monitor.start_monitoring()
        predictions = model_manager.make_predictions(future_df)
        prediction_generation_metrics = monitor.get_metrics()
        
        # Performance assertions
        total_records = len(processed_data)
        
        # Model training time should scale reasonably (< 30 seconds per year of data)
        max_training_time = max(10.0, dataset_size / 12)  # Scale with dataset size
        assert training_metrics['execution_time'] < max_training_time, \
            f"Model training too slow: {training_metrics['execution_time']:.2f}s for {dataset_size} days"
        
        # Prediction generation should be fast (< 5 seconds)
        assert prediction_generation_metrics['execution_time'] < 5.0, \
            f"Prediction generation too slow: {prediction_generation_metrics['execution_time']:.2f}s"
        
        # Memory usage should be reasonable for model training
        max_memory_increase = min(500, dataset_size * 2)  # Scale with dataset size
        assert training_metrics['peak_memory_increase_mb'] < max_memory_increase, \
            f"Model training memory usage too high: {training_metrics['peak_memory_increase_mb']:.1f}MB"
        
        # Validate model quality
        assert model is not None
        assert len(predictions) == 168
        assert predictions['yhat'].min() >= 0
        
        # Log performance metrics
        print(f"\nModel performance metrics for {dataset_size} days ({total_records} records):")
        print(f"  Model training: {training_metrics['execution_time']:.3f}s")
        print(f"  Future dataframe: {prediction_metrics['execution_time']:.3f}s")
        print(f"  Prediction generation: {prediction_generation_metrics['execution_time']:.3f}s")
        print(f"  Training memory increase: {training_metrics['peak_memory_increase_mb']:.1f}MB")
        print(f"  Prediction memory increase: {prediction_generation_metrics['peak_memory_increase_mb']:.1f}MB")
    
    def test_visualization_performance(self, temp_dir):
        """Test visualization performance with large datasets."""
        monitor = PerformanceMonitor()
        
        # Generate test data
        test_data = self.generate_large_dataset(90, add_complexity=True)  # 3 months
        
        # Process data and train model
        data_processor = DataProcessor()
        input_file = Path(temp_dir) / "viz_perf_data.csv"
        self.create_test_csv(test_data, str(input_file))
        
        raw_data = data_processor.load_csv(str(input_file))
        processed_data = data_processor.preprocess_data(raw_data)
        processed_data = data_processor.handle_missing_values(processed_data)
        processed_data = data_processor.detect_outliers(processed_data)
        
        model_manager = ProphetModelManager()
        model = model_manager.train_model(processed_data)
        future_df = model_manager.generate_future_dataframe(168)
        predictions = model_manager.make_predictions(future_df)
        
        # Test visualization performance
        visualization = VisualizationModule()
        historical_data = model_manager.prepare_prophet_dataframe(processed_data)
        
        monitor.start_monitoring()
        chart = visualization.create_prediction_chart(historical_data, predictions)
        chart_creation_metrics = monitor.get_metrics()
        
        # Test chart saving performance
        output_dir = Path(temp_dir) / "viz_output"
        output_dir.mkdir(exist_ok=True)
        chart_path = output_dir / "perf_test_chart.png"
        
        monitor.start_monitoring()
        visualization.save_chart(chart, str(chart_path))
        chart_saving_metrics = monitor.get_metrics()
        
        visualization.close_figure(chart)
        
        # Performance assertions
        # Chart creation should be reasonably fast (< 10 seconds)
        assert chart_creation_metrics['execution_time'] < 10.0, \
            f"Chart creation too slow: {chart_creation_metrics['execution_time']:.2f}s"
        
        # Chart saving should be fast (< 3 seconds)
        assert chart_saving_metrics['execution_time'] < 3.0, \
            f"Chart saving too slow: {chart_saving_metrics['execution_time']:.2f}s"
        
        # Validate output
        assert chart_path.exists()
        assert chart_path.stat().st_size > 10000  # Should be substantial image file
        
        # Log performance metrics
        print(f"\nVisualization performance metrics:")
        print(f"  Chart creation: {chart_creation_metrics['execution_time']:.3f}s")
        print(f"  Chart saving: {chart_saving_metrics['execution_time']:.3f}s")
        print(f"  Chart creation memory: {chart_creation_metrics['peak_memory_increase_mb']:.1f}MB")
    
    def test_export_performance(self, temp_dir):
        """Test export performance with large prediction datasets."""
        monitor = PerformanceMonitor()
        
        # Generate large prediction dataset
        periods = 24 * 30  # 1 month of hourly predictions
        dates = pd.date_range('2024-01-01', periods=periods, freq='h')
        
        predictions = pd.DataFrame({
            'ds': dates,
            'yhat': np.random.uniform(50, 300, periods),
            'yhat_lower': np.random.uniform(20, 200, periods),
            'yhat_upper': np.random.uniform(100, 400, periods)
        })
        
        # Test export performance
        export_manager = ExportManager()
        output_dir = Path(temp_dir) / "export_output"
        output_dir.mkdir(exist_ok=True)
        json_path = output_dir / "perf_predictions.json"
        
        monitor.start_monitoring()
        success = export_manager.export_predictions(predictions, str(json_path))
        export_metrics = monitor.get_metrics()
        
        # Performance assertions
        assert success
        assert json_path.exists()
        
        # Export should be fast (< 2 seconds for 1 month of data)
        assert export_metrics['execution_time'] < 2.0, \
            f"Export too slow: {export_metrics['execution_time']:.2f}s"
        
        # Memory usage should be reasonable
        assert export_metrics['peak_memory_increase_mb'] < 50, \
            f"Export memory usage too high: {export_metrics['peak_memory_increase_mb']:.1f}MB"
        
        # Validate file size is reasonable
        file_size_mb = json_path.stat().st_size / 1024 / 1024
        assert file_size_mb < 10, f"Export file too large: {file_size_mb:.1f}MB"
        
        # Log performance metrics
        print(f"\nExport performance metrics:")
        print(f"  Export time: {export_metrics['execution_time']:.3f}s")
        print(f"  Export memory: {export_metrics['peak_memory_increase_mb']:.1f}MB")
        print(f"  File size: {file_size_mb:.2f}MB")
    
    def test_end_to_end_performance_large_dataset(self, temp_dir):
        """Test complete pipeline performance with large dataset."""
        monitor = PerformanceMonitor()
        
        # Generate large dataset (1 year)
        test_data = self.generate_large_dataset(365, add_complexity=True)
        input_file = Path(temp_dir) / "e2e_large_data.csv"
        self.create_test_csv(test_data, str(input_file))
        
        # Initialize all components
        data_processor = DataProcessor()
        model_manager = ProphetModelManager()
        visualization = VisualizationModule()
        export_manager = ExportManager()
        
        # Execute complete pipeline
        monitor.start_monitoring()
        
        # Data processing
        raw_data = data_processor.load_csv(str(input_file))
        processed_data = data_processor.preprocess_data(raw_data)
        processed_data = data_processor.handle_missing_values(processed_data)
        processed_data = data_processor.detect_outliers(processed_data)
        
        # Model training and prediction
        model = model_manager.train_model(processed_data)
        future_df = model_manager.generate_future_dataframe(168)  # 1 week
        predictions = model_manager.make_predictions(future_df)
        
        # Visualization
        output_dir = Path(temp_dir) / "e2e_output"
        output_dir.mkdir(exist_ok=True)
        
        historical_data = model_manager.prepare_prophet_dataframe(processed_data)
        chart = visualization.create_prediction_chart(historical_data, predictions)
        chart_path = output_dir / "e2e_chart.png"
        visualization.save_chart(chart, str(chart_path))
        visualization.close_figure(chart)
        
        # Export
        json_path = output_dir / "e2e_predictions.json"
        export_manager.export_predictions(predictions, str(json_path))
        
        e2e_metrics = monitor.get_metrics()
        
        # Performance assertions for complete pipeline
        total_records = len(test_data)
        
        # Complete pipeline should finish in reasonable time (< 2 minutes for 1 year)
        max_e2e_time = 120.0  # 2 minutes
        assert e2e_metrics['execution_time'] < max_e2e_time, \
            f"End-to-end pipeline too slow: {e2e_metrics['execution_time']:.2f}s for {total_records} records"
        
        # Memory usage should be reasonable (< 1GB for 1 year of data)
        assert e2e_metrics['peak_memory_increase_mb'] < 1024, \
            f"End-to-end memory usage too high: {e2e_metrics['peak_memory_increase_mb']:.1f}MB"
        
        # Validate all outputs were created
        assert chart_path.exists()
        assert json_path.exists()
        assert len(predictions) == 168
        
        # Log comprehensive performance metrics
        print(f"\nEnd-to-end performance metrics for 1 year ({total_records} records):")
        print(f"  Total execution time: {e2e_metrics['execution_time']:.3f}s")
        print(f"  Peak memory increase: {e2e_metrics['peak_memory_increase_mb']:.1f}MB")
        print(f"  Records per second: {total_records / e2e_metrics['execution_time']:.1f}")
        print(f"  Chart file size: {chart_path.stat().st_size / 1024:.1f}KB")
        print(f"  JSON file size: {json_path.stat().st_size / 1024:.1f}KB")


class TestMemoryOptimization:
    """Tests for memory usage optimization and leak detection."""
    
    def test_memory_cleanup_after_operations(self):
        """Test that memory is properly cleaned up after operations."""
        monitor = PerformanceMonitor()
        
        # Get baseline memory
        gc.collect()
        baseline_memory = monitor.process.memory_info().rss / 1024 / 1024
        
        # Perform multiple operations
        for i in range(5):
            # Generate data
            test_data = pd.DataFrame({
                'date': pd.date_range('2024-01-01', periods=1000, freq='H').strftime('%Y-%m-%d'),
                'hour': np.tile(range(24), 42)[:1000],
                'visitors': np.random.randint(50, 300, 1000),
                'festival_flag': np.random.choice([True, False], 1000),
                'weather': np.random.choice(['sunny', 'cloudy', 'rainy'], 1000)
            })
            
            # Process data
            data_processor = DataProcessor()
            processed_data = data_processor.preprocess_data(test_data)
            processed_data = data_processor.handle_missing_values(processed_data)
            processed_data = data_processor.detect_outliers(processed_data)
            
            # Train model
            model_manager = ProphetModelManager()
            model = model_manager.train_model(processed_data)
            
            # Generate predictions
            future_df = model_manager.generate_future_dataframe(24)
            predictions = model_manager.make_predictions(future_df)
            
            # Clean up explicitly
            del test_data, processed_data, model, future_df, predictions
            gc.collect()
        
        # Check final memory
        final_memory = monitor.process.memory_info().rss / 1024 / 1024
        memory_increase = final_memory - baseline_memory
        
        # Memory increase should be minimal (< 50MB after cleanup)
        assert memory_increase < 50, \
            f"Memory leak detected: {memory_increase:.1f}MB increase after operations"
        
        print(f"\nMemory cleanup test:")
        print(f"  Baseline memory: {baseline_memory:.1f}MB")
        print(f"  Final memory: {final_memory:.1f}MB")
        print(f"  Memory increase: {memory_increase:.1f}MB")


if __name__ == "__main__":
    # Run performance tests if executed directly
    pytest.main([__file__, "-v", "-s"])  # -s to show print statements