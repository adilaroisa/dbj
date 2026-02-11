import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './auth/Login'; 
import Register from './auth/Register';
import Dashboard from './components/Dashboard';
import ImportJurnal from './components/ImportJurnal'; 
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/login') document.title = 'Login - Database Jurnal DIY';
    else if (location.pathname === '/register') document.title = 'Daftar - Database Jurnal DIY';
    else if (location.pathname === '/dashboard') document.title = 'Dashboard Admin';
    else if (location.pathname === '/import-jurnal') document.title = 'Import Excel - Admin';
  }, [location]);

  const handleLoginSuccess = () => {
    const newToken = localStorage.getItem('token');
    setToken(newToken); 
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setToken(null); 
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={!token ? <Login onLogin={handleLoginSuccess} onSwitchToRegister={() => navigate('/register')} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!token ? <Register onSwitchToLogin={() => navigate('/login')} /> : <Navigate to="/dashboard" />} />

        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard onLogout={handleLogout} />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/import-jurnal" 
          element={
            <PrivateRoute>
              <ImportJurnal onLogout={handleLogout} />
            </PrivateRoute>
          } 
        />

        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;