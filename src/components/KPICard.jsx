import { theme } from '../styles/theme';

function KPICard({ title, value, unit, trend, icon }) {
  const styles = {
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.border}`,
      transition: 'transform 0.2s',
      cursor: 'pointer',
      ':hover': {
        transform: 'translateY(-2px)'
      }
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md
    },
    title: {
      fontSize: '14px',
      color: theme.colors.textLight,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      margin: 0
    },
    icon: {
      fontSize: '24px'
    },
    value: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: theme.colors.text,
      margin: '8px 0'
    },
    unit: {
      fontSize: '18px',
      color: theme.colors.textLight,
      marginLeft: '4px'
    },
    trend: {
      fontSize: '12px',
      color: trend === 'up' ? theme.colors.success : theme.colors.danger,
      marginTop: theme.spacing.sm
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>{title}</h3>
        {icon && <span style={styles.icon}>{icon}</span>}
      </div>
      <div>
        <span style={styles.value}>
          {value}
          {unit && <span style={styles.unit}>{unit}</span>}
        </span>
      </div>
      {trend && (
        <div style={styles.trend}>
          {trend === 'up' ? '↑' : '↓'} {trend === 'up' ? 'Increase' : 'Decrease'}
        </div>
      )}
    </div>
  );
}

export default KPICard;
