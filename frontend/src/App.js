import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/login'; 
import Register from './components/register'; 
import Dashboard from './components/dashboard'; 
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();
  const location = useLocation();

  // Update Judul Tab Browser
  useEffect(() => {
    if (location.pathname === '/login') document.title = 'Login - Database Jurnal DIY';
    else if (location.pathname === '/register') document.title = 'Daftar - Database Jurnal DIY';
    else if (location.pathname === '/dashboard') document.title = 'Dashboard Admin';
  }, [location]);

  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('token'));
    navigate('/dashboard');
  };

  // Private Route Wrapper
  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      {/* PENTING: Header lama SUDAH DIHAPUS di sini.
         Sekarang layout ditangani sepenuhnya oleh masing-masing halaman (Dashboard/Login).
      */}
      
      <Routes>
        {/* Rute Login */}
        <Route 
          path="/login" 
          element={!token ? <Login onLogin={handleLoginSuccess} onSwitchToRegister={() => navigate('/register')} /> : <Navigate to="/dashboard" />} 
        />

        {/* Rute Register */}
        <Route 
          path="/register" 
          element={!token ? <Register onSwitchToLogin={() => navigate('/login')} /> : <Navigate to="/dashboard" />} 
        />

        {/* Rute Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        {/* Input Manual (Disiapkan) */}
        {/* <Route 
          path="/add-jurnal" 
          element={<PrivateRoute><AddJurnal /></PrivateRoute>} 
        /> 
        */}

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;