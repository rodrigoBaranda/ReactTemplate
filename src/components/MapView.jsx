import { useEffect, useState } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import { theme } from '../styles/theme';

function MapView() {
  const [shipments, setShipments] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [center, setCenter] = useState([20, 0]);
  const [zoom, setZoom] = useState(2);

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

  const getStatusColor = (status) => {
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

  const createMarkerSVG = (color) => {
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="white" opacity="0.5"/>
      </svg>
    `;
  };

  const styles = {
    container: {
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.backgroundLight,
      minHeight: 'calc(100vh - 100px)'
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
    mapContainer: {
      position: 'relative',
      height: '700px',
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      boxShadow: theme.shadows.lg,
      border: `1px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.white
    },
    markerButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      width: '24px',
      height: '24px'
    },
    popup: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      boxShadow: theme.shadows.lg,
      border: `2px solid ${theme.colors.primary}`,
      minWidth: '250px',
      maxWidth: '300px',
      position: 'relative'
    },
    popupTitle: {
      margin: '0 0 12px 0',
      fontSize: '18px',
      fontWeight: '600',
      color: theme.colors.primary,
      borderBottom: `2px solid ${theme.colors.primary}`,
      paddingBottom: '8px'
    },
    popupRow: {
      margin: '8px 0',
      fontSize: '14px',
      color: theme.colors.text
    },
    popupLabel: {
      fontWeight: '600',
      marginRight: '8px'
    },
    closeButton: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: theme.colors.danger,
      color: theme.colors.white,
      border: 'none',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    legend: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      display: 'flex',
      gap: theme.spacing.xl,
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm
    },
    legendDot: (color) => ({
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      backgroundColor: color,
      border: '2px solid white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
    }),
    legendLabel: {
      fontSize: '14px',
      color: theme.colors.text,
      fontWeight: '500'
    },
    routeLine: {
      pointerEvents: 'none'
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
  }).filter(ship => ship.current_lat && ship.current_lon);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Real-Time Shipment Tracking</h2>
      </div>

      <div style={styles.mapContainer}>
        <Map
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center);
            setZoom(zoom);
          }}
          height={700}
        >
          {/* Draw route lines */}
          {shipmentTracking.map((ship) => (
            <Overlay
              key={`route-${ship.id}`}
              anchor={[ship.origin_lat, ship.origin_lon]}
            >
              <svg
                width="100%"
                height="100%"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  pointerEvents: 'none',
                  overflow: 'visible'
                }}
              >
                <line
                  x1="0"
                  y1="0"
                  x2={(ship.dest_lon - ship.origin_lon) * 100}
                  y2={(ship.dest_lat - ship.origin_lat) * 100}
                  stroke={getStatusColor(ship.status)}
                  strokeWidth="2"
                  strokeOpacity="0.4"
                  strokeDasharray="5,5"
                />
              </svg>
            </Overlay>
          ))}

          {/* Draw markers */}
          {shipmentTracking.map((ship) => (
            <Marker
              key={`marker-${ship.id}`}
              anchor={[ship.current_lat, ship.current_lon]}
              onClick={() => setSelectedShipment(ship)}
            >
              <button style={styles.markerButton}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(ship.status),
                    border: '3px solid white',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    cursor: 'pointer'
                  }}
                />
              </button>
            </Marker>
          ))}

          {/* Show popup for selected shipment */}
          {selectedShipment && (
            <Overlay
              anchor={[selectedShipment.current_lat, selectedShipment.current_lon]}
              offset={[0, -40]}
            >
              <div style={styles.popup}>
                <button
                  style={styles.closeButton}
                  onClick={() => setSelectedShipment(null)}
                >
                  ×
                </button>
                <h3 style={styles.popupTitle}>{selectedShipment.id}</h3>
                <div style={styles.popupRow}>
                  <span style={styles.popupLabel}>Status:</span>
                  <span style={{ color: getStatusColor(selectedShipment.status) }}>
                    {selectedShipment.status}
                  </span>
                </div>
                <div style={styles.popupRow}>
                  <span style={styles.popupLabel}>Progress:</span>
                  <span>{selectedShipment.progress}%</span>
                </div>
                <div style={styles.popupRow}>
                  <span style={styles.popupLabel}>From:</span>
                  <span>{selectedShipment.origin}</span>
                </div>
                <div style={styles.popupRow}>
                  <span style={styles.popupLabel}>To:</span>
                  <span>{selectedShipment.destination}</span>
                </div>
                <div style={styles.popupRow}>
                  <span style={styles.popupLabel}>ETA:</span>
                  <span>{selectedShipment.eta}</span>
                </div>
                <div style={styles.popupRow}>
                  <span style={styles.popupLabel}>Carrier:</span>
                  <span>{selectedShipment.carrier}</span>
                </div>
              </div>
            </Overlay>
          )}
        </Map>
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
