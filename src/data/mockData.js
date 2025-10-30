export const kpiData = {
  totalShipments: 1247,
  onTimeRate: 94.5,
  activeOrders: 342,
  criticalAlerts: 7,
  inventoryHealth: 87.3
};

export const shipments = [
  {
    id: 'SH-2024-001',
    origin: 'Shanghai, China',
    destination: 'Los Angeles, USA',
    status: 'In Transit',
    eta: '2025-11-02',
    priority: 'High',
    carrier: 'Maersk Line'
  },
  {
    id: 'SH-2024-002',
    origin: 'Rotterdam, Netherlands',
    destination: 'New York, USA',
    status: 'Delayed',
    eta: '2025-11-01',
    priority: 'Critical',
    carrier: 'MSC'
  },
  {
    id: 'SH-2024-003',
    origin: 'Singapore',
    destination: 'Dubai, UAE',
    status: 'In Transit',
    eta: '2025-10-31',
    priority: 'Medium',
    carrier: 'CMA CGM'
  },
  {
    id: 'SH-2024-004',
    origin: 'Hamburg, Germany',
    destination: 'Boston, USA',
    status: 'On Track',
    eta: '2025-11-05',
    priority: 'Low',
    carrier: 'Hapag-Lloyd'
  },
  {
    id: 'SH-2024-005',
    origin: 'Hong Kong',
    destination: 'Vancouver, Canada',
    status: 'In Transit',
    eta: '2025-11-03',
    priority: 'High',
    carrier: 'COSCO'
  },
  {
    id: 'SH-2024-006',
    origin: 'Tokyo, Japan',
    destination: 'Seattle, USA',
    status: 'At Risk',
    eta: '2025-11-04',
    priority: 'Medium',
    carrier: 'ONE'
  }
];

export const alerts = [
  {
    id: 'ALT-001',
    severity: 'High',
    message: 'Shipment SH-2024-002 delayed due to port congestion',
    timestamp: '2025-10-29T14:30:00',
    shipmentId: 'SH-2024-002'
  },
  {
    id: 'ALT-002',
    severity: 'Medium',
    message: 'Weather alert affecting routes in Pacific Northwest',
    timestamp: '2025-10-29T12:15:00',
    shipmentId: null
  },
  {
    id: 'ALT-003',
    severity: 'High',
    message: 'Customs clearance issue for SH-2024-006',
    timestamp: '2025-10-29T10:45:00',
    shipmentId: 'SH-2024-006'
  },
  {
    id: 'ALT-004',
    severity: 'Low',
    message: 'Carrier schedule change - MSC line delayed by 6 hours',
    timestamp: '2025-10-29T09:00:00',
    shipmentId: null
  }
];
