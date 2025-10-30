import { theme } from '../styles/theme';

function AlertsPanel({ alerts }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
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

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
      borderBottom: `2px solid ${theme.colors.primary}`,
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm
    },
    badge: {
      backgroundColor: theme.colors.danger,
      color: theme.colors.white,
      borderRadius: '12px',
      padding: '2px 8px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    alertItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderBottom: `1px solid ${theme.colors.border}`,
      transition: 'background-color 0.2s'
    },
    severityIndicator: (severity) => ({
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: getSeverityColor(severity),
      marginTop: '6px',
      flexShrink: 0
    }),
    alertContent: {
      flex: 1
    },
    alertMessage: {
      fontSize: '14px',
      color: theme.colors.text,
      margin: 0,
      marginBottom: '4px'
    },
    alertMeta: {
      display: 'flex',
      gap: theme.spacing.md,
      fontSize: '12px',
      color: theme.colors.textLight
    },
    severityLabel: (severity) => ({
      fontWeight: '600',
      color: getSeverityColor(severity)
    })
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>
        Critical Alerts
        <span style={styles.badge}>{alerts.length}</span>
      </h2>
      <div>
        {alerts.map((alert) => (
          <div key={alert.id} style={styles.alertItem}>
            <div style={styles.severityIndicator(alert.severity)} />
            <div style={styles.alertContent}>
              <p style={styles.alertMessage}>{alert.message}</p>
              <div style={styles.alertMeta}>
                <span style={styles.severityLabel(alert.severity)}>
                  {alert.severity} Priority
                </span>
                <span>•</span>
                <span>{formatTime(alert.timestamp)}</span>
                {alert.shipmentId && (
                  <>
                    <span>•</span>
                    <span>{alert.shipmentId}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertsPanel;
