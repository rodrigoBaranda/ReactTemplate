import { theme } from '../styles/theme';

function ShipmentsTable({ shipments }) {
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
      case 'High':
        return theme.colors.danger;
      case 'Medium':
        return theme.colors.warning;
      case 'Low':
        return theme.colors.success;
      default:
        return theme.colors.textLight;
    }
  };

  const styles = {
    container: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.border}`,
      marginTop: theme.spacing.lg
    },
    header: {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      borderBottom: `2px solid ${theme.colors.primary}`
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.backgroundLight,
      color: theme.colors.text,
      fontWeight: '600',
      fontSize: '14px',
      borderBottom: `2px solid ${theme.colors.border}`
    },
    td: {
      padding: theme.spacing.md,
      borderBottom: `1px solid ${theme.colors.border}`,
      fontSize: '14px',
      color: theme.colors.text
    },
    statusBadge: (status) => ({
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: `${getStatusColor(status)}15`,
      color: getStatusColor(status)
    }),
    priorityBadge: (priority) => ({
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: `${getPriorityColor(priority)}15`,
      color: getPriorityColor(priority)
    }),
    actionButton: {
      padding: '6px 16px',
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      border: 'none',
      borderRadius: theme.borderRadius.sm,
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Active Shipments</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Shipment ID</th>
            <th style={styles.th}>Origin</th>
            <th style={styles.th}>Destination</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>ETA</th>
            <th style={styles.th}>Priority</th>
            <th style={styles.th}>Carrier</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((shipment) => (
            <tr key={shipment.id}>
              <td style={styles.td}>{shipment.id}</td>
              <td style={styles.td}>{shipment.origin}</td>
              <td style={styles.td}>{shipment.destination}</td>
              <td style={styles.td}>
                <span style={styles.statusBadge(shipment.status)}>
                  {shipment.status}
                </span>
              </td>
              <td style={styles.td}>{shipment.eta}</td>
              <td style={styles.td}>
                <span style={styles.priorityBadge(shipment.priority)}>
                  {shipment.priority}
                </span>
              </td>
              <td style={styles.td}>{shipment.carrier}</td>
              <td style={styles.td}>
                <button style={styles.actionButton}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ShipmentsTable;
