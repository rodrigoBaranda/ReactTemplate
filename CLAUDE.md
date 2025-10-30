# CLAUDE.md
-In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Supply Chain Control Tower - A React-based dashboard for monitoring ocean freight shipments to Mexico with real-time tracking, analytics, and Accenture branding.

## Tech Stack

**Frontend:**
- React 18 + Vite
- React Router for navigation
- Pigeon Maps for shipment tracking visualization
- D3.js for analytics charts
- Inline styling with Accenture theme

**Backend:**
- Flask server (serves static React build)
- Python pandas for data generation
- Static JSON data files (no APIs)

**Data Source:**
- Python script (`data_generator.py`) generates all mock data
- Outputs to `public/data/*.json`

## Commands

```bash
# Generate fresh data
python3 data_generator.py

# Install dependencies
npm install
pip3 install -r requirements.txt

# Development
npm run dev              # Dev server at http://localhost:5173

# Production
npm run build            # Build React app to dist/
python3 server.py        # Serve at http://localhost:8080
```

## Data Requirements - IMPORTANT

**All generated data MUST follow these rules:**

### Ocean Transport Specifics
- **Mode:** Ocean freight only
- **Destination:** Mexico ports and cities
  - Primary ports: Veracruz, Manzanillo, Lázaro Cárdenas
  - Inland destinations: Nuevo Laredo, Monterrey, Mexico City, Guadalajara, Tijuana
- **Origin:** Typically China (Shanghai, Shenzhen, Ningbo) but can include:
  - Other Asian ports: Singapore, Hong Kong, Busan
  - US ports: Los Angeles, Long Beach (transshipment)
  - European ports: Rotterdam, Hamburg (occasionally)

### Carriers
Use real ocean freight carriers:
- Maersk Line
- MSC (Mediterranean Shipping Company)
- CMA CGM
- Hapag-Lloyd
- COSCO
- ONE (Ocean Network Express)

### Routes & Transit Times
- China → Mexico: 18-25 days typical
- Asia → Mexico Pacific: 14-21 days
- Add realistic delays for port congestion, weather, customs

### Port Coordinates (Mexico)
```python
MEXICO_PORTS = {
    'Veracruz, Mexico': [19.1738, -96.1342],
    'Manzanillo, Mexico': [19.0543, -104.3188],
    'Lázaro Cárdenas, Mexico': [17.9565, -102.2004],
    'Nuevo Laredo, Mexico': [27.5008, -99.5161],
    'Monterrey, Mexico': [25.6866, -100.3161],
    'Mexico City, Mexico': [19.4326, -99.1332],
    'Guadalajara, Mexico': [20.6597, -103.3496],
    'Tijuana, Mexico': [32.5149, -117.0382]
}
```

## Architecture

```
src/
├── components/
│   ├── Header.jsx           # Nav: Dashboard, Map, Analytics
│   ├── Dashboard.jsx        # KPIs + tables + alerts
│   ├── MapView.jsx          # Pigeon Maps with markers
│   ├── AnalyticsView.jsx    # D3 charts
│   ├── KPICard.jsx          # Metric cards
│   ├── ShipmentsTable.jsx   # Active shipments
│   └── AlertsPanel.jsx      # Critical alerts
├── data/
│   └── mockData.js          # (legacy - use JSON files)
├── styles/
│   └── theme.js             # Accenture colors (#A100FF)
└── App.jsx                  # Router setup

public/data/                 # Generated JSON
├── kpis.json
├── shipments.json
├── tracking.json
├── alerts.json
├── delivery-trends.json
└── delay-analysis.json
```

## Styling Guidelines

- Primary: Accenture Purple (#A100FF)
- Use inline styles with theme object
- Purple accents on headers, active nav, charts
- Professional, clean, modern design

## Python Development - TDD Approach

**All Python code MUST follow Test-Driven Development (TDD):**

1. **Write tests first** - Before implementing any feature
2. **Run tests** - Verify they fail (red)
3. **Write minimal code** - Make tests pass (green)
4. **Refactor** - Improve code while keeping tests green
5. **Repeat** - For each new feature

### Testing Requirements
- Use `pytest` framework
- Tests in `tests/` directory
- File naming: `test_*.py`
- Function naming: `test_*`
- 100% coverage for data generation logic
- Run tests: `pytest tests/`

### Test Structure
```python
# tests/test_data_generator.py
def test_generate_shipments_returns_dataframe():
    # Arrange: setup
    # Act: call function
    # Assert: verify result
```

## Data Generation

When modifying `data_generator.py`:
1. Write tests first (TDD)
2. Always use Mexico destinations
3. Origin typically China (can vary)
4. Ocean transport carriers only
5. Realistic coordinates and transit times
6. Run tests: `pytest tests/`
7. Generate data: `python3 data_generator.py`
