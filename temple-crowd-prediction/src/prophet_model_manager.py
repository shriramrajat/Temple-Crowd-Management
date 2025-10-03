# Prophet model management module for temple crowd prediction system

import pandas as pd
import numpy as np
from prophet import Prophet
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class ProphetModelManager:
    """
    Manages Prophet model configuration, training, and prediction for temple crowd forecasting.
    
    This class handles the setup of Prophet models with appropriate seasonality settings,
    external regressors, and changepoint detection parameters optimized for visitor count prediction.
    """
    
    def __init__(self, seasonality_mode: str = 'multiplicative'):
        """
        Initialize the ProphetModelManager with configuration settings.
        
        Args:
            seasonality_mode: Either 'additive' or 'multiplicative'. 
                            Multiplicative is better for visitor patterns that scale with volume.
        """
        self.seasonality_mode = seasonality_mode
        self.model = None
        self.regressors = []
        
        # Configure model parameters optimized for visitor count prediction
        self.model_params = {
            'seasonality_mode': seasonality_mode,
            'daily_seasonality': True,
            'weekly_seasonality': True,
            'yearly_seasonality': True,
            'changepoint_prior_scale': 0.05,  # Controls flexibility of trend changes
            'seasonality_prior_scale': 10.0,  # Controls flexibility of seasonality
            'holidays_prior_scale': 10.0,     # Controls flexibility of holiday effects
            'changepoint_range': 0.8,         # Proportion of history for changepoint detection
            'n_changepoints': 25,             # Number of potential changepoints
            'interval_width': 0.80,           # Width of uncertainty intervals
        }
        
        logger.info(f"ProphetModelManager initialized with {seasonality_mode} seasonality")
    
    def _create_model(self) -> Prophet:
        """
        Create a new Prophet model with configured parameters.
        
        Returns:
            Prophet: Configured Prophet model instance
        """
        model = Prophet(**self.model_params)
        
        # Add any previously configured regressors
        for regressor in self.regressors:
            model.add_regressor(
                regressor['name'],
                prior_scale=regressor.get('prior_scale', 10.0),
                standardize=regressor.get('standardize', True)
            )
        
        logger.info(f"Created Prophet model with {len(self.regressors)} regressors")
        return model   
 
    def add_regressor(self, name: str, prior_scale: float = 10.0, standardize: bool = True) -> None:
        """
        Add an external regressor to the model configuration.
        
        Args:
            name: Name of the regressor column
            prior_scale: Parameter controlling the strength of the seasonality model
            standardize: Whether to standardize the regressor values
        """
        regressor_config = {
            'name': name,
            'prior_scale': prior_scale,
            'standardize': standardize
        }
        
        # Avoid duplicate regressors
        if not any(r['name'] == name for r in self.regressors):
            self.regressors.append(regressor_config)
            logger.info(f"Added regressor: {name}")
        else:
            logger.warning(f"Regressor {name} already exists, skipping")
    
    def add_regressors(self, regressor_names: List[str]) -> None:
        """
        Add multiple external regressors to the model configuration.
        
        Args:
            regressor_names: List of regressor column names to add
        """
        for name in regressor_names:
            self.add_regressor(name)
    
    def encode_weather_data(self, df: pd.DataFrame, weather_column: str = 'weather') -> pd.DataFrame:
        """
        Encode categorical weather data using one-hot encoding for Prophet compatibility.
        
        Args:
            df: DataFrame containing weather data
            weather_column: Name of the weather column to encode
            
        Returns:
            DataFrame with one-hot encoded weather columns
        """
        if weather_column not in df.columns:
            logger.warning(f"Weather column '{weather_column}' not found in data")
            return df
        
        # Get unique weather categories
        weather_categories = df[weather_column].unique()
        logger.info(f"Found weather categories: {weather_categories}")
        
        # Create one-hot encoded columns
        encoded_df = df.copy()
        for category in weather_categories:
            if pd.notna(category):  # Skip NaN values
                column_name = f"weather_{category.lower()}"
                encoded_df[column_name] = (df[weather_column] == category).astype(int)
                
                # Add as regressor if not already added
                self.add_regressor(column_name, prior_scale=5.0)
        
        logger.info(f"Created {len(weather_categories)} weather regressor columns")
        return encoded_df
    
    def validate_regressor_data(self, df: pd.DataFrame) -> bool:
        """
        Validate that all configured regressors have data in the DataFrame.
        
        Args:
            df: DataFrame to validate
            
        Returns:
            bool: True if all regressors are present and valid
        """
        missing_regressors = []
        invalid_regressors = []
        
        for regressor in self.regressors:
            regressor_name = regressor['name']
            
            if regressor_name not in df.columns:
                missing_regressors.append(regressor_name)
            else:
                # Check for excessive missing values
                missing_ratio = df[regressor_name].isna().sum() / len(df)
                if missing_ratio > 0.1:  # More than 10% missing
                    invalid_regressors.append(f"{regressor_name} ({missing_ratio:.1%} missing)")
        
        if missing_regressors:
            logger.error(f"Missing regressor columns: {missing_regressors}")
        
        if invalid_regressors:
            logger.warning(f"Regressors with excessive missing data: {invalid_regressors}")
        
        return len(missing_regressors) == 0
    
    def preprocess_regressors(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocess regressor data for Prophet model training.
        
        Args:
            df: DataFrame with regressor data
            
        Returns:
            DataFrame with preprocessed regressor data
        """
        processed_df = df.copy()
        
        # Handle festival_flag regressor
        if 'festival_flag' in processed_df.columns:
            # Ensure festival_flag is binary (0/1)
            processed_df['festival_flag'] = processed_df['festival_flag'].astype(int)
            self.add_regressor('festival_flag', prior_scale=15.0)  # Higher impact for festivals
        
        # Handle weather data encoding
        if 'weather' in processed_df.columns:
            processed_df = self.encode_weather_data(processed_df)
        
        # Fill missing values in regressor columns
        for regressor in self.regressors:
            regressor_name = regressor['name']
            if regressor_name in processed_df.columns:
                if processed_df[regressor_name].dtype in ['float64', 'int64']:
                    # Fill numeric regressors with median
                    processed_df[regressor_name].fillna(
                        processed_df[regressor_name].median(), inplace=True
                    )
                else:
                    # Fill categorical regressors with mode
                    mode_value = processed_df[regressor_name].mode()
                    if len(mode_value) > 0:
                        processed_df[regressor_name].fillna(mode_value[0], inplace=True)
        
        logger.info("Completed regressor preprocessing")
        return processed_df 
   
    def prepare_prophet_dataframe(self, df: pd.DataFrame, date_col: str = 'date', 
                                 hour_col: str = 'hour', target_col: str = 'visitors') -> pd.DataFrame:
        """
        Prepare DataFrame in Prophet format with 'ds' and 'y' columns.
        
        Args:
            df: Input DataFrame
            date_col: Name of date column
            hour_col: Name of hour column  
            target_col: Name of target variable column
            
        Returns:
            DataFrame formatted for Prophet training
        """
        prophet_df = df.copy()
        
        # Create datetime column combining date and hour
        if hour_col in prophet_df.columns:
            prophet_df['ds'] = pd.to_datetime(prophet_df[date_col]) + pd.to_timedelta(prophet_df[hour_col], unit='h')
        else:
            prophet_df['ds'] = pd.to_datetime(prophet_df[date_col])
        
        # Rename target column to 'y' as required by Prophet
        prophet_df['y'] = prophet_df[target_col]
        
        # Ensure data is sorted by timestamp
        prophet_df = prophet_df.sort_values('ds').reset_index(drop=True)
        
        logger.info(f"Prepared Prophet dataframe with {len(prophet_df)} records")
        return prophet_df
    
    def train_model(self, df: pd.DataFrame) -> Prophet:
        """
        Train Prophet model with historical data and configured regressors.
        
        Args:
            df: DataFrame with historical visitor data and regressors
            
        Returns:
            Prophet: Trained Prophet model
            
        Raises:
            ValueError: If insufficient data or validation fails
        """
        # Validate minimum data requirements
        if len(df) < 30:
            raise ValueError(f"Insufficient data for training. Need at least 30 records, got {len(df)}")
        
        # Preprocess regressors
        processed_df = self.preprocess_regressors(df)
        
        # Validate regressor data
        if not self.validate_regressor_data(processed_df):
            raise ValueError("Regressor validation failed. Check missing columns.")
        
        # Prepare data in Prophet format
        prophet_df = self.prepare_prophet_dataframe(processed_df)
        
        # Create and configure model
        self.model = self._create_model()
        
        try:
            # Fit the model
            logger.info("Starting Prophet model training...")
            self.model.fit(prophet_df)
            logger.info("Prophet model training completed successfully")
            
            return self.model
            
        except Exception as e:
            logger.error(f"Prophet model training failed: {str(e)}")
            raise ValueError(f"Model training failed: {str(e)}")
    
    def generate_future_dataframe(self, periods: int, freq: str = 'H', 
                                 future_regressors: Optional[pd.DataFrame] = None) -> pd.DataFrame:
        """
        Generate future dataframe for making predictions.
        
        Args:
            periods: Number of future periods to predict
            freq: Frequency of predictions ('H' for hourly, 'D' for daily)
            future_regressors: DataFrame with future regressor values
            
        Returns:
            DataFrame with future timestamps and regressor values
            
        Raises:
            ValueError: If model is not trained or regressor data is missing
        """
        if self.model is None:
            raise ValueError("Model must be trained before generating predictions")
        
        # Create future dataframe with Prophet
        future_df = self.model.make_future_dataframe(periods=periods, freq=freq)
        
        # Add regressor values for future periods
        if future_regressors is not None:
            # Merge future regressor values
            future_df = self._merge_future_regressors(future_df, future_regressors)
        else:
            # Fill future regressor values with defaults or last known values
            future_df = self._fill_future_regressors(future_df)
        
        logger.info(f"Generated future dataframe with {periods} periods")
        return future_df
    
    def make_predictions(self, future_df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate forecasts with confidence intervals using trained model.
        
        Args:
            future_df: DataFrame with future timestamps and regressor values
            
        Returns:
            DataFrame with predictions, confidence intervals, and components
            
        Raises:
            ValueError: If model is not trained
        """
        if self.model is None:
            raise ValueError("Model must be trained before making predictions")
        
        try:
            # Generate predictions
            logger.info("Generating predictions...")
            forecast = self.model.predict(future_df)
            
            # Add useful columns and clean up
            forecast['ds'] = pd.to_datetime(forecast['ds'])
            forecast['predicted_visitors'] = forecast['yhat'].round().astype(int)
            forecast['lower_bound'] = forecast['yhat_lower'].round().astype(int)
            forecast['upper_bound'] = forecast['yhat_upper'].round().astype(int)
            
            # Ensure non-negative predictions
            forecast['predicted_visitors'] = forecast['predicted_visitors'].clip(lower=0)
            forecast['lower_bound'] = forecast['lower_bound'].clip(lower=0)
            forecast['upper_bound'] = forecast['upper_bound'].clip(lower=0)
            
            logger.info(f"Generated {len(forecast)} predictions")
            return forecast
            
        except Exception as e:
            logger.error(f"Prediction generation failed: {str(e)}")
            raise ValueError(f"Prediction failed: {str(e)}")
    
    def _merge_future_regressors(self, future_df: pd.DataFrame, 
                                future_regressors: pd.DataFrame) -> pd.DataFrame:
        """
        Merge future regressor values with the future dataframe.
        
        Args:
            future_df: Future dataframe from Prophet
            future_regressors: DataFrame with future regressor values
            
        Returns:
            DataFrame with merged regressor values
        """
        # Ensure future_regressors has 'ds' column for merging
        if 'ds' not in future_regressors.columns:
            logger.warning("Future regressors missing 'ds' column, using index-based merge")
            # Assume same order and length
            for regressor in self.regressors:
                regressor_name = regressor['name']
                if regressor_name in future_regressors.columns:
                    future_df[regressor_name] = future_regressors[regressor_name].values
        else:
            # Merge on timestamp
            future_df = future_df.merge(future_regressors, on='ds', how='left')
        
        return future_df
    
    def _fill_future_regressors(self, future_df: pd.DataFrame) -> pd.DataFrame:
        """
        Fill future regressor values with appropriate defaults.
        
        Args:
            future_df: Future dataframe needing regressor values
            
        Returns:
            DataFrame with filled regressor values
        """
        for regressor in self.regressors:
            regressor_name = regressor['name']
            
            if regressor_name not in future_df.columns:
                if 'festival' in regressor_name.lower():
                    # Default festivals to False/0
                    future_df[regressor_name] = 0
                elif 'weather' in regressor_name.lower():
                    # Default weather to most common condition (assume sunny)
                    if 'sunny' in regressor_name.lower():
                        future_df[regressor_name] = 1
                    else:
                        future_df[regressor_name] = 0
                else:
                    # Default other regressors to 0
                    future_df[regressor_name] = 0
                    
                logger.warning(f"Filled missing regressor '{regressor_name}' with defaults")
        
        return future_df
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the current model configuration.
        
        Returns:
            Dictionary with model configuration details
        """
        return {
            'seasonality_mode': self.seasonality_mode,
            'model_params': self.model_params,
            'regressors': self.regressors,
            'is_trained': self.model is not None
        }