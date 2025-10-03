# Data processing module for temple crowd prediction system

import pandas as pd
import numpy as np
import logging
from typing import Optional, List
from pathlib import Path


class DataValidationError(Exception):
    """Custom exception for data validation errors"""
    pass


class DataProcessor:
    """Handles CSV loading, validation, and preprocessing for temple visitor data"""
    
    REQUIRED_COLUMNS = ['date', 'hour', 'visitors', 'festival_flag', 'weather']
    
    def __init__(self):
        """Initialize the DataProcessor with logging configuration"""
        self.logger = logging.getLogger(__name__)
        
    def load_csv(self, file_path: str) -> pd.DataFrame:
        """
        Load CSV file with proper error handling and column validation
        
        Args:
            file_path (str): Path to the CSV file
            
        Returns:
            pd.DataFrame: Loaded and validated DataFrame
            
        Raises:
            DataValidationError: If file cannot be loaded or required columns are missing
        """
        try:
            # Convert to Path object for better path handling
            path = Path(file_path)
            
            if not path.exists():
                raise DataValidationError(f"File not found: {file_path}")
                
            if not path.suffix.lower() == '.csv':
                raise DataValidationError(f"File must be a CSV file: {file_path}")
            
            # Load CSV with error handling
            try:
                df = pd.read_csv(file_path)
            except pd.errors.EmptyDataError:
                raise DataValidationError(f"CSV file is empty: {file_path}")
            except pd.errors.ParserError as e:
                raise DataValidationError(f"Error parsing CSV file: {e}")
            except Exception as e:
                raise DataValidationError(f"Unexpected error loading CSV: {e}")
            
            # Validate required columns
            missing_columns = [col for col in self.REQUIRED_COLUMNS if col not in df.columns]
            if missing_columns:
                raise DataValidationError(
                    f"Missing required columns: {missing_columns}. "
                    f"Required columns are: {self.REQUIRED_COLUMNS}"
                )
            
            # Log successful loading
            self.logger.info(f"Successfully loaded CSV with {len(df)} rows and {len(df.columns)} columns")
            self.logger.info(f"Columns found: {list(df.columns)}")
            
            return df
            
        except DataValidationError:
            # Re-raise validation errors as-is
            raise
        except Exception as e:
            # Wrap unexpected errors
            raise DataValidationError(f"Unexpected error in load_csv: {e}")
    
    def validate_data(self, df: pd.DataFrame) -> bool:
        """
        Validate data types and ranges for all required columns
        
        Args:
            df (pd.DataFrame): DataFrame to validate
            
        Returns:
            bool: True if validation passes
            
        Raises:
            DataValidationError: If validation fails
        """
        validation_errors = []
        
        # Validate hour column (must be integers 0-23)
        if 'hour' in df.columns:
            try:
                # Convert to numeric, errors='coerce' will set invalid values to NaN
                hour_numeric = pd.to_numeric(df['hour'], errors='coerce')
                
                # Check for NaN values (invalid conversions)
                if hour_numeric.isna().any():
                    invalid_hours = df.loc[hour_numeric.isna(), 'hour'].unique()
                    validation_errors.append(f"Invalid hour values found: {invalid_hours}")
                
                # Check range (0-23)
                valid_hours = hour_numeric.dropna()
                if not valid_hours.empty:
                    if (valid_hours < 0).any() or (valid_hours > 23).any():
                        invalid_range = valid_hours[(valid_hours < 0) | (valid_hours > 23)].unique()
                        validation_errors.append(f"Hour values outside 0-23 range: {invalid_range}")
                        
            except Exception as e:
                validation_errors.append(f"Error validating hour column: {e}")
        
        # Validate visitors column (must be non-negative numbers)
        if 'visitors' in df.columns:
            try:
                # Convert to numeric
                visitors_numeric = pd.to_numeric(df['visitors'], errors='coerce')
                
                # Check for NaN values
                if visitors_numeric.isna().any():
                    invalid_visitors = df.loc[visitors_numeric.isna(), 'visitors'].unique()
                    validation_errors.append(f"Invalid visitor count values: {invalid_visitors}")
                
                # Check for negative values
                valid_visitors = visitors_numeric.dropna()
                if not valid_visitors.empty and (valid_visitors < 0).any():
                    negative_count = (valid_visitors < 0).sum()
                    validation_errors.append(f"Found {negative_count} negative visitor count values")
                    
            except Exception as e:
                validation_errors.append(f"Error validating visitors column: {e}")
        
        # Validate festival_flag column (must be boolean-like)
        if 'festival_flag' in df.columns:
            try:
                # Check if values can be converted to boolean
                unique_values = df['festival_flag'].dropna().unique()
                valid_bool_values = {True, False, 1, 0, '1', '0', 'true', 'false', 'True', 'False', 'yes', 'no', 'Yes', 'No'}
                
                invalid_bool_values = [val for val in unique_values if val not in valid_bool_values]
                if invalid_bool_values:
                    validation_errors.append(f"Invalid festival_flag values: {invalid_bool_values}")
                    
            except Exception as e:
                validation_errors.append(f"Error validating festival_flag column: {e}")
        
        # Validate weather column (must be string)
        if 'weather' in df.columns:
            try:
                # Check for empty strings or whitespace-only values
                weather_series = df['weather'].astype(str)
                empty_weather = weather_series.str.strip().eq('').sum()
                if empty_weather > 0:
                    validation_errors.append(f"Found {empty_weather} empty weather values")
                    
            except Exception as e:
                validation_errors.append(f"Error validating weather column: {e}")
        
        # If there are validation errors, raise exception
        if validation_errors:
            error_message = "Data validation failed:\n" + "\n".join(f"- {error}" for error in validation_errors)
            raise DataValidationError(error_message)
        
        self.logger.info("Data validation passed successfully")
        return True
    
    def preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocess data including datetime parsing and type conversions
        
        Args:
            df (pd.DataFrame): Raw DataFrame to preprocess
            
        Returns:
            pd.DataFrame: Preprocessed DataFrame
            
        Raises:
            DataValidationError: If preprocessing fails
        """
        try:
            # Create a copy to avoid modifying original
            processed_df = df.copy()
            
            # Parse datetime with multiple format attempts
            processed_df = self._parse_datetime(processed_df)
            
            # Convert hour to integer
            processed_df['hour'] = pd.to_numeric(processed_df['hour'], errors='coerce').astype('Int64')
            
            # Convert visitors to integer, handle negatives by setting to 0
            visitors_numeric = pd.to_numeric(processed_df['visitors'], errors='coerce')
            processed_df['visitors'] = visitors_numeric.clip(lower=0).astype('Int64')
            
            # Convert festival_flag to boolean
            processed_df['festival_flag'] = self._convert_to_boolean(processed_df['festival_flag'])
            
            # Clean weather column
            processed_df['weather'] = processed_df['weather'].astype(str).str.strip().str.lower()
            
            self.logger.info("Data preprocessing completed successfully")
            return processed_df
            
        except Exception as e:
            raise DataValidationError(f"Error during data preprocessing: {e}")
    
    def _parse_datetime(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Parse datetime column with multiple format attempts
        
        Args:
            df (pd.DataFrame): DataFrame with date column
            
        Returns:
            pd.DataFrame: DataFrame with parsed datetime
        """
        # Common date formats to try
        date_formats = [
            '%Y-%m-%d',
            '%m/%d/%Y',
            '%d/%m/%Y',
            '%Y/%m/%d',
            '%m-%d-%Y',
            '%d-%m-%Y',
            '%Y%m%d'
        ]
        
        parsed_dates = None
        successful_format = None
        
        for date_format in date_formats:
            try:
                parsed_dates = pd.to_datetime(df['date'], format=date_format, errors='coerce')
                if not parsed_dates.isna().all():
                    successful_format = date_format
                    break
            except Exception:
                continue
        
        # If no format worked, try pandas' automatic parsing
        if parsed_dates is None or parsed_dates.isna().all():
            try:
                parsed_dates = pd.to_datetime(df['date'], errors='coerce')
                successful_format = 'automatic'
            except Exception:
                pass
        
        # Check if parsing was successful
        if parsed_dates is None or parsed_dates.isna().all():
            raise DataValidationError("Unable to parse date column with any known format")
        
        # Check for any unparseable dates
        unparseable_count = parsed_dates.isna().sum()
        if unparseable_count > 0:
            self.logger.warning(f"Found {unparseable_count} unparseable dates")
        
        df = df.copy()
        df['date'] = parsed_dates
        
        self.logger.info(f"Successfully parsed dates using format: {successful_format}")
        return df
    
    def _convert_to_boolean(self, series: pd.Series) -> pd.Series:
        """
        Convert series to boolean values
        
        Args:
            series (pd.Series): Series to convert
            
        Returns:
            pd.Series: Boolean series
        """
        # Create mapping for common boolean representations
        bool_mapping = {
            '1': True, '0': False,
            'true': True, 'false': False,
            'True': True, 'False': False,
            'yes': True, 'no': False,
            'Yes': True, 'No': False,
            1: True, 0: False,
            True: True, False: False
        }
        
        # Convert to string first, then map
        string_series = series.astype(str).str.strip()
        boolean_series = string_series.map(bool_mapping)
        
        # Fill any unmapped values with False and log warning
        unmapped_count = boolean_series.isna().sum()
        if unmapped_count > 0:
            self.logger.warning(f"Found {unmapped_count} unmappable boolean values, setting to False")
            boolean_series = boolean_series.fillna(False)
        
        return boolean_series
    
    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Handle missing values with appropriate imputation strategies
        
        Args:
            df (pd.DataFrame): DataFrame with potential missing values
            
        Returns:
            pd.DataFrame: DataFrame with missing values handled
        """
        processed_df = df.copy()
        missing_summary = []
        
        # Handle missing dates - forward fill or drop if too many
        if processed_df['date'].isna().any():
            missing_dates = processed_df['date'].isna().sum()
            missing_summary.append(f"Missing dates: {missing_dates}")
            
            if missing_dates / len(processed_df) > 0.1:  # More than 10% missing
                self.logger.warning(f"High percentage of missing dates ({missing_dates/len(processed_df)*100:.1f}%)")
                # Drop rows with missing dates as they're critical
                processed_df = processed_df.dropna(subset=['date'])
            else:
                # Forward fill missing dates
                processed_df['date'] = processed_df['date'].fillna(method='ffill')
        
        # Handle missing hours - use mode (most common hour)
        if processed_df['hour'].isna().any():
            missing_hours = processed_df['hour'].isna().sum()
            missing_summary.append(f"Missing hours: {missing_hours}")
            
            hour_mode = processed_df['hour'].mode()
            if not hour_mode.empty:
                fill_value = hour_mode.iloc[0]
                processed_df['hour'] = processed_df['hour'].fillna(fill_value)
                self.logger.info(f"Filled {missing_hours} missing hours with mode value: {fill_value}")
            else:
                # If no mode available, use 12 (noon) as default
                processed_df['hour'] = processed_df['hour'].fillna(12)
                self.logger.info(f"Filled {missing_hours} missing hours with default value: 12")
        
        # Handle missing visitors - use interpolation or median
        if processed_df['visitors'].isna().any():
            missing_visitors = processed_df['visitors'].isna().sum()
            missing_summary.append(f"Missing visitors: {missing_visitors}")
            
            # Try time-based interpolation first
            if 'date' in processed_df.columns and not processed_df['date'].isna().all():
                # Sort by date and hour for proper interpolation
                processed_df = processed_df.sort_values(['date', 'hour'])
                processed_df['visitors'] = processed_df['visitors'].interpolate(method='time')
            
            # Fill any remaining missing values with median
            if processed_df['visitors'].isna().any():
                median_visitors = processed_df['visitors'].median()
                processed_df['visitors'] = processed_df['visitors'].fillna(median_visitors)
                self.logger.info(f"Filled remaining missing visitors with median: {median_visitors}")
        
        # Handle missing festival_flag - assume False (no festival)
        if processed_df['festival_flag'].isna().any():
            missing_festivals = processed_df['festival_flag'].isna().sum()
            missing_summary.append(f"Missing festival_flag: {missing_festivals}")
            
            processed_df['festival_flag'] = processed_df['festival_flag'].fillna(False)
            self.logger.info(f"Filled {missing_festivals} missing festival_flag values with False")
        
        # Handle missing weather - use mode or 'unknown'
        if processed_df['weather'].isna().any() or (processed_df['weather'] == '').any():
            # Count both NaN and empty strings as missing
            missing_weather = processed_df['weather'].isna().sum() + (processed_df['weather'] == '').sum()
            missing_summary.append(f"Missing weather: {missing_weather}")
            
            weather_mode = processed_df['weather'].mode()
            if not weather_mode.empty and weather_mode.iloc[0] != '':
                fill_value = weather_mode.iloc[0]
                processed_df['weather'] = processed_df['weather'].fillna(fill_value)
                processed_df['weather'] = processed_df['weather'].replace('', fill_value)
                self.logger.info(f"Filled missing weather with mode value: {fill_value}")
            else:
                # Use 'unknown' as default
                processed_df['weather'] = processed_df['weather'].fillna('unknown')
                processed_df['weather'] = processed_df['weather'].replace('', 'unknown')
                self.logger.info(f"Filled missing weather with default value: unknown")
        
        # Log summary of missing value handling
        if missing_summary:
            self.logger.info("Missing value handling summary:")
            for summary in missing_summary:
                self.logger.info(f"  - {summary}")
        else:
            self.logger.info("No missing values found")
        
        return processed_df
    
    def detect_outliers(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Detect and handle outliers in visitor count data
        
        Args:
            df (pd.DataFrame): DataFrame to analyze for outliers
            
        Returns:
            pd.DataFrame: DataFrame with outliers handled
        """
        processed_df = df.copy()
        
        if 'visitors' not in processed_df.columns:
            self.logger.warning("No 'visitors' column found for outlier detection")
            return processed_df
        
        # Calculate outlier thresholds using IQR method
        Q1 = processed_df['visitors'].quantile(0.25)
        Q3 = processed_df['visitors'].quantile(0.75)
        IQR = Q3 - Q1
        
        # Define outlier bounds (1.5 * IQR is standard, but we'll be more conservative)
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        # Identify outliers
        outliers_mask = (processed_df['visitors'] < lower_bound) | (processed_df['visitors'] > upper_bound)
        outlier_count = outliers_mask.sum()
        
        if outlier_count > 0:
            outlier_values = processed_df.loc[outliers_mask, 'visitors'].values
            self.logger.warning(f"Detected {outlier_count} outliers in visitor data")
            self.logger.warning(f"Outlier range: {outlier_values.min()} to {outlier_values.max()}")
            self.logger.warning(f"Normal range: {lower_bound:.0f} to {upper_bound:.0f}")
            
            # Handle outliers based on severity
            extreme_outliers_mask = (processed_df['visitors'] < Q1 - 3 * IQR) | (processed_df['visitors'] > Q3 + 3 * IQR)
            extreme_outlier_count = extreme_outliers_mask.sum()
            
            if extreme_outlier_count > 0:
                # Cap extreme outliers to the bounds (ensure non-negative visitor counts)
                safe_lower_bound = max(0, lower_bound)  # Ensure non-negative
                processed_df.loc[processed_df['visitors'] < Q1 - 3 * IQR, 'visitors'] = safe_lower_bound
                processed_df.loc[processed_df['visitors'] > Q3 + 3 * IQR, 'visitors'] = upper_bound
                self.logger.info(f"Capped {extreme_outlier_count} extreme outliers to bounds")
            
            # Log outlier statistics for review
            self._log_outlier_statistics(processed_df, outliers_mask, Q1, Q3, IQR)
        else:
            self.logger.info("No outliers detected in visitor data")
        
        return processed_df
    
    def _log_outlier_statistics(self, df: pd.DataFrame, outliers_mask: pd.Series, Q1: float, Q3: float, IQR: float):
        """
        Log detailed statistics about detected outliers
        
        Args:
            df (pd.DataFrame): DataFrame being analyzed
            outliers_mask (pd.Series): Boolean mask of outlier locations
            Q1 (float): First quartile
            Q3 (float): Third quartile
            IQR (float): Interquartile range
        """
        outlier_data = df.loc[outliers_mask]
        
        # Basic statistics
        self.logger.info("Outlier Statistics:")
        self.logger.info(f"  - Total outliers: {len(outlier_data)}")
        self.logger.info(f"  - Percentage of data: {len(outlier_data)/len(df)*100:.2f}%")
        self.logger.info(f"  - Q1: {Q1:.0f}, Q3: {Q3:.0f}, IQR: {IQR:.0f}")
        
        # Outlier value distribution
        if len(outlier_data) > 0:
            self.logger.info(f"  - Min outlier: {outlier_data['visitors'].min()}")
            self.logger.info(f"  - Max outlier: {outlier_data['visitors'].max()}")
            self.logger.info(f"  - Mean outlier: {outlier_data['visitors'].mean():.0f}")
        
        # Check if outliers correlate with festivals
        if 'festival_flag' in df.columns:
            festival_outliers = outlier_data['festival_flag'].sum()
            total_festivals = df['festival_flag'].sum()
            if total_festivals > 0:
                festival_outlier_rate = festival_outliers / total_festivals * 100
                self.logger.info(f"  - Festival days with outliers: {festival_outliers}/{total_festivals} ({festival_outlier_rate:.1f}%)")
        
        # Check outlier distribution by hour
        if 'hour' in df.columns and len(outlier_data) > 0:
            outlier_hours = outlier_data['hour'].value_counts().head(3)
            self.logger.info(f"  - Most common outlier hours: {dict(outlier_hours)}")