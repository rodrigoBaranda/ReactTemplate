import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
import os

# Port coordinates (lat, lon)
PORT_COORDS = {
    'Shanghai, China': [31.2304, 121.4737],
    'Rotterdam, Netherlands': [51.9225, 4.4792],
    'Singapore': [1.3521, 103.8198],
    'Los Angeles, USA': [33.7405, -118.2700],
    'New York, USA': [40.6895, -74.0447],
    'Dubai, UAE': [25.2760, 55.2962],
    'Hamburg, Germany': [53.5453, 9.9680],
    'Boston, USA': [42.3601, -71.0589],
    'Hong Kong': [22.2908, 114.1501],
    'Vancouver, Canada': [49.2827, -123.1207],
    'Tokyo, Japan': [35.6532, 139.7574],
    'Seattle, USA': [47.6062, -122.3321]
}

def generate_shipments():
    """Generate shipments DataFrame"""
    np.random.seed(42)

    routes = [
        ('Shanghai, China', 'Los Angeles, USA'),
        ('Rotterdam, Netherlands', 'New York, USA'),
        ('Singapore', 'Dubai, UAE'),
        ('Hamburg, Germany', 'Boston, USA'),
        ('Hong Kong', 'Vancouver, Canada'),
        ('Tokyo, Japan', 'Seattle, USA'),
        ('Shanghai, China', 'Seattle, USA'),
        ('Singapore', 'Los Angeles, USA')
    ]

    statuses = ['In Transit', 'On Track', 'At Risk', 'Delayed']
    priorities = ['Critical', 'High', 'Medium', 'Low']
    carriers = ['Maersk Line', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'COSCO', 'ONE']

    shipments_data = []
    for i in range(6):
        origin, dest = routes[i % len(routes)]
        eta_days = np.random.randint(1, 10)

        shipment = {
            'id': f'SH-2024-{str(i+1).zfill(3)}',
            'origin': origin,
            'destination': dest,
            'origin_lat': PORT_COORDS[origin][0],
            'origin_lon': PORT_COORDS[origin][1],
            'dest_lat': PORT_COORDS[dest][0],
            'dest_lon': PORT_COORDS[dest][1],
            'status': np.random.choice(statuses, p=[0.4, 0.3, 0.2, 0.1]),
            'eta': (datetime.now() + timedelta(days=eta_days)).strftime('%Y-%m-%d'),
            'priority': np.random.choice(priorities, p=[0.1, 0.3, 0.4, 0.2]),
            'carrier': np.random.choice(carriers)
        }
        shipments_data.append(shipment)

    return pd.DataFrame(shipments_data)

def generate_tracking(shipments_df):
    """Generate real-time tracking positions"""
    tracking_data = []

    for _, shipment in shipments_df.iterrows():
        # Calculate progress (0-100%)
        progress = np.random.uniform(0.2, 0.9) if shipment['status'] != 'Delayed' else np.random.uniform(0.1, 0.6)

        # Interpolate position between origin and destination
        current_lat = shipment['origin_lat'] + (shipment['dest_lat'] - shipment['origin_lat']) * progress
        current_lon = shipment['origin_lon'] + (shipment['dest_lon'] - shipment['origin_lon']) * progress

        tracking = {
            'shipment_id': shipment['id'],
            'current_lat': round(current_lat, 4),
            'current_lon': round(current_lon, 4),
            'progress': round(progress * 100, 1),
            'status': shipment['status']
        }
        tracking_data.append(tracking)

    return pd.DataFrame(tracking_data)

def generate_delivery_trends():
    """Generate on-time delivery trends over time"""
    dates = pd.date_range(end=datetime.now(), periods=30, freq='D')

    trends_data = []
    base_on_time_rate = 94

    for date in dates:
        # Add some variation
        variation = np.random.uniform(-3, 3)
        on_time_rate = base_on_time_rate + variation

        total = np.random.randint(30, 60)
        on_time = int(total * on_time_rate / 100)
        delayed = total - on_time

        trend = {
            'date': date.strftime('%Y-%m-%d'),
            'on_time_count': on_time,
            'delayed_count': delayed,
            'total_count': total,
            'on_time_rate': round(on_time_rate, 1)
        }
        trends_data.append(trend)

    return pd.DataFrame(trends_data)

def generate_delay_analysis():
    """Generate delay analysis by carrier and reason"""
    carriers = ['Maersk Line', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'COSCO', 'ONE']
    delay_reasons = ['Port Congestion', 'Weather', 'Customs', 'Equipment Issues', 'Documentation']

    analysis_data = []

    for carrier in carriers:
        avg_delay = np.random.uniform(2, 12)
        count = np.random.randint(5, 25)
        reason = np.random.choice(delay_reasons)

        analysis = {
            'carrier': carrier,
            'avg_delay_hours': round(avg_delay, 1),
            'delay_count': count,
            'primary_reason': reason
        }
        analysis_data.append(analysis)

    return pd.DataFrame(analysis_data)

def generate_kpis(shipments_df):
    """Generate KPI metrics"""
    total_shipments = 1247
    on_time_rate = 94.5
    active_orders = len(shipments_df)
    critical_alerts = len(shipments_df[shipments_df['status'].isin(['Delayed', 'At Risk'])])
    inventory_health = 87.3

    kpis = {
        'totalShipments': total_shipments,
        'onTimeRate': on_time_rate,
        'activeOrders': active_orders,
        'criticalAlerts': critical_alerts,
        'inventoryHealth': inventory_health
    }

    return kpis

def generate_alerts(shipments_df):
    """Generate alert messages"""
    delayed_shipments = shipments_df[shipments_df['status'] == 'Delayed']
    at_risk_shipments = shipments_df[shipments_df['status'] == 'At Risk']

    alerts = []

    # High severity for delayed
    for _, ship in delayed_shipments.iterrows():
        alert = {
            'id': f'ALT-{len(alerts)+1:03d}',
            'severity': 'High',
            'message': f'Shipment {ship["id"]} delayed due to port congestion',
            'timestamp': datetime.now().isoformat(),
            'shipmentId': ship['id']
        }
        alerts.append(alert)

    # Medium severity for at risk
    for _, ship in at_risk_shipments.iterrows():
        alert = {
            'id': f'ALT-{len(alerts)+1:03d}',
            'severity': 'Medium',
            'message': f'Customs clearance issue for {ship["id"]}',
            'timestamp': (datetime.now() - timedelta(hours=2)).isoformat(),
            'shipmentId': ship['id']
        }
        alerts.append(alert)

    # General alert
    alerts.append({
        'id': f'ALT-{len(alerts)+1:03d}',
        'severity': 'Low',
        'message': 'Carrier schedule change - MSC line delayed by 6 hours',
        'timestamp': (datetime.now() - timedelta(hours=5)).isoformat(),
        'shipmentId': None
    })

    return alerts

def main():
    """Generate all data and save to JSON files"""
    print("Generating supply chain data...")

    # Create output directory
    os.makedirs('public/data', exist_ok=True)

    # Generate DataFrames
    shipments_df = generate_shipments()
    tracking_df = generate_tracking(shipments_df)
    delivery_trends_df = generate_delivery_trends()
    delay_analysis_df = generate_delay_analysis()
    kpis = generate_kpis(shipments_df)
    alerts = generate_alerts(shipments_df)

    # Save to JSON
    shipments_df.to_json('public/data/shipments.json', orient='records', indent=2)
    tracking_df.to_json('public/data/tracking.json', orient='records', indent=2)
    delivery_trends_df.to_json('public/data/delivery-trends.json', orient='records', indent=2)
    delay_analysis_df.to_json('public/data/delay-analysis.json', orient='records', indent=2)

    with open('public/data/kpis.json', 'w') as f:
        json.dump(kpis, f, indent=2)

    with open('public/data/alerts.json', 'w') as f:
        json.dump(alerts, f, indent=2)

    print(f"✓ Generated {len(shipments_df)} shipments")
    print(f"✓ Generated {len(tracking_df)} tracking positions")
    print(f"✓ Generated {len(delivery_trends_df)} delivery trend records")
    print(f"✓ Generated {len(delay_analysis_df)} delay analysis records")
    print(f"✓ Generated KPIs and {len(alerts)} alerts")
    print("\nAll data saved to public/data/")

if __name__ == '__main__':
    main()
