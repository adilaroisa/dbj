import React, { useState, useEffect } from 'react';
import { getJurnals, syncSinta, deleteJurnal } from '../services/apiClient';
import Swal from 'sweetalert2'; 
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
            
            let dataArray = [];
            if (Array.isArray(response.data)) {
                dataArray = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                dataArray = response.data.data;
            }

            setJurnals(dataArray);

        } catch (err) {
            console.error("Gagal mengambil data:", err);
            // Alert menggunakan SweetAlert
            Swal.fire({
                icon: 'error',
                title: 'Gagal Memuat Data',
                text: 'Periksa koneksi ke server backend.',
            });
        } finally {
            setLoading(false);
        }
    };

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
        if (!issn) {
            Swal.fire('Peringatan', 'ISSN kosong, tidak bisa sinkronisasi!', 'warning');
            return;
        }
        try {
            const btn = document.getElementById(`sync-${id}`);
            if(btn) btn.innerText = "⏳";
            
            const res = await syncSinta(id);
            
            await fetchData(); 
            
            Swal.fire({
                icon: 'success',
                title: 'Sinkronisasi Selesai',
                text: res.data?.message || 'Data berhasil diperbarui dari Sinta.',
                timer: 2000,
                showConfirmButton: false
            });
            
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Sync',
                text: err.response?.data?.message || err.message,
            });
        }
    };

    // --- FUNGSI DELETE MENGGUNAKAN SWEETALERT2 ---
    const handleDelete = async (id, namaJurnal) => {
        // Tampilkan popup konfirmasi yang elegan
        const result = await Swal.fire({
            title: 'Hapus Jurnal?',
            html: `Kamu yakin ingin menghapus data <b>${namaJurnal}</b>?<br/>Tindakan ini tidak dapat dibatalkan!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            reverseButtons: true // Tombol batal di kiri (lebih aman)
        });

        // Jika user klik "Ya, Hapus!"
        if (result.isConfirmed) {
            try {
                await deleteJurnal(id);
                await fetchData(); // Refresh data
                
                // Alert Sukses
                Swal.fire({
                    icon: 'success',
                    title: 'Terhapus!',
                    text: 'Data jurnal telah dihapus.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Delete Error:", err);
                
                // Alert Gagal (Menampilkan detail error 400 dll)
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Menghapus',
                    text: err.response?.data?.message || 'Terjadi kesalahan pada server.',
                });
            }
        }
    };

    const handleLogoutClick = () => {
        // Konfirmasi Logout juga pakai SweetAlert
        Swal.fire({
            title: 'Keluar dari Sistem?',
            text: "Sesi kamu akan diakhiri.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#FF8A00',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Ya, Logout',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                if (onLogout) onLogout();
            }
        });
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
                        <span className="icon">📊</span> Dashboard
                    </a>
                    <a href="/add-jurnal" className="menu-item">
                        <span className="icon">📝</span> Input Manual
                    </a>
                    <a href="/import-jurnal" className="menu-item">
                        <span className="icon">📂</span> Import Excel
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogoutClick} className="btn-logout-side">
                        🚪 Logout
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <div className="top-bar-left">
                        <h3>Data Jurnal Terdaftar</h3>
                        <p>Total: {filteredJurnals.length} Jurnal</p>
                    </div>
                    
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
                                                
                                                {/* PERUBAHAN DI SINI: Kita juga mengirimkan nama jurnal untuk ditampilkan di alert */}
                                                <button onClick={() => handleDelete(jurnal.id, jurnal.nama)} className="btn-delete" title="Hapus">🗑️</button>
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