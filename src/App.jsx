import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Landing from './components/Landing/Landing';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import AdvisoryForm from './components/Advisory/AdvisoryForm';
import AdvisoryResult from './components/Advisory/AdvisoryResult';
import MarketPrices from './components/Market/MarketPrices';
import Feedback from './components/Feedback/Feedback';
import DebugSignup from './components/Debug/DebugSignup';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="App">
      {!isLandingPage && <Navigation />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/debug" element={<DebugSignup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/advisory" element={<AdvisoryForm />} />
        <Route path="/result" element={<AdvisoryResult />} />
        <Route path="/market" element={<MarketPrices />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
