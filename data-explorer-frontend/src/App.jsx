import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Insights from './pages/Insights';
import Visualizations from './pages/Visualizations';
import Explore from './pages/Explore';

const App = () => {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flexGrow: 1, padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/visualizations" element={<Visualizations />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
