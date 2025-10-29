import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { theme } from '../styles/theme';

// Fix for default marker icons in react-leaflet
if (L.Icon.Default.prototype._getIconUrl) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

function MapView() {
  const [shipments, setShipments] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/data/shipments.json').then(res => res.json()),
      fetch('/data/tracking.json').then(res => res.json())
    ])
      .then(([shipmentsData, trackingData]) => {
        setShipments(shipmentsData);
        setTracking(trackingData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setLoading(false);
      });
  }, []);

  const getMarkerColor = (status) => {
    switch (status) {
      case 'On Track':
        return theme.colors.success;
      case 'In Transit':
        return theme.colors.primary;
      case 'At Risk':
        return theme.colors.warning;
      case 'Delayed':
        return theme.colors.danger;
      default:
        return theme.colors.textLight;
    }
  };

  const createCustomIcon = (status) => {
    const color = getMarkerColor(status);
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const styles = {
    container: {
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.backgroundLight
    },
    header: {
      marginBottom: theme.spacing.lg
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    mapWrapper: {
      height: '700px',
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      boxShadow: theme.shadows.lg,
      border: `1px solid ${theme.colors.border}`
    },
    legend: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      display: 'flex',
      gap: theme.spacing.xl,
      justifyContent: 'center'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm
    },
    legendDot: (color) => ({
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: color
    }),
    legendLabel: {
      fontSize: '14px',
      color: theme.colors.text
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Loading map...</h2>
        </div>
      </div>
    );
  }

  // Combine shipment and tracking data
  const shipmentTracking = shipments.map(ship => {
    const track = tracking.find(t => t.shipment_id === ship.id);
    return { ...ship, ...track };
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Real-Time Shipment Tracking</h2>
      </div>

      <div style={styles.mapWrapper}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {shipmentTracking.map((ship) => {
            if (!ship.current_lat || !ship.current_lon) return null;

            return (
              <>
                {/* Route line from origin to destination */}
                <Polyline
                  key={`line-${ship.id}`}
                  positions={[
                    [ship.origin_lat, ship.origin_lon],
                    [ship.dest_lat, ship.dest_lon]
                  ]}
                  color={getMarkerColor(ship.status)}
                  opacity={0.4}
                  weight={2}
                />

                {/* Current position marker */}
                <Marker
                  key={`marker-${ship.id}`}
                  position={[ship.current_lat, ship.current_lon]}
                  icon={createCustomIcon(ship.status)}
                >
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{ship.id}</h3>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        <strong>Status:</strong> {ship.status}
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        <strong>Progress:</strong> {ship.progress}%
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        <strong>From:</strong> {ship.origin}
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        <strong>To:</strong> {ship.destination}
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        <strong>ETA:</strong> {ship.eta}
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        <strong>Carrier:</strong> {ship.carrier}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </>
            );
          })}
        </MapContainer>
      </div>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={styles.legendDot(theme.colors.success)} />
          <span style={styles.legendLabel}>On Track</span>
        </div>
        <div style={styles.legendItem}>
          <div style={styles.legendDot(theme.colors.primary)} />
          <span style={styles.legendLabel}>In Transit</span>
        </div>
        <div style={styles.legendItem}>
          <div style={styles.legendDot(theme.colors.warning)} />
          <span style={styles.legendLabel}>At Risk</span>
        </div>
        <div style={styles.legendItem}>
          <div style={styles.legendDot(theme.colors.danger)} />
          <span style={styles.legendLabel}>Delayed</span>
        </div>
      </div>
    </div>
  );
}

export default MapView;
