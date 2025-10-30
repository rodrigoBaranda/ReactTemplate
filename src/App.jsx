import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import AnalyticsView from './components/AnalyticsView';
import { theme } from './styles/theme';

function App() {
  const styles = {
    app: {
      minHeight: '100vh',
      backgroundColor: theme.colors.backgroundLight,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }
  };

  return (
    <Router>
      <div style={styles.app}>
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/analytics" element={<AnalyticsView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
