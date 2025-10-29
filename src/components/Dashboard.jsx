import { useState, useEffect } from 'react';
import KPICard from './KPICard';
import ShipmentsTable from './ShipmentsTable';
import AlertsPanel from './AlertsPanel';
import { theme } from '../styles/theme';

function Dashboard() {
  const [kpiData, setKpiData] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/data/kpis.json').then(res => res.json()),
      fetch('/data/shipments.json').then(res => res.json()),
      fetch('/data/alerts.json').then(res => res.json())
    ])
      .then(([kpis, shipmentsData, alertsData]) => {
        setKpiData(kpis);
        setShipments(shipmentsData);
        setAlerts(alertsData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setLoading(false);
      });
  }, []);

  const styles = {
    container: {
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.backgroundLight
    },
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.xl
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: theme.spacing.lg
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.kpiGrid}>
        <KPICard
          title="Total Shipments"
          value={kpiData.totalShipments}
          icon="📦"
          trend="up"
        />
        <KPICard
          title="On-Time Rate"
          value={kpiData.onTimeRate}
          unit="%"
          icon="✓"
          trend="up"
        />
        <KPICard
          title="Active Orders"
          value={kpiData.activeOrders}
          icon="🚚"
        />
        <KPICard
          title="Critical Alerts"
          value={kpiData.criticalAlerts}
          icon="⚠"
          trend="down"
        />
        <KPICard
          title="Inventory Health"
          value={kpiData.inventoryHealth}
          unit="%"
          icon="📊"
        />
      </div>

      <div style={styles.contentGrid}>
        <div>
          <ShipmentsTable shipments={shipments} />
        </div>
        <div>
          <AlertsPanel alerts={alerts} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
