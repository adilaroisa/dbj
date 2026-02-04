import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import JurnalTable from './components/dashboard';
import Login from './components/login'; 
import Register from './components/register'; 
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();
  const location = useLocation();

  // Efek samping: Update Judul Tab Browser sesuai Halaman
  useEffect(() => {
    if (location.pathname === '/login') document.title = 'Login - Database Jurnal DIY';
    else if (location.pathname === '/register') document.title = 'Daftar - Database Jurnal DIY';
    else if (location.pathname === '/dashboard') document.title = 'Dashboard - Database Jurnal DIY';
  }, [location]);

  // Fungsi Login Sukses
  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('token'));
    navigate('/dashboard'); // Pindah ke URL /dashboard
  };

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login'); // Pindah ke URL /login
  };

  // Komponen Pengaman (Private Route)
  // Kalau belum login tapi maksa buka /dashboard, tendang ke /login
  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      {/* Header hanya muncul jika SUDAH LOGIN (ada di Dashboard) */}
      {token && location.pathname === '/dashboard' && (
        <header className="App-header">
          <div className="header-content">
              <h1>Database Jurnal D.I. Yogyakarta</h1>
              <p className="subtitle">Admin Dashboard</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </header>
      )}

      <main className="main-content">
        <Routes>
          <Route 
            path="/login" 
            element={
              !token ? (
                <Login 
                  onLogin={handleLoginSuccess} 
                  onSwitchToRegister={() => navigate('/register')} 
                />
              ) : (
                <Navigate to="/dashboard" /> // Kalau udah login, jangan kasih buka login lagi
              )
            } 
          />

          {/* 2. Jalur Register */}
          <Route 
            path="/register" 
            element={
              !token ? (
                <Register 
                  onSwitchToLogin={() => navigate('/login')} 
                />
              ) : (
                <Navigate to="/dashboard" />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <JurnalTable isAdmin={true} />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={token ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;