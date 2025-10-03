# Export management module for temple crowd prediction system

import json
import pandas as pd
import logging
from typing import Dict, Any, Optional
from pathlib import Path
from datetime import datetime


class ExportError(Exception):
    """Custom exception for export-related errors"""
    pass


class ExportManager:
    """Handles JSON export of prediction data with proper formatting and validation"""
    
    def __init__(self):
        """Initialize the ExportManager"""
        self.logger = logging.getLogger(__name__)
    
    def format_predictions_json(self, predictions: pd.DataFrame) -> Dict[str, Any]:
        """
        Format prediction DataFrame into JSON-compatible dictionary structure.
        
        Args:
            predictions: DataFrame with Prophet predictions containing columns:
                        - ds (datetime): timestamps
                        - yhat (float): predicted values
                        - yhat_lower (float): lower confidence bound
                        - yhat_upper (float): upper confidence bound
        
        Returns:
            Dictionary with structured prediction data for JSON export
            
        Raises:
            ExportError: If required columns are missing or data formatting fails
        """
        try:
            # Validate required columns
            required_cols = ['ds', 'yhat', 'yhat_lower', 'yhat_upper']
            missing_cols = [col for col in required_cols if col not in predictions.columns]
            if missing_cols:
                raise ExportError(f"Missing required columns in predictions: {missing_cols}")
            
            # Create the JSON structure
            json_data = {
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "model_type": "Facebook Prophet",
                    "total_predictions": len(predictions),
                    "prediction_period": {
                        "start": predictions['ds'].min().isoformat(),
                        "end": predictions['ds'].max().isoformat()
                    }
                },
                "predictions": []
            }
            
            # Format each prediction record
            for _, row in predictions.iterrows():
                prediction_record = {
                    "timestamp": row['ds'].isoformat(),
                    "predicted_visitors": round(float(row['yhat']), 2),
                    "confidence_interval": {
                        "lower_bound": round(float(row['yhat_lower']), 2),
                        "upper_bound": round(float(row['yhat_upper']), 2)
                    }
                }
                
                # Include actual values if available (for historical data)
                if 'y' in predictions.columns and pd.notna(row['y']):
                    prediction_record["actual_visitors"] = int(row['y'])
                
                json_data["predictions"].append(prediction_record)
            
            self.logger.info(f"Formatted {len(predictions)} predictions for JSON export")
            return json_data
            
        except Exception as e:
            error_msg = f"Failed to format predictions for JSON: {str(e)}"
            self.logger.error(error_msg)
            raise ExportError(error_msg) from e  
  
    def save_json(self, data: Dict[str, Any], output_path: str) -> None:
        """
        Save dictionary data to JSON file with proper error handling.
        
        Args:
            data: Dictionary containing the data to save
            output_path: Path where the JSON file should be saved
            
        Raises:
            ExportError: If file operations fail or path is invalid
        """
        try:
            # Convert string path to Path object for better handling
            file_path = Path(output_path)
            
            # Create parent directories if they don't exist
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write JSON data to file
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            self.logger.info(f"Successfully saved JSON data to {file_path}")
            
        except PermissionError as e:
            error_msg = f"Permission denied when writing to {output_path}: {str(e)}"
            self.logger.error(error_msg)
            raise ExportError(error_msg) from e
        except OSError as e:
            error_msg = f"File system error when writing to {output_path}: {str(e)}"
            self.logger.error(error_msg)
            raise ExportError(error_msg) from e
        except Exception as e:
            error_msg = f"Unexpected error saving JSON to {output_path}: {str(e)}"
            self.logger.error(error_msg)
            raise ExportError(error_msg) from e
    
    def validate_json_output(self, file_path: str) -> bool:
        """
        Validate that the JSON file exists, is accessible, and contains valid JSON.
        
        Args:
            file_path: Path to the JSON file to validate
            
        Returns:
            True if file is valid and accessible, False otherwise
        """
        try:
            path = Path(file_path)
            
            # Check if file exists
            if not path.exists():
                self.logger.warning(f"JSON file does not exist: {file_path}")
                return False
            
            # Check if file is readable
            if not path.is_file():
                self.logger.warning(f"Path is not a file: {file_path}")
                return False
            
            # Try to read and parse the JSON
            with open(path, 'r', encoding='utf-8') as f:
                json.load(f)
            
            # Check file size (should not be empty)
            if path.stat().st_size == 0:
                self.logger.warning(f"JSON file is empty: {file_path}")
                return False
            
            self.logger.info(f"JSON file validation successful: {file_path}")
            return True
            
        except json.JSONDecodeError as e:
            self.logger.error(f"Invalid JSON format in {file_path}: {str(e)}")
            return False
        except PermissionError as e:
            self.logger.error(f"Permission denied reading {file_path}: {str(e)}")
            return False
        except Exception as e:
            self.logger.error(f"Error validating JSON file {file_path}: {str(e)}")
            return False
    
    def export_predictions(self, predictions: pd.DataFrame, output_path: str = "data/predictions.json") -> bool:
        """
        Complete export workflow: format, save, and validate prediction data.
        
        Args:
            predictions: DataFrame with Prophet predictions
            output_path: Path where JSON should be saved (default: data/predictions.json)
            
        Returns:
            True if export was successful, False otherwise
        """
        try:
            # Format the predictions
            json_data = self.format_predictions_json(predictions)
            
            # Save to file
            self.save_json(json_data, output_path)
            
            # Validate the output
            if self.validate_json_output(output_path):
                self.logger.info(f"Prediction export completed successfully to {output_path}")
                return True
            else:
                self.logger.error(f"Export validation failed for {output_path}")
                return False
                
        except ExportError as e:
            self.logger.error(f"Export failed: {str(e)}")
            return False
        except Exception as e:
            self.logger.error(f"Unexpected error during export: {str(e)}")
            return False