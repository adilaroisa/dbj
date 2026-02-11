import React, { useState, useEffect, useRef } from 'react';
import { getJurnals, syncSinta, deleteJurnal } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = ({ onLogout }) => {
    const [jurnals, setJurnals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('Admin');
    
    // STATE SEARCH
    const [searchTerm, setSearchTerm] = useState(''); 

    useEffect(() => {
        const storedUser = localStorage.getItem('username');
        if (storedUser) {
            setUsername(storedUser.charAt(0).toUpperCase() + storedUser.slice(1));
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getJurnals();
            setJurnals(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // LOGIKA FILTER SEARCH
    const filteredJurnals = jurnals.filter((jurnal) => {
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        
        return (
            jurnal.nama?.toLowerCase().includes(lowerSearch) ||
            jurnal.penerbit?.toLowerCase().includes(lowerSearch) ||
            jurnal.issn?.includes(lowerSearch)
        );
    });

    const handleSync = async (id, issn) => {
        if (!issn) return alert('ISSN kosong, tidak bisa sync!');
        try {
            const btn = document.getElementById(`sync-${id}`);
            if(btn) btn.innerText = "";
            await syncSinta(id);
            await fetchData(); 
            alert('Sinkronisasi Selesai!');
        } catch (err) {
            alert('Gagal Sync: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin hapus jurnal ini?')) {
            await deleteJurnal(id);
            fetchData();
        }
    };

    const handleLogoutClick = () => {
        if (onLogout) onLogout();
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Jurnal DIY</h2>
                    <span className="badge-admin">Admin Panel</span>
                </div>
                
                <nav className="sidebar-menu">
                    <a href="#" className="menu-item active">
                        <span className="icon"></span> Dashboard
                    </a>
                    <a href="/add-jurnal" className="menu-item">
                        <span className="icon"></span> Input Manual
                    </a>
                    <a href="/import-jurnal" className="menu-item">
                        <span className="icon"></span> Import Excel
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogoutClick} className="btn-logout-side">
                         Logout
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <div className="top-bar-left">
                        <h3>Data Jurnal Terdaftar</h3>
                        <p>Total: {filteredJurnals.length} Jurnal</p>
                    </div>
                    
                    {/* SEARCH BAR BARU */}
                    <div className="search-container">
                        <input 
                            type="text" 
                            placeholder="🔍 Cari Jurnal, Kampus, atau ISSN..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="user-profile">
                        <span>👋 Halo, {username}</span>
                    </div>
                </header>

                <div className="content-wrapper">
                    <table className="jurnal-table">
                        <thead>
                            <tr>
                                <th width="5%">No</th>
                                <th width="30%">Jurnal & Institusi</th>
                                <th width="15%">Validasi ISSN</th>
                                <th width="15%">Akreditasi</th>
                                <th width="20%">Kontak</th>
                                <th width="15%">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="loading-overlay">Memuat database...</td></tr>
                            ) : filteredJurnals.length > 0 ? (
                                filteredJurnals.map((jurnal, index) => (
                                    <tr key={jurnal.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="jurnal-info">
                                                <a href={jurnal.url || '#'} target="_blank" rel="noreferrer" className="jurnal-link">
                                                    {jurnal.nama}
                                                </a>
                                                <div className="institusi-badge">
                                                    🏫 {jurnal.penerbit || 'Umum / Lainnya'}
                                                </div>
                                                
                                                {jurnal.member_doi_rji && <span className="badge-rji">Member RJI</span>}
                                                
                                                {jurnal.url_garuda && (
                                                    <a href={jurnal.url_garuda} target="_blank" rel="noreferrer" className="link-external-garuda">
                                                        🦅 Garuda
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {jurnal.issn ? (
                                                <div className="issn-box">
                                                    <span className="issn-code">{jurnal.issn}</span>
                                                    <a href={`https://portal.issn.org/resource/ISSN/${jurnal.issn}`} target="_blank" rel="noreferrer" className="link-validasi">
                                                        ✅ Cek Validitas
                                                    </a>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            <span className={`badge-sinta ${jurnal.akreditasi ? jurnal.akreditasi.replace(' ', '') : 'na'}`}>
                                                {jurnal.akreditasi || 'Belum'}
                                            </span>
                                            {jurnal.url_sinta && (
                                                <a href={jurnal.url_sinta} target="_blank" rel="noreferrer" className="link-sinta-small">
                                                    🔗 Sinta
                                                </a>
                                            )}
                                        </td>
                                        <td>
                                            <div className="contact-info">
                                                {jurnal.email && <div>📧 {jurnal.email}</div>}
                                                {jurnal.kontak && <div>📱 {jurnal.kontak}</div>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button id={`sync-${jurnal.id}`} onClick={() => handleSync(jurnal.id, jurnal.issn)} className="btn-sync" title="Sync">🔄</button>
                                                <button onClick={() => handleDelete(jurnal.id)} className="btn-delete" title="Hapus">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" align="center" style={{padding: '40px', color: '#888'}}>
                                        {searchTerm ? 'Pencarian tidak ditemukan 🔍' : 'Data kosong.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;