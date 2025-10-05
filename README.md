# Temple Crowd Dashboard

A real-time temple crowd monitoring dashboard built with Streamlit.

## Features

- Real-time crowd density monitoring for temple zones (Gate, Hall, Exit)
- Color-coded heatmap visualization
- Auto-refresh every 5 seconds
- Responsive web interface

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
streamlit run app.py
```

## Usage

The dashboard will automatically start monitoring crowd levels and update every 5 seconds. No user interaction is required for basic monitoring.

## Project Structure

```
temple-crowd-dashboard/
├── app.py              # Main Streamlit application
├── requirements.txt    # Python dependencies
├── src/               # Source code modules
└── README.md          # Project documentation
```