#!/usr/bin/env python3
"""
Temple Crowd Prediction System
Main entry point for the application

This script orchestrates the entire prediction pipeline:
1. Load and validate CSV data
2. Train Prophet model with external regressors
3. Generate predictions with confidence intervals
4. Create visualizations and export results
"""

import argparse
import logging
import sys
from pathlib import Path
import pandas as pd
import yaml
from typing import Dict, Any, Optional

# Add src directory to Python path
sys.path.append(str(Path(__file__).parent / "src"))

from data_processor import DataProcessor, DataValidationError
from prophet_model_manager import ProphetModelManager
from visualization_module import VisualizationModule
from export_manager import ExportManager, ExportError

def setup_logging(log_level: str = "INFO") -> None:
    """Configure logging for the application."""
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('temple_crowd_prediction.log')
        ]
    )

def load_configuration(config_path: str = "config.yaml") -> Dict[str, Any]:
    """
    Load configuration from YAML file with validation and defaults.
    
    Args:
        config_path: Path to configuration file
        
    Returns:
        Dictionary with configuration parameters
    """
    logger = logging.getLogger(__name__)
    
    # Default configuration
    default_config = {
        'prophet': {
            'seasonality_mode': 'multiplicative',
            'daily_seasonality': True,
            'weekly_seasonality': True,
            'yearly_seasonality': True,
            'changepoint_prior_scale': 0.05,
            'seasonality_prior_scale': 10.0
        },
        'data_processing': {
            'min_data_points': 720,
            'outlier_threshold': 3.0,
            'missing_value_strategy': 'interpolate'
        },
        'visualization': {
            'figure_size': [15, 8],
            'dpi': 300,
            'chart_style': 'seaborn-v0_8',
            'confidence_interval_alpha': 0.3
        },
        'export': {
            'json_indent': 2,
            'datetime_format': '%Y-%m-%d %H:%M:%S',
            'include_confidence_intervals': True
        },
        'logging': {
            'level': 'INFO',
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            'file': 'temple_crowd_prediction.log'
        }
    }
    
    try:
        config_file = Path(config_path)
        if config_file.exists():
            logger.info(f"Loading configuration from: {config_path}")
            with open(config_file, 'r', encoding='utf-8') as f:
                file_config = yaml.safe_load(f)
            
            # Merge with defaults (file config takes precedence)
            config = _merge_configs(default_config, file_config)
            logger.info("Configuration loaded successfully")
        else:
            logger.info(f"Configuration file not found: {config_path}, using defaults")
            config = default_config
            
        # Validate configuration
        _validate_configuration(config)
        return config
        
    except yaml.YAMLError as e:
        logger.error(f"Error parsing configuration file: {str(e)}")
        logger.info("Using default configuration")
        return default_config
    except Exception as e:
        logger.error(f"Error loading configuration: {str(e)}")
        logger.info("Using default configuration")
        return default_config

def _merge_configs(default: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
    """
    Recursively merge configuration dictionaries.
    
    Args:
        default: Default configuration
        override: Override configuration
        
    Returns:
        Merged configuration dictionary
    """
    result = default.copy()
    
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = _merge_configs(result[key], value)
        else:
            result[key] = value
    
    return result

def _validate_configuration(config: Dict[str, Any]) -> None:
    """
    Validate configuration parameters.
    
    Args:
        config: Configuration dictionary to validate
        
    Raises:
        ValueError: If configuration is invalid
    """
    logger = logging.getLogger(__name__)
    
    # Validate Prophet configuration
    prophet_config = config.get('prophet', {})
    if prophet_config.get('seasonality_mode') not in ['additive', 'multiplicative']:
        logger.warning("Invalid seasonality_mode, using 'multiplicative'")
        prophet_config['seasonality_mode'] = 'multiplicative'
    
    # Validate data processing configuration
    data_config = config.get('data_processing', {})
    if data_config.get('min_data_points', 0) < 24:
        logger.warning("min_data_points too low, setting to 24")
        data_config['min_data_points'] = 24
    
    if data_config.get('outlier_threshold', 0) <= 0:
        logger.warning("Invalid outlier_threshold, setting to 3.0")
        data_config['outlier_threshold'] = 3.0
    
    # Validate visualization configuration
    viz_config = config.get('visualization', {})
    figure_size = viz_config.get('figure_size', [15, 8])
    if not isinstance(figure_size, list) or len(figure_size) != 2:
        logger.warning("Invalid figure_size, using [15, 8]")
        viz_config['figure_size'] = [15, 8]
    
    logger.info("Configuration validation completed")

def parse_arguments() -> argparse.Namespace:
    """Parse command line arguments with configuration support."""
    parser = argparse.ArgumentParser(
        description="Temple Crowd Prediction System using Facebook Prophet"
    )
    
    parser.add_argument(
        "--input-file",
        type=str,
        required=True,
        help="Path to input CSV file with historical visitor data"
    )
    
    parser.add_argument(
        "--output-dir",
        type=str,
        default="output",
        help="Directory for output files (default: output)"
    )
    
    parser.add_argument(
        "--prediction-days",
        type=int,
        default=30,
        help="Number of days to predict into the future (default: 30)"
    )
    
    parser.add_argument(
        "--config-file",
        type=str,
        default="config.yaml",
        help="Path to configuration file (default: config.yaml)"
    )
    
    parser.add_argument(
        "--log-level",
        type=str,
        default=None,
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging level (overrides config file)"
    )
    
    parser.add_argument(
        "--chart-output",
        type=str,
        default=None,
        help="Custom path for chart output (overrides default)"
    )
    
    parser.add_argument(
        "--json-output",
        type=str,
        default=None,
        help="Custom path for JSON output (overrides default)"
    )
    
    return parser.parse_args()

def run_prediction_pipeline(input_file: str, output_dir: str, prediction_days: int, 
                          config: Dict[str, Any], chart_output: Optional[str] = None, 
                          json_output: Optional[str] = None) -> bool:
    """
    Execute the complete prediction pipeline with comprehensive error handling.
    
    Args:
        input_file: Path to input CSV file
        output_dir: Directory for output files
        prediction_days: Number of days to predict
        config: Configuration dictionary
        chart_output: Optional custom chart output path
        json_output: Optional custom JSON output path
        
    Returns:
        True if pipeline completed successfully, False otherwise
    """
    logger = logging.getLogger(__name__)
    partial_results = {}
    
    try:
        # Initialize components with configuration
        logger.info("Initializing pipeline components with configuration...")
        try:
            data_processor = DataProcessor()
            
            # Initialize Prophet model manager with configuration
            prophet_config = config.get('prophet', {})
            model_manager = ProphetModelManager(
                seasonality_mode=prophet_config.get('seasonality_mode', 'multiplicative')
            )
            
            # Update model parameters from configuration
            model_manager.model_params.update({
                'changepoint_prior_scale': prophet_config.get('changepoint_prior_scale', 0.05),
                'seasonality_prior_scale': prophet_config.get('seasonality_prior_scale', 10.0),
                'daily_seasonality': prophet_config.get('daily_seasonality', True),
                'weekly_seasonality': prophet_config.get('weekly_seasonality', True),
                'yearly_seasonality': prophet_config.get('yearly_seasonality', True)
            })
            
            visualization = VisualizationModule()
            
            # Update visualization configuration
            viz_config = config.get('visualization', {})
            if 'figure_size' in viz_config:
                visualization.figure_size = tuple(viz_config['figure_size'])
            if 'dpi' in viz_config:
                visualization.dpi = viz_config['dpi']
            
            export_manager = ExportManager()
            logger.info("All components initialized successfully with configuration")
        except Exception as e:
            logger.error(f"Failed to initialize components: {str(e)}")
            return False
        
        # Step 1: Load and process data with detailed error handling
        logger.info("Step 1: Loading and processing data...")
        try:
            # Load CSV data
            logger.info(f"Loading data from: {input_file}")
            raw_data = data_processor.load_csv(input_file)
            logger.info(f"Successfully loaded {len(raw_data)} records")
            partial_results['data_loaded'] = True
            
            # Validate data
            logger.info("Validating data format and content...")
            data_processor.validate_data(raw_data)
            logger.info("Data validation passed")
            partial_results['data_validated'] = True
            
            # Preprocess data
            logger.info("Preprocessing data...")
            processed_data = data_processor.preprocess_data(raw_data)
            logger.info("Data preprocessing completed")
            
            # Handle missing values
            logger.info("Handling missing values...")
            processed_data = data_processor.handle_missing_values(processed_data)
            logger.info("Missing value handling completed")
            
            # Detect and handle outliers
            logger.info("Detecting and handling outliers...")
            processed_data = data_processor.detect_outliers(processed_data)
            logger.info("Outlier detection completed")
            
            logger.info(f"Data processing complete. Final records: {len(processed_data)}")
            partial_results['data_processed'] = True
            
        except DataValidationError as e:
            logger.error(f"Data validation failed: {str(e)}")
            logger.error("Please check your input file format and content")
            return False
        except FileNotFoundError:
            logger.error(f"Input file not found: {input_file}")
            logger.error("Please verify the file path and try again")
            return False
        except PermissionError:
            logger.error(f"Permission denied accessing file: {input_file}")
            logger.error("Please check file permissions")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during data processing: {str(e)}")
            logger.error("Data processing failed, cannot continue")
            return False
        
        # Step 2: Train Prophet model with error handling
        logger.info("Step 2: Training Prophet model...")
        try:
            # Check data sufficiency
            if len(processed_data) < 30:
                logger.warning(f"Limited data available ({len(processed_data)} records). Results may be less accurate.")
            
            logger.info("Starting model training...")
            model = model_manager.train_model(processed_data)
            logger.info("Model training completed successfully")
            partial_results['model_trained'] = True
            
        except ValueError as e:
            logger.error(f"Model training failed due to data issues: {str(e)}")
            logger.error("Please check your data quality and try again")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during model training: {str(e)}")
            logger.error("Model training failed, cannot generate predictions")
            return False
        
        # Step 3: Generate predictions with error handling
        logger.info("Step 3: Generating predictions...")
        try:
            prediction_periods = prediction_days * 24  # Convert days to hours
            logger.info(f"Generating predictions for {prediction_periods} hours ({prediction_days} days)")
            
            future_df = model_manager.generate_future_dataframe(prediction_periods)
            logger.info(f"Created future dataframe with {len(future_df)} periods")
            
            predictions = model_manager.make_predictions(future_df)
            logger.info(f"Generated {len(predictions)} predictions successfully")
            partial_results['predictions_generated'] = True
            
        except Exception as e:
            logger.error(f"Prediction generation failed: {str(e)}")
            logger.error("Cannot generate predictions, but model training was successful")
            # Continue with partial results if possible
            if 'model_trained' in partial_results:
                logger.info("Attempting to save model information...")
                # Could save model info here if needed
            return False
        
        # Step 4: Create visualizations with error handling
        logger.info("Step 4: Creating visualizations...")
        chart_created = False
        try:
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
            logger.info(f"Output directory created/verified: {output_path}")
            
            # Prepare data for visualization
            historical_data = model_manager.prepare_prophet_dataframe(processed_data)
            logger.info("Historical data prepared for visualization")
            
            # Create prediction chart
            chart = visualization.create_prediction_chart(historical_data, predictions)
            
            # Use custom chart output path if provided
            if chart_output:
                chart_path = Path(chart_output)
                chart_path.parent.mkdir(parents=True, exist_ok=True)
            else:
                chart_path = output_path / "prediction_chart.png"
            
            visualization.save_chart(chart, str(chart_path))
            visualization.close_figure(chart)
            
            logger.info(f"Prediction chart saved to: {chart_path}")
            partial_results['chart_created'] = True
            chart_created = True
            
        except PermissionError:
            logger.error(f"Permission denied creating output directory: {output_dir}")
            logger.warning("Visualization skipped due to permission issues")
        except Exception as e:
            logger.error(f"Visualization creation failed: {str(e)}")
            logger.warning("Continuing without visualization...")
        
        # Step 5: Export predictions to JSON with error handling
        logger.info("Step 5: Exporting predictions...")
        export_success = False
        try:
            # Use custom JSON output path if provided
            if json_output:
                json_path = Path(json_output)
                json_path.parent.mkdir(parents=True, exist_ok=True)
            else:
                json_path = output_path / "predictions.json"
            
            success = export_manager.export_predictions(predictions, str(json_path))
            
            if success:
                logger.info(f"Predictions exported to: {json_path}")
                partial_results['predictions_exported'] = True
                export_success = True
            else:
                logger.error("Export validation failed")
                
        except ExportError as e:
            logger.error(f"Export failed: {str(e)}")
            logger.warning("Predictions generated but export failed")
        except Exception as e:
            logger.error(f"Unexpected error during export: {str(e)}")
            logger.warning("Predictions generated but export failed")
        
        # Final status report
        logger.info("Pipeline execution summary:")
        logger.info(f"  - Data loaded: {'✓' if partial_results.get('data_loaded') else '✗'}")
        logger.info(f"  - Data validated: {'✓' if partial_results.get('data_validated') else '✗'}")
        logger.info(f"  - Data processed: {'✓' if partial_results.get('data_processed') else '✗'}")
        logger.info(f"  - Model trained: {'✓' if partial_results.get('model_trained') else '✗'}")
        logger.info(f"  - Predictions generated: {'✓' if partial_results.get('predictions_generated') else '✗'}")
        logger.info(f"  - Chart created: {'✓' if partial_results.get('chart_created') else '✗'}")
        logger.info(f"  - Predictions exported: {'✓' if partial_results.get('predictions_exported') else '✗'}")
        
        # Determine overall success
        core_success = all([
            partial_results.get('data_processed'),
            partial_results.get('model_trained'),
            partial_results.get('predictions_generated')
        ])
        
        if core_success:
            logger.info("Core prediction pipeline completed successfully!")
            if chart_created and export_success:
                logger.info("All outputs generated successfully")
                logger.info(f"Results saved to: {output_dir}")
            else:
                logger.warning("Core predictions completed but some outputs failed")
            return True
        else:
            logger.error("Core prediction pipeline failed")
            return False
            
    except Exception as e:
        logger.error(f"Critical error in prediction pipeline: {str(e)}")
        logger.error("Pipeline execution terminated")
        
        # Log partial results for debugging
        if partial_results:
            logger.info("Partial results achieved:")
            for step, success in partial_results.items():
                logger.info(f"  - {step}: {'✓' if success else '✗'}")
        
        return False

def main() -> None:
    """Main application entry point with configuration management."""
    args = parse_arguments()
    
    try:
        # Load configuration
        config = load_configuration(args.config_file)
        
        # Override log level from command line if provided
        log_level = args.log_level or config.get('logging', {}).get('level', 'INFO')
        setup_logging(log_level)
        
        logger = logging.getLogger(__name__)
        logger.info("Starting Temple Crowd Prediction System")
        logger.info(f"Configuration loaded from: {args.config_file}")
        
        # Validate command line arguments
        if args.prediction_days <= 0:
            logger.error("Prediction days must be positive")
            sys.exit(1)
        
        if args.prediction_days > 365:
            logger.warning(f"Prediction period is very long ({args.prediction_days} days)")
            logger.warning("This may result in less accurate predictions")
        
        # Validate input file exists
        if not Path(args.input_file).exists():
            logger.error(f"Input file not found: {args.input_file}")
            sys.exit(1)
        
        # Run the prediction pipeline with configuration
        success = run_prediction_pipeline(
            input_file=args.input_file,
            output_dir=args.output_dir,
            prediction_days=args.prediction_days,
            config=config,
            chart_output=args.chart_output,
            json_output=args.json_output
        )
        
        if success:
            logger.info("Application completed successfully")
            sys.exit(0)
        else:
            logger.error("Application failed")
            sys.exit(1)
        
    except KeyboardInterrupt:
        logger.info("Application interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Application failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()