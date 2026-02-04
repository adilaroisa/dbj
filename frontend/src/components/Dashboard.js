import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Butuh ini buat logout
import { getJurnals, syncSinta, deleteJurnal, importExcel } from '../services/api';
import '../styles/dashboard.css'; // Pastikan CSS-nya diload

const Dashboard = () => {
    const [jurnals, setJurnals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            setUploading(true);
            const res = await importExcel(formData);
            alert(res.data.message);
            fetchData(); 
        } catch (err) {
            alert('Gagal Import: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
            e.target.value = null; 
        }
    };

    const handleSync = async (id, issn) => {
        if (!issn) return alert('ISSN kosong, tidak bisa sync!');
        try {
            const btn = document.getElementById(`sync-${id}`);
            if(btn) btn.innerText = "⏳...";
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

    // Fungsi Logout (Pindah ke sini karena Sidebar ada di sini)
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="dashboard-layout">
            {/* --- SIDEBAR ADMIN --- */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Jurnal DIY</h2>
                    <span className="badge-admin">Admin Panel</span>
                </div>
                
                <nav className="sidebar-menu">
                    <a href="#" className="menu-item active">
                        <span className="icon">📊</span> Dashboard
                    </a>
                    <a href="/add-jurnal" className="menu-item">
                        <span className="icon">📝</span> Input Manual
                    </a>
                    <div className="menu-item" onClick={() => fileInputRef.current.click()}>
                        <span className="icon">📂</span> Import Excel
                    </div>
                    {/* Input File Hidden */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                    />
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="btn-logout-side">
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT (KANAN) --- */}
            <main className="main-content">
                <header className="top-bar">
                    <h3>Data Jurnal Terdaftar</h3>
                    <div className="user-profile">
                        <span>👋 Halo, Admin</span>
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
                                <tr><td colSpan="6" className="loading-overlay">Memuat data...</td></tr>
                            ) : jurnals.length > 0 ? (
                                jurnals.map((jurnal, index) => (
                                    <tr key={jurnal.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="jurnal-info">
                                                <a href={jurnal.url || '#'} target="_blank" rel="noreferrer" className="jurnal-link">
                                                    {jurnal.nama}
                                                </a>
                                                <small>{jurnal.penerbit || '-'}</small>
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
                                <tr><td colSpan="6" align="center">Data kosong. Silakan import atau input manual.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;