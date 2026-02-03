import React, { useState } from 'react'; 
import JurnalTable from './components/JurnalTable';
import Login from './components/login'; 
import './App.css';

function App() {
  // 1. State untuk menyimpan status login (berdasarkan token)
  const [token, setToken] = useState(localStorage.getItem('token'));

  // 2. Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Hapus token dari memori
    setToken(null); // Reset state agar tampilan kembali ke Login
  };


  if (!token) {
    return (
      <div className="app-container">
        <Login onLogin={() => setToken(localStorage.getItem('token'))} />
      </div>
    );
  }

  // 4. Jika Token ADA (Sudah Login), baru tampilkan Dashboard Utama
  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>Database Jurnal D.I. Yogyakarta</h1>
          <p className="subtitle">Admin Dashboard</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Keluar (Logout)
        </button>
      </header>

      <main className="main-content">
        <JurnalTable isAdmin={true} />
      </main>
    </div>
  );
}

export default App;