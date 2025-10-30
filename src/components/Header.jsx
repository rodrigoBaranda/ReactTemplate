import { NavLink } from 'react-router-dom';
import { theme } from '../styles/theme';

function Header() {
  const styles = {
    header: {
      backgroundColor: theme.colors.white,
      borderBottom: `3px solid ${theme.colors.primary}`,
      padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
      boxShadow: theme.shadows.sm
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.md
    },
    accentBar: {
      width: '40px',
      height: '40px',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      color: theme.colors.white
    },
    title: {
      margin: 0,
      fontSize: '24px',
      fontWeight: '600',
      color: theme.colors.text
    },
    subtitle: {
      margin: 0,
      fontSize: '14px',
      color: theme.colors.textLight,
      marginTop: '4px'
    },
    nav: {
      display: 'flex',
      gap: theme.spacing.lg
    },
    navLink: {
      textDecoration: 'none',
      color: theme.colors.text,
      fontWeight: '500',
      fontSize: '16px',
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      borderRadius: theme.borderRadius.sm,
      transition: 'all 0.2s'
    }
  };

  const getNavLinkStyle = ({ isActive }) => ({
    ...styles.navLink,
    backgroundColor: isActive ? theme.colors.primary : 'transparent',
    color: isActive ? theme.colors.white : theme.colors.text
  });

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.logo}>
          <div style={styles.accentBar}>&gt;</div>
          <div>
            <h1 style={styles.title}>Supply Chain Control Tower</h1>
            <p style={styles.subtitle}>Real-time visibility and monitoring</p>
          </div>
        </div>
        <nav style={styles.nav}>
          <NavLink to="/" style={getNavLinkStyle} end>
            Dashboard
          </NavLink>
          <NavLink to="/map" style={getNavLinkStyle}>
            Map
          </NavLink>
          <NavLink to="/analytics" style={getNavLinkStyle}>
            Analytics
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
