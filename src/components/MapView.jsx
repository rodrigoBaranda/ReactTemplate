import { useEffect, useState } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import { theme } from '../styles/theme';

function MapView() {
  const [shipments, setShipments] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [hoveredShipment, setHoveredShipment] = useState(null);
  const [center, setCenter] = useState([20, 0]);
  const [zoom, setZoom] = useState(2);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');

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

  const getLatenessColor = (probability) => {
    if (probability >= 70) return theme.colors.danger;      // High risk: red
    if (probability >= 40) return theme.colors.warning;     // Medium risk: yellow
    if (probability >= 20) return '#3498db';                // Low-medium risk: blue
    return theme.colors.success;                            // Low risk: green
  };

  // Calculate quadratic bezier curve points for smooth arcs
  const createArcPath = (start, end) => {
    const [lat1, lon1] = start;
    const [lat2, lon2] = end;

    // Calculate midpoint
    const midLat = (lat1 + lat2) / 2;
    const midLon = (lon1 + lon2) / 2;

    // Calculate perpendicular offset for curve
    const distance = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
    const offset = distance * 0.2; // Curve height as 20% of distance

    // Calculate perpendicular direction
    const dx = lon2 - lon1;
    const dy = lat2 - lat1;
    const perpLat = midLat - (dx * offset);
    const perpLon = midLon + (dy * offset);

    return { start, control: [perpLat, perpLon], end };
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

  // Apply search and filters
  const filteredShipments = shipmentTracking.filter(ship => {
    // Search filter
    const matchesSearch = searchTerm === '' ||
      ship.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.destination.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = filterStatus === 'All' || ship.status === filterStatus;

    // Risk filter
    const matchesRisk = filterRisk === 'All' ||
      (filterRisk === 'High' && ship.lateness_probability >= 70) ||
      (filterRisk === 'Medium' && ship.lateness_probability >= 40 && ship.lateness_probability < 70) ||
      (filterRisk === 'Low' && ship.lateness_probability < 40);

    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Real-Time Shipment Tracking</h2>

        {/* Search and Filter Panel */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search shipments, origins, destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: '1',
              minWidth: '250px',
              padding: '10px 16px',
              fontSize: '14px',
              border: `2px solid ${theme.colors.border}`,
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
            onBlur={(e) => e.target.style.borderColor = theme.colors.border}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              border: `2px solid ${theme.colors.border}`,
              borderRadius: '8px',
              backgroundColor: theme.colors.white,
              cursor: 'pointer'
            }}
          >
            <option value="All">All Statuses</option>
            <option value="On Track">On Track</option>
            <option value="In Transit">In Transit</option>
            <option value="At Risk">At Risk</option>
            <option value="Delayed">Delayed</option>
          </select>

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              border: `2px solid ${theme.colors.border}`,
              borderRadius: '8px',
              backgroundColor: theme.colors.white,
              cursor: 'pointer'
            }}
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High Risk (&gt;70%)</option>
            <option value="Medium">Medium Risk (40-70%)</option>
            <option value="Low">Low Risk (&lt;40%)</option>
          </select>

          <div style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: theme.colors.primary,
            backgroundColor: theme.colors.backgroundLight,
            borderRadius: '8px'
          }}>
            {filteredShipments.length} of {shipmentTracking.length} shipments
          </div>
        </div>
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
          {/* Route lines showing shipment path - only show at zoom >= 3 */}
          {zoom >= 3 && filteredShipments.map((ship) => {
            const lineColor = getLatenessColor(ship.lateness_probability);

            return (
              <g key={`route-lines-${ship.id}`}>
                {/* Line from origin to current position (completed) */}
                <Overlay anchor={[ship.origin_lat, ship.origin_lon]}>
                  <svg width="2000" height="2000" style={{ position: 'absolute', top: '-1000px', left: '-1000px', pointerEvents: 'none', overflow: 'visible' }}>
                    <line
                      x1="1000"
                      y1="1000"
                      x2={1000 + (ship.current_lon - ship.origin_lon) * 100}
                      y2={1000 + (ship.current_lat - ship.origin_lat) * 100}
                      stroke={lineColor}
                      strokeWidth="3"
                      strokeOpacity="0.7"
                    />
                  </svg>
                </Overlay>
                {/* Line from current to destination (remaining) - dashed */}
                <Overlay anchor={[ship.current_lat, ship.current_lon]}>
                  <svg width="2000" height="2000" style={{ position: 'absolute', top: '-1000px', left: '-1000px', pointerEvents: 'none', overflow: 'visible' }}>
                    <line
                      x1="1000"
                      y1="1000"
                      x2={1000 + (ship.dest_lon - ship.current_lon) * 100}
                      y2={1000 + (ship.dest_lat - ship.current_lat) * 100}
                      stroke={lineColor}
                      strokeWidth="3"
                      strokeDasharray="10,10"
                      strokeOpacity="0.5"
                    />
                  </svg>
                </Overlay>
              </g>
            );
          })}

          {/* Origin markers - Ship icons - only show at zoom >= 4 */}
          {zoom >= 4 && filteredShipments.map((ship) => (
            <Marker
              key={`origin-${ship.id}`}
              anchor={[ship.origin_lat, ship.origin_lon]}
              onClick={() => setSelectedShipment(ship)}
            >
              <div style={{ cursor: 'pointer' }} title={`Origin: ${ship.origin}`}>
                <svg width="28" height="28" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                  <path
                    d="M12 2L3 10v12h18V10l-9-8z"
                    fill="#34495e"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <circle cx="12" cy="14" r="3" fill="white" opacity="0.8" />
                  <text x="12" y="16" textAnchor="middle" fontSize="6" fill="#34495e" fontWeight="bold">🚢</text>
                </svg>
              </div>
            </Marker>
          ))}

          {/* Destination markers - Mexico flag pins - only show at zoom >= 4 */}
          {zoom >= 4 && filteredShipments.map((ship) => (
            <Marker
              key={`dest-${ship.id}`}
              anchor={[ship.dest_lat, ship.dest_lon]}
              onClick={() => setSelectedShipment(ship)}
            >
              <div style={{ cursor: 'pointer', position: 'relative', top: '-30px' }} title={`Destination: ${ship.destination}`}>
                <svg width="24" height="36" viewBox="0 0 24 36" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }}>
                  {/* Flag pole */}
                  <line x1="2" y1="0" x2="2" y2="36" stroke="#8b4513" strokeWidth="2" />
                  {/* Mexico flag */}
                  <g>
                    <rect x="2" y="2" width="20" height="12" fill="#006847" />
                    <rect x="8.67" y="2" width="6.67" height="12" fill="white" />
                    <rect x="15.33" y="2" width="6.67" height="12" fill="#ce1126" />
                    {/* Eagle emblem simplified */}
                    <circle cx="12" cy="8" r="2" fill="#8b4513" />
                  </g>
                  {/* Pin point */}
                  <circle cx="2" cy="36" r="2" fill="#c0392b" />
                </svg>
              </div>
            </Marker>
          ))}

          {/* Current position markers with lateness probability */}
          {filteredShipments.map((ship) => (
            <Marker
              key={`current-${ship.id}`}
              anchor={[ship.current_lat, ship.current_lon]}
              onClick={() => setSelectedShipment(ship)}
            >
              <div
                style={{ position: 'relative', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredShipment(ship)}
                onMouseLeave={() => setHoveredShipment(null)}
              >
                {/* Pulsing ring for high lateness probability */}
                {ship.lateness_probability >= 70 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '-10px',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: `3px solid ${getLatenessColor(ship.lateness_probability)}`,
                      animation: 'pulse 2s infinite',
                      opacity: 0.6
                    }}
                  />
                )}
                {/* Main marker */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: getLatenessColor(ship.lateness_probability),
                    border: '3px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                  title={`${ship.id} - Lateness: ${ship.lateness_probability}%`}
                >
                  {Math.round(ship.lateness_probability)}
                </div>
              </div>
            </Marker>
          ))}

          {/* Show popup for selected shipment */}
          {selectedShipment && (
            <Overlay
              anchor={[selectedShipment.current_lat, selectedShipment.current_lon]}
              offset={[0, -60]}
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
                  <span style={styles.popupLabel}>Lateness Risk:</span>
                  <span style={{
                    color: getLatenessColor(selectedShipment.lateness_probability),
                    fontWeight: 'bold'
                  }}>
                    {selectedShipment.lateness_probability}%
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

          {/* Hover tooltip (compact info on hover) */}
          {hoveredShipment && !selectedShipment && (
            <Overlay
              anchor={[hoveredShipment.current_lat, hoveredShipment.current_lon]}
              offset={[0, -45]}
            >
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.85)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                minWidth: '180px',
                animation: 'fadeIn 0.2s ease-in',
                pointerEvents: 'none'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px', color: theme.colors.warning }}>{hoveredShipment.id}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ opacity: 0.9 }}>Status:</span>
                  <span style={{ fontWeight: 'bold', color: getStatusColor(hoveredShipment.status) }}>{hoveredShipment.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ opacity: 0.9 }}>Risk:</span>
                  <span style={{ fontWeight: 'bold', color: getLatenessColor(hoveredShipment.lateness_probability) }}>
                    {hoveredShipment.lateness_probability}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.9 }}>Progress:</span>
                  <span>{hoveredShipment.progress}%</span>
                </div>
                <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: '10px', opacity: 0.8 }}>
                  Click for details
                </div>
              </div>
            </Overlay>
          )}
        </Map>
      </div>

      <div style={styles.legend}>
        <div style={{ ...styles.legendItem, borderRight: `2px solid ${theme.colors.border}`, paddingRight: theme.spacing.xl }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#2c3e50', border: '2px solid white', transform: 'rotate(45deg)' }} />
          <span style={styles.legendLabel}>Origin Port</span>
        </div>
        <div style={{ ...styles.legendItem, borderRight: `2px solid ${theme.colors.border}`, paddingRight: theme.spacing.xl }}>
          <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '18px solid #e74c3c', marginLeft: '5px' }} />
          <span style={styles.legendLabel}>Destination</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendLabel, fontWeight: 'bold', marginRight: theme.spacing.md }}>Lateness Risk:</span>
        </div>
        <div style={styles.legendItem}>
          <div style={styles.legendDot(theme.colors.success)} />
          <span style={styles.legendLabel}>Low (&lt;20%)</span>
        </div>
        <div style={styles.legendItem}>
          <div style={styles.legendDot('#3498db')} />
          <span style={styles.legendLabel}>Med-Low (20-40%)</span>
        </div>
        <div style={styles.legendItem}>
          <div style={styles.legendDot(theme.colors.warning)} />
          <span style={styles.legendLabel}>Medium (40-70%)</span>
        </div>
        <div style={styles.legendItem}>
          <div style={styles.legendDot(theme.colors.danger)} />
          <span style={styles.legendLabel}>High (&gt;70%)</span>
        </div>
      </div>
    </div>
  );
}

export default MapView;
