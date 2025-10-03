# Visualization module for temple crowd prediction system

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import pandas as pd
import numpy as np
import seaborn as sns
from pathlib import Path
from typing import Optional, Tuple, Dict, Any
import logging

logger = logging.getLogger(__name__)


class VisualizationModule:
    """
    Handles chart generation and visualization for temple crowd prediction results.
    
    This class creates professional-looking charts that display actual vs predicted
    visitor counts with confidence intervals, proper styling, and export functionality.
    """
    
    def __init__(self):
        """Initialize the VisualizationModule with default styling configuration."""
        self.figure_size = (15, 8)
        self.dpi = 300
        self.style_config = {
            'font_size': 12,
            'title_size': 16,
            'label_size': 14,
            'legend_size': 12,
            'line_width': 2,
            'alpha_confidence': 0.3,
            'color_actual': '#2E86AB',
            'color_predicted': '#A23B72',
            'color_confidence': '#F18F01',
            'grid_alpha': 0.3
        }
        
        # Set up matplotlib and seaborn styling
        self._setup_plotting_style()
        
        logger.info("VisualizationModule initialized with professional styling")
    
    def _setup_plotting_style(self):
        """Configure matplotlib and seaborn for professional appearance."""
        # Set seaborn style for better default appearance
        sns.set_style("whitegrid")
        
        # Configure matplotlib parameters
        plt.rcParams.update({
            'figure.figsize': self.figure_size,
            'figure.dpi': self.dpi,
            'font.size': self.style_config['font_size'],
            'axes.titlesize': self.style_config['title_size'],
            'axes.labelsize': self.style_config['label_size'],
            'legend.fontsize': self.style_config['legend_size'],
            'xtick.labelsize': self.style_config['font_size'],
            'ytick.labelsize': self.style_config['font_size'],
            'lines.linewidth': self.style_config['line_width'],
            'grid.alpha': self.style_config['grid_alpha']
        })
    
    def create_prediction_chart(self, actual_data: pd.DataFrame, 
                              predictions: pd.DataFrame,
                              title: Optional[str] = None) -> plt.Figure:
        """
        Create a chart displaying actual vs predicted visitor counts with confidence intervals.
        
        Args:
            actual_data: DataFrame with actual visitor data (columns: ds, y)
            predictions: DataFrame with predictions (columns: ds, yhat, yhat_lower, yhat_upper)
            title: Optional custom title for the chart
            
        Returns:
            matplotlib Figure object with the prediction chart
        """
        try:
            # Create figure and axis
            fig, ax = plt.subplots(figsize=self.figure_size)
            
            # Ensure datetime columns are properly formatted
            if 'ds' in actual_data.columns:
                actual_data = actual_data.copy()
                actual_data['ds'] = pd.to_datetime(actual_data['ds'])
            
            if 'ds' in predictions.columns:
                predictions = predictions.copy()
                predictions['ds'] = pd.to_datetime(predictions['ds'])
            
            # Plot actual data
            if not actual_data.empty and 'y' in actual_data.columns:
                ax.plot(actual_data['ds'], actual_data['y'], 
                       color=self.style_config['color_actual'],
                       linewidth=self.style_config['line_width'],
                       label='Actual Visitors',
                       marker='o', markersize=3, alpha=0.8)
                logger.info(f"Plotted {len(actual_data)} actual data points")
            
            # Plot predicted data
            if not predictions.empty and 'yhat' in predictions.columns:
                ax.plot(predictions['ds'], predictions['yhat'],
                       color=self.style_config['color_predicted'],
                       linewidth=self.style_config['line_width'],
                       label='Predicted Visitors',
                       linestyle='--', alpha=0.9)
                logger.info(f"Plotted {len(predictions)} predicted data points")
            
            # Plot confidence intervals
            if not predictions.empty and all(col in predictions.columns for col in ['yhat_lower', 'yhat_upper']):
                ax.fill_between(predictions['ds'], 
                               predictions['yhat_lower'], 
                               predictions['yhat_upper'],
                               color=self.style_config['color_confidence'],
                               alpha=self.style_config['alpha_confidence'],
                               label='Confidence Interval')
                logger.info("Added confidence interval bands")
            
            # Apply formatting
            self.format_chart_styling(fig, ax, title)
            
            logger.info("Successfully created prediction chart")
            return fig
            
        except Exception as e:
            logger.error(f"Error creating prediction chart: {str(e)}")
            raise ValueError(f"Chart creation failed: {str(e)}")
    
    def format_chart_styling(self, figure: plt.Figure, ax: Optional[plt.Axes] = None, 
                           title: Optional[str] = None) -> plt.Figure:
        """
        Apply professional formatting and styling to the chart.
        
        Args:
            figure: matplotlib Figure object to format
            ax: matplotlib Axes object (if None, uses current axes)
            title: Optional custom title for the chart
            
        Returns:
            Formatted matplotlib Figure object
        """
        if ax is None:
            ax = plt.gca()
        
        # Set title
        chart_title = title or "Temple Visitor Count Prediction"
        ax.set_title(chart_title, 
                    fontsize=self.style_config['title_size'],
                    fontweight='bold',
                    pad=20)
        
        # Set axis labels
        ax.set_xlabel('Date and Time', 
                     fontsize=self.style_config['label_size'],
                     fontweight='semibold')
        ax.set_ylabel('Number of Visitors', 
                     fontsize=self.style_config['label_size'],
                     fontweight='semibold')
        
        # Format x-axis for better date display
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        ax.xaxis.set_major_locator(mdates.DayLocator(interval=1))
        
        # Rotate x-axis labels for better readability
        plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha='right')
        
        # Add grid for better readability
        ax.grid(True, alpha=self.style_config['grid_alpha'], linestyle='-', linewidth=0.5)
        
        # Format legend
        legend = ax.legend(loc='upper left', 
                          frameon=True, 
                          fancybox=True, 
                          shadow=True,
                          fontsize=self.style_config['legend_size'])
        legend.get_frame().set_facecolor('white')
        legend.get_frame().set_alpha(0.9)
        
        # Set y-axis to start from 0 for visitor counts
        ax.set_ylim(bottom=0)
        
        # Format y-axis to show integer values
        ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{int(x):,}'))
        
        # Adjust layout to prevent label cutoff
        figure.tight_layout()
        
        # Add subtle background color
        ax.set_facecolor('#fafafa')
        
        logger.info("Applied professional chart formatting")
        return figure
    
    def save_chart(self, figure: plt.Figure, output_path: str, 
                   format: str = 'png', dpi: Optional[int] = None) -> None:
        """
        Export visualization as image file with proper error handling.
        
        Args:
            figure: matplotlib Figure object to save
            output_path: Path where the image should be saved
            format: Image format ('png', 'jpg', 'pdf', 'svg')
            dpi: Resolution for the saved image (uses default if None)
            
        Raises:
            ValueError: If save operation fails
        """
        try:
            # Ensure output directory exists
            output_path = Path(output_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Use configured DPI if not specified
            save_dpi = dpi or self.dpi
            
            # Save the figure
            figure.savefig(
                output_path,
                format=format,
                dpi=save_dpi,
                bbox_inches='tight',
                facecolor='white',
                edgecolor='none',
                transparent=False
            )
            
            logger.info(f"Chart saved successfully to: {output_path}")
            
            # Verify file was created and has reasonable size
            if output_path.exists() and output_path.stat().st_size > 1000:  # At least 1KB
                logger.info(f"Saved chart file size: {output_path.stat().st_size / 1024:.1f} KB")
            else:
                logger.warning("Saved chart file seems unusually small")
                
        except PermissionError:
            error_msg = f"Permission denied when saving to: {output_path}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        except Exception as e:
            error_msg = f"Error saving chart to {output_path}: {str(e)}"
            logger.error(error_msg)
            raise ValueError(error_msg)
    
    def create_comparison_chart(self, actual_data: pd.DataFrame, 
                              predictions: pd.DataFrame,
                              metrics: Optional[Dict[str, float]] = None) -> plt.Figure:
        """
        Create a comprehensive comparison chart with multiple subplots.
        
        Args:
            actual_data: DataFrame with actual visitor data
            predictions: DataFrame with predictions
            metrics: Optional dictionary with accuracy metrics
            
        Returns:
            matplotlib Figure object with comparison charts
        """
        try:
            # Create figure with subplots
            fig, axes = plt.subplots(2, 2, figsize=(20, 12))
            fig.suptitle('Temple Visitor Prediction Analysis', 
                        fontsize=18, fontweight='bold', y=0.95)
            
            # Main prediction chart (top left)
            ax1 = axes[0, 0]
            self._plot_main_prediction(ax1, actual_data, predictions)
            
            # Residuals plot (top right)
            ax2 = axes[0, 1]
            self._plot_residuals(ax2, actual_data, predictions)
            
            # Daily aggregation (bottom left)
            ax3 = axes[1, 0]
            self._plot_daily_aggregation(ax3, actual_data, predictions)
            
            # Metrics summary (bottom right)
            ax4 = axes[1, 1]
            self._plot_metrics_summary(ax4, metrics)
            
            # Apply overall formatting
            plt.tight_layout()
            plt.subplots_adjust(top=0.92)
            
            logger.info("Created comprehensive comparison chart")
            return fig
            
        except Exception as e:
            logger.error(f"Error creating comparison chart: {str(e)}")
            raise ValueError(f"Comparison chart creation failed: {str(e)}")
    
    def _plot_main_prediction(self, ax: plt.Axes, actual_data: pd.DataFrame, 
                            predictions: pd.DataFrame):
        """Plot the main prediction chart on given axes."""
        # Plot actual data
        if not actual_data.empty:
            ax.plot(actual_data['ds'], actual_data['y'], 
                   color=self.style_config['color_actual'],
                   label='Actual', linewidth=2, alpha=0.8)
        
        # Plot predictions
        if not predictions.empty:
            ax.plot(predictions['ds'], predictions['yhat'],
                   color=self.style_config['color_predicted'],
                   label='Predicted', linewidth=2, linestyle='--')
            
            # Add confidence intervals
            if all(col in predictions.columns for col in ['yhat_lower', 'yhat_upper']):
                ax.fill_between(predictions['ds'], 
                               predictions['yhat_lower'], 
                               predictions['yhat_upper'],
                               alpha=0.3, color=self.style_config['color_confidence'],
                               label='Confidence Interval')
        
        ax.set_title('Visitor Count Prediction', fontweight='bold')
        ax.set_ylabel('Number of Visitors')
        ax.legend()
        ax.grid(True, alpha=0.3)
    
    def _plot_residuals(self, ax: plt.Axes, actual_data: pd.DataFrame, 
                       predictions: pd.DataFrame):
        """Plot residuals (prediction errors) on given axes."""
        if actual_data.empty or predictions.empty:
            ax.text(0.5, 0.5, 'Insufficient data for residuals', 
                   ha='center', va='center', transform=ax.transAxes)
            ax.set_title('Residuals Plot')
            return
        
        # Merge data to calculate residuals
        merged = pd.merge(actual_data[['ds', 'y']], 
                         predictions[['ds', 'yhat']], 
                         on='ds', how='inner')
        
        if not merged.empty:
            residuals = merged['y'] - merged['yhat']
            ax.scatter(merged['yhat'], residuals, alpha=0.6, s=30)
            ax.axhline(y=0, color='red', linestyle='--', alpha=0.8)
            ax.set_xlabel('Predicted Values')
            ax.set_ylabel('Residuals')
            ax.set_title('Residuals vs Predicted', fontweight='bold')
            ax.grid(True, alpha=0.3)
    
    def _plot_daily_aggregation(self, ax: plt.Axes, actual_data: pd.DataFrame, 
                              predictions: pd.DataFrame):
        """Plot daily aggregated data on given axes."""
        try:
            # Aggregate actual data by day
            if not actual_data.empty:
                actual_daily = actual_data.copy()
                actual_daily['date'] = actual_daily['ds'].dt.date
                actual_daily = actual_daily.groupby('date')['y'].sum().reset_index()
                actual_daily['date'] = pd.to_datetime(actual_daily['date'])
                
                ax.plot(actual_daily['date'], actual_daily['y'], 
                       color=self.style_config['color_actual'],
                       label='Actual Daily', linewidth=2, marker='o', markersize=4)
            
            # Aggregate predictions by day
            if not predictions.empty:
                pred_daily = predictions.copy()
                pred_daily['date'] = pred_daily['ds'].dt.date
                pred_daily = pred_daily.groupby('date')['yhat'].sum().reset_index()
                pred_daily['date'] = pd.to_datetime(pred_daily['date'])
                
                ax.plot(pred_daily['date'], pred_daily['yhat'], 
                       color=self.style_config['color_predicted'],
                       label='Predicted Daily', linewidth=2, linestyle='--', marker='s', markersize=4)
            
            ax.set_title('Daily Visitor Totals', fontweight='bold')
            ax.set_ylabel('Daily Visitors')
            ax.legend()
            ax.grid(True, alpha=0.3)
            
        except Exception as e:
            ax.text(0.5, 0.5, f'Error creating daily aggregation: {str(e)}', 
                   ha='center', va='center', transform=ax.transAxes)
            ax.set_title('Daily Aggregation')
    
    def _plot_metrics_summary(self, ax: plt.Axes, metrics: Optional[Dict[str, float]]):
        """Plot metrics summary on given axes."""
        ax.axis('off')  # Turn off axes for text display
        
        if metrics:
            # Create text summary of metrics
            metrics_text = "Prediction Accuracy Metrics\n\n"
            for metric, value in metrics.items():
                if isinstance(value, float):
                    metrics_text += f"{metric}: {value:.3f}\n"
                else:
                    metrics_text += f"{metric}: {value}\n"
        else:
            metrics_text = "Prediction Accuracy Metrics\n\nMetrics will be calculated\nafter model training\nand prediction generation."
        
        ax.text(0.1, 0.9, metrics_text, 
               transform=ax.transAxes, 
               fontsize=12, 
               verticalalignment='top',
               bbox=dict(boxstyle="round,pad=0.3", facecolor="lightgray", alpha=0.5))
        
        ax.set_title('Model Performance', fontweight='bold')
    
    def close_figure(self, figure: plt.Figure):
        """
        Properly close a matplotlib figure to free memory.
        
        Args:
            figure: matplotlib Figure object to close
        """
        plt.close(figure)
        logger.debug("Closed matplotlib figure")
    
    def get_style_config(self) -> Dict[str, Any]:
        """
        Get current style configuration.
        
        Returns:
            Dictionary with current styling parameters
        """
        return self.style_config.copy()
    
    def update_style_config(self, **kwargs):
        """
        Update style configuration parameters.
        
        Args:
            **kwargs: Style parameters to update
        """
        self.style_config.update(kwargs)
        self._setup_plotting_style()
        logger.info(f"Updated style configuration: {kwargs}")