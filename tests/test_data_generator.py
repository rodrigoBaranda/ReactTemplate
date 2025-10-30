import pytest
import pandas as pd
import numpy as np
from datetime import datetime
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data_generator import (
    generate_shipments,
    generate_tracking,
    generate_delivery_trends,
    generate_delay_analysis,
    generate_kpis,
    generate_alerts,
    PORT_COORDS
)


class TestGenerateShipments:
    """Tests for generate_shipments function"""

    def test_returns_dataframe(self):
        """Should return a pandas DataFrame"""
        result = generate_shipments()
        assert isinstance(result, pd.DataFrame)

    def test_has_correct_columns(self):
        """Should have all required columns"""
        result = generate_shipments()
        expected_columns = [
            'id', 'origin', 'destination',
            'origin_lat', 'origin_lon', 'dest_lat', 'dest_lon',
            'status', 'eta', 'priority', 'carrier'
        ]
        for col in expected_columns:
            assert col in result.columns

    def test_generates_multiple_shipments(self):
        """Should generate at least one shipment"""
        result = generate_shipments()
        assert len(result) > 0

    def test_shipment_ids_are_unique(self):
        """All shipment IDs should be unique"""
        result = generate_shipments()
        assert result['id'].is_unique

    def test_coordinates_are_numeric(self):
        """Lat/lon should be numeric values"""
        result = generate_shipments()
        assert pd.api.types.is_numeric_dtype(result['origin_lat'])
        assert pd.api.types.is_numeric_dtype(result['origin_lon'])
        assert pd.api.types.is_numeric_dtype(result['dest_lat'])
        assert pd.api.types.is_numeric_dtype(result['dest_lon'])

    def test_status_values_are_valid(self):
        """Status should be one of the expected values"""
        result = generate_shipments()
        valid_statuses = ['In Transit', 'On Track', 'At Risk', 'Delayed']
        assert result['status'].isin(valid_statuses).all()

    def test_priority_values_are_valid(self):
        """Priority should be one of the expected values"""
        result = generate_shipments()
        valid_priorities = ['Critical', 'High', 'Medium', 'Low']
        assert result['priority'].isin(valid_priorities).all()

    def test_eta_is_future_date(self):
        """ETA should be a valid date string"""
        result = generate_shipments()
        # Check that ETA can be parsed as date
        for eta in result['eta']:
            datetime.strptime(eta, '%Y-%m-%d')

    def test_carrier_values_are_valid(self):
        """Carrier should be one of the expected ocean freight carriers"""
        result = generate_shipments()
        valid_carriers = ['Maersk Line', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'COSCO', 'ONE']
        assert result['carrier'].isin(valid_carriers).all()


class TestGenerateTracking:
    """Tests for generate_tracking function"""

    def test_returns_dataframe(self):
        """Should return a pandas DataFrame"""
        shipments = generate_shipments()
        result = generate_tracking(shipments)
        assert isinstance(result, pd.DataFrame)

    def test_has_correct_columns(self):
        """Should have all required columns"""
        shipments = generate_shipments()
        result = generate_tracking(shipments)
        expected_columns = ['shipment_id', 'current_lat', 'current_lon', 'progress', 'status']
        for col in expected_columns:
            assert col in result.columns

    def test_tracking_count_matches_shipments(self):
        """Should generate one tracking record per shipment"""
        shipments = generate_shipments()
        result = generate_tracking(shipments)
        assert len(result) == len(shipments)

    def test_progress_is_percentage(self):
        """Progress should be between 0 and 100"""
        shipments = generate_shipments()
        result = generate_tracking(shipments)
        assert (result['progress'] >= 0).all()
        assert (result['progress'] <= 100).all()

    def test_coordinates_are_valid(self):
        """Lat should be -90 to 90, lon should be -180 to 180"""
        shipments = generate_shipments()
        result = generate_tracking(shipments)
        assert (result['current_lat'] >= -90).all()
        assert (result['current_lat'] <= 90).all()
        assert (result['current_lon'] >= -180).all()
        assert (result['current_lon'] <= 180).all()

    def test_shipment_ids_match(self):
        """Tracking shipment_id should match original shipments"""
        shipments = generate_shipments()
        result = generate_tracking(shipments)
        assert result['shipment_id'].isin(shipments['id']).all()


class TestGenerateDeliveryTrends:
    """Tests for generate_delivery_trends function"""

    def test_returns_dataframe(self):
        """Should return a pandas DataFrame"""
        result = generate_delivery_trends()
        assert isinstance(result, pd.DataFrame)

    def test_has_correct_columns(self):
        """Should have all required columns"""
        result = generate_delivery_trends()
        expected_columns = ['date', 'on_time_count', 'delayed_count', 'total_count', 'on_time_rate']
        for col in expected_columns:
            assert col in result.columns

    def test_generates_30_days(self):
        """Should generate 30 days of data"""
        result = generate_delivery_trends()
        assert len(result) == 30

    def test_counts_are_non_negative(self):
        """Counts should be non-negative integers"""
        result = generate_delivery_trends()
        assert (result['on_time_count'] >= 0).all()
        assert (result['delayed_count'] >= 0).all()
        assert (result['total_count'] >= 0).all()

    def test_total_equals_sum(self):
        """Total count should equal on_time + delayed"""
        result = generate_delivery_trends()
        calculated_total = result['on_time_count'] + result['delayed_count']
        assert (result['total_count'] == calculated_total).all()

    def test_on_time_rate_is_percentage(self):
        """On-time rate should be between 0 and 100"""
        result = generate_delivery_trends()
        assert (result['on_time_rate'] >= 0).all()
        assert (result['on_time_rate'] <= 100).all()


class TestGenerateDelayAnalysis:
    """Tests for generate_delay_analysis function"""

    def test_returns_dataframe(self):
        """Should return a pandas DataFrame"""
        result = generate_delay_analysis()
        assert isinstance(result, pd.DataFrame)

    def test_has_correct_columns(self):
        """Should have all required columns"""
        result = generate_delay_analysis()
        expected_columns = ['carrier', 'avg_delay_hours', 'delay_count', 'primary_reason']
        for col in expected_columns:
            assert col in result.columns

    def test_carriers_are_ocean_freight(self):
        """Carriers should be ocean freight companies"""
        result = generate_delay_analysis()
        valid_carriers = ['Maersk Line', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'COSCO', 'ONE']
        assert result['carrier'].isin(valid_carriers).all()

    def test_delay_hours_are_positive(self):
        """Average delay hours should be positive"""
        result = generate_delay_analysis()
        assert (result['avg_delay_hours'] > 0).all()

    def test_delay_count_is_positive_integer(self):
        """Delay count should be positive integer"""
        result = generate_delay_analysis()
        assert (result['delay_count'] > 0).all()
        assert result['delay_count'].dtype in [np.int64, int]


class TestGenerateKPIs:
    """Tests for generate_kpis function"""

    def test_returns_dict(self):
        """Should return a dictionary"""
        shipments = generate_shipments()
        result = generate_kpis(shipments)
        assert isinstance(result, dict)

    def test_has_required_keys(self):
        """Should have all required KPI keys"""
        shipments = generate_shipments()
        result = generate_kpis(shipments)
        expected_keys = ['totalShipments', 'onTimeRate', 'activeOrders', 'criticalAlerts', 'inventoryHealth']
        for key in expected_keys:
            assert key in result

    def test_values_are_numeric(self):
        """All KPI values should be numeric"""
        shipments = generate_shipments()
        result = generate_kpis(shipments)
        for value in result.values():
            assert isinstance(value, (int, float))

    def test_percentages_are_valid(self):
        """Percentage values should be between 0 and 100"""
        shipments = generate_shipments()
        result = generate_kpis(shipments)
        assert 0 <= result['onTimeRate'] <= 100
        assert 0 <= result['inventoryHealth'] <= 100


class TestGenerateAlerts:
    """Tests for generate_alerts function"""

    def test_returns_list(self):
        """Should return a list"""
        shipments = generate_shipments()
        result = generate_alerts(shipments)
        assert isinstance(result, list)

    def test_alert_structure(self):
        """Each alert should have required fields"""
        shipments = generate_shipments()
        result = generate_alerts(shipments)
        if len(result) > 0:
            alert = result[0]
            assert 'id' in alert
            assert 'severity' in alert
            assert 'message' in alert
            assert 'timestamp' in alert

    def test_severity_values(self):
        """Severity should be High, Medium, or Low"""
        shipments = generate_shipments()
        result = generate_alerts(shipments)
        valid_severities = ['High', 'Medium', 'Low']
        for alert in result:
            assert alert['severity'] in valid_severities

    def test_timestamp_is_valid_iso(self):
        """Timestamp should be valid ISO format"""
        shipments = generate_shipments()
        result = generate_alerts(shipments)
        for alert in result:
            # Should not raise exception
            datetime.fromisoformat(alert['timestamp'])


class TestPortCoordinates:
    """Tests for PORT_COORDS constant"""

    def test_port_coords_exist(self):
        """PORT_COORDS should be defined"""
        assert PORT_COORDS is not None
        assert isinstance(PORT_COORDS, dict)

    def test_coordinates_are_valid(self):
        """All coordinates should be valid lat/lon pairs"""
        for port, coords in PORT_COORDS.items():
            assert isinstance(coords, list)
            assert len(coords) == 2
            lat, lon = coords
            assert -90 <= lat <= 90
            assert -180 <= lon <= 180
