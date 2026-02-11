import React, { useState, useEffect } from 'react';
import { getJurnals, syncSinta, deleteJurnal, updateJurnal } from '../services/apiClient';
import Swal from 'sweetalert2';
import Sidebar from '../components/Sidebar'; // <-- KITA PANGGIL KOMPONEN SIDEBAR
import '../styles/Dashboard.css';

const Dashboard = ({ onLogout }) => {
    const [jurnals, setJurnals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('Admin');
    const [searchTerm, setSearchTerm] = useState(''); 

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('username');
        if (storedUser) setUsername(storedUser.charAt(0).toUpperCase() + storedUser.slice(1));
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getJurnals();
            let dataArray = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            setJurnals(dataArray);
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal Memuat Data', text: 'Periksa koneksi server.' });
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
        if (!issn) return Swal.fire('Peringatan', 'ISSN kosong!', 'warning');
        try {
            document.getElementById(`sync-${id}`).innerText = "⏳";
            const res = await syncSinta(id);
            await fetchData(); 
            Swal.fire({ icon: 'success', title: 'Sync Selesai', text: res.data?.message, timer: 2000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal Sync', text: err.response?.data?.message || err.message });
            document.getElementById(`sync-${id}`).innerText = "🔄";
        }
    };

    const handleDelete = async (id, namaJurnal) => {
        const result = await Swal.fire({
            title: 'Hapus Jurnal?', html: `Hapus data <b>${namaJurnal}</b>?`,
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6', confirmButtonText: 'Ya, Hapus!'
        });
        if (result.isConfirmed) {
            try {
                await deleteJurnal(id);
                await fetchData(); 
                Swal.fire({ icon: 'success', title: 'Terhapus!', timer: 1500, showConfirmButton: false });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Gagal Menghapus', text: err.response?.data?.message });
            }
        }
    };

    // FUNGSI EDIT
    const handleEditClick = (jurnal) => {
        setEditData(jurnal); setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData({ ...editData, [name]: name === 'member_doi_rji' ? value === 'true' : value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateJurnal(editData.id, editData);
            setIsEditModalOpen(false); await fetchData();
            Swal.fire({ icon: 'success', title: 'Tersimpan!', timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal Edit', text: err.response?.data?.message });
        }
    };

    return (
        <div className="dashboard-layout">
            {/* SIDEBAR DITEMPELKAN DI SINI */}
            <Sidebar onLogout={onLogout} />

            <main className="main-content">
                <header className="top-bar" style={{marginLeft: '40px'}}>
                    <div className="top-bar-left">
                        <h3>Data Jurnal Terdaftar</h3>
                        <p>Total: {filteredJurnals.length} Jurnal</p>
                    </div>
                    <div className="search-container">
                        <input type="text" placeholder=" Cari Jurnal, Kampus, atau ISSN..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input"/>
                    </div>
                    <div className="user-profile"><span>👋 Halo, {username}</span></div>
                </header>

                <div className="content-wrapper">
                    <div className="table-responsive">
                        <table className="jurnal-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Jurnal</th>
                                    <th>URL</th>
                                    <th>Email</th>
                                    <th>Kontak</th>
                                    <th>Penerbit</th>
                                    <th>Member DOI RJI</th>
                                    <th>Akreditasi</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="9" align="center">Memuat database...</td></tr>
                                ) : filteredJurnals.length > 0 ? (
                                    filteredJurnals.map((jurnal, index) => (
                                        <tr key={jurnal.id}>
                                            <td style={{textAlign: 'center'}}>{index + 1}</td>
                                            <td style={{fontWeight: 'bold'}}>{jurnal.nama || '-'}</td>
                                            <td>{jurnal.url ? <a href={jurnal.url} target="_blank" rel="noreferrer">🌐 Web</a> : '-'}</td>
                                            <td>{jurnal.email || '-'}</td>
                                            <td>{jurnal.kontak || '-'}</td>
                                            <td>{jurnal.penerbit || '-'}</td>
                                            <td style={{textAlign: 'center'}}>
                                                {jurnal.member_doi_rji ? <span className="badge-rji">Ya</span> : 'Tidak'}
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                <span className={`badge-sinta ${jurnal.akreditasi ? jurnal.akreditasi.replace(' ', '') : 'na'}`}>
                                                    {jurnal.akreditasi || 'Belum'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button onClick={() => handleEditClick(jurnal)} className="btn-edit" title="Edit">✏️</button>
                                                    <button id={`sync-${jurnal.id}`} onClick={() => handleSync(jurnal.id, jurnal.issn)} className="btn-sync" title="Sync Sinta">🔄</button>
                                                    <button onClick={() => handleDelete(jurnal.id, jurnal.nama)} className="btn-delete" title="Hapus">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="9" align="center">Data kosong.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* MODAL EDIT */}
            {isEditModalOpen && editData && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3> Edit Data Jurnal</h3>
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label>Nama Jurnal</label>
                                <input type="text" name="nama" value={editData.nama || ''} onChange={handleEditChange} required />
                            </div>
                            <div className="form-group">
                                <label>Penerbit / Institusi</label>
                                <input type="text" name="penerbit" value={editData.penerbit || ''} onChange={handleEditChange} required />
                            </div>
                            <div className="form-group-row">
                                <div className="form-group">
                                    <label>ISSN</label>
                                    <input type="text" name="issn" value={editData.issn || ''} onChange={handleEditChange} />
                                </div>
                                <div className="form-group">
                                    <label>Member DOI RJI</label>
                                    <select name="member_doi_rji" value={editData.member_doi_rji} onChange={handleEditChange}>
                                        <option value={true}>Ya</option>
                                        <option value={false}>Tidak</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={editData.email || ''} onChange={handleEditChange} />
                                </div>
                                <div className="form-group">
                                    <label>Kontak (WA/HP)</label>
                                    <input type="text" name="kontak" value={editData.kontak || ''} onChange={handleEditChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>URL Website Utama</label>
                                <input type="url" name="url" value={editData.url || ''} onChange={handleEditChange} />
                            </div>

                            {/* TAMBAHAN UNTUK EDIT AKREDITASI MANUAL */}
                            <div className="form-group-row">
                                <div className="form-group">
                                    <label>Akreditasi (Contoh: Sinta 2)</label>
                                    <input type="text" name="akreditasi" value={editData.akreditasi || ''} onChange={handleEditChange} placeholder="Kosongkan jika ingin auto-sync" />
                                </div>
                                <div className="form-group">
                                    <label>URL Profil Sinta</label>
                                    <input type="url" name="url_sinta" value={editData.url_sinta || ''} onChange={handleEditChange} placeholder="https://sinta..." />
                                </div>
                            </div>
                            
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Batal</button>
                                <button type="submit" className="btn-save">💾 Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;