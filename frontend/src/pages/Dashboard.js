import React, { useState, useEffect } from 'react';
import { getJurnals, syncSinta, deleteJurnal, updateJurnal } from '../services/apiClient';
import Swal from 'sweetalert2';
import Sidebar from '../components/Sidebar';
import '../styles/Dashboard.css'; // Pastikan case-nya sesuai nama file css kamu

const Dashboard = ({ onLogout }) => {
    const [jurnals, setJurnals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('Admin');
    const [searchTerm, setSearchTerm] = useState(''); 

    // STATE UNTUK EDIT TAMPILAN (BUKAN MODAL)
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [isFormDirty, setIsFormDirty] = useState(false); 

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

    // --- FUNGSI KLIK EDIT MODE (Tanpa Pop-Up) ---
    const handleEditClick = (jurnal) => {
        setEditData(jurnal); 
        setIsEditing(true); // Ganti tampilan ke form
        setIsFormDirty(false); 
    };

    // --- FUNGSI MENDETEKSI KETIKAN DI FORM ---
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData({ ...editData, [name]: name === 'member_doi_rji' ? value === 'true' : value });
        setIsFormDirty(true); // Menandakan bahwa ada data yang diubah
    };

    // --- FUNGSI ALERT KONFIRMASI SAAT KLIK SIMPAN ---
    const handleEditSubmit = async (e) => {
        e.preventDefault();

        // 1. Jika form belum diapa-apain, gak usah konfirmasi, langsung kembali
        if (!isFormDirty) {
            Swal.fire({ 
                icon: 'info', title: 'Tidak Ada Perubahan', 
                text: 'Data tidak diubah.', timer: 1500, showConfirmButton: false 
            });
            setIsEditing(false);
            return;
        }

        // 2. Jika ada yang diubah, minta konfirmasi dulu!
        const result = await Swal.fire({
            title: 'Simpan Perubahan?',
            text: "Apakah kamu yakin data yang diedit sudah benar?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981', // Warna hijau
            cancelButtonColor: '#d33',     // Warna merah
            confirmButtonText: 'Ya, Simpan!',
            cancelButtonText: 'Cek Lagi'
        });

        // 3. Jika diklik "Ya, Simpan!" barulah proses simpan ke database
        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: 'Menyimpan...',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading(); }
                });

                await updateJurnal(editData.id, editData);
                
                setIsEditing(false); // Kembali ke tabel
                setIsFormDirty(false); 
                await fetchData();
                
                Swal.fire({ icon: 'success', title: 'Tersimpan!', text: 'Data berhasil diperbarui.', timer: 1500, showConfirmButton: false });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Gagal Edit', text: err.response?.data?.message || err.message });
            }
        }
    };

    // --- FUNGSI ALERT KONFIRMASI SAAT KLIK BATAL EDIT ---
    const handleCancelEdit = () => {
        if (isFormDirty) {
            Swal.fire({
                title: 'Perubahan Belum Disimpan!',
                text: "Yakin ingin membatalkan? Semua perubahan yang belum disimpan akan hilang.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Ya, Batal Edit',
                cancelButtonText: 'Kembali Mengedit'
            }).then((result) => {
                if (result.isConfirmed) {
                    setIsEditing(false); // Kembali ke tabel
                    setIsFormDirty(false);
                }
            });
        } else {
            setIsEditing(false); // Langsung kembali kalau ga ada yg diubah
        }
    };


    return (
        <div className="dashboard-layout">
            <Sidebar onLogout={onLogout} />

            <main className="main-content">
                {/* TOP BAR */}
                <header className="top-bar">
                    <div className="top-bar-left">
                        <h3>{isEditing ? '✏️ Edit Data Jurnal' : 'Data Jurnal Terdaftar'}</h3>
                        <p>{isEditing ? `Mengedit: ${editData?.nama}` : `Total: ${filteredJurnals.length} Jurnal`}</p>
                    </div>
                    {/* Sembunyikan search bar saat lagi mode edit */}
                    {!isEditing && (
                        <div className="search-container">
                            <input type="text" placeholder="🔍 Cari Jurnal, Kampus, atau ISSN..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input"/>
                        </div>
                    )}
                    <div className="user-profile"><span>👋 Halo, {username}</span></div>
                </header>

                <div className="content-wrapper">
                    
                    {/* LOGIKA PERGANTIAN TAMPILAN (TABEL vs FORM) */}
                    {!isEditing ? (
                        
                        /* --- VIEW 1: TABEL DATA --- */
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

                    ) : (

                        /* --- VIEW 2: FORM EDIT IN-PLACE (GAYA GRID RAPI) --- */
                        <div className="edit-form-card">
                            <form onSubmit={handleEditSubmit}>
                                
                                <div className="edit-form-grid">
                                    {/* Kolom Kiri Kanan */}
                                    <div className="form-group full-width">
                                        <label>Nama Jurnal</label>
                                        <input type="text" name="nama" value={editData.nama || ''} onChange={handleEditChange} required />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Penerbit / Institusi</label>
                                        <input type="text" name="penerbit" value={editData.penerbit || ''} onChange={handleEditChange} required />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>ISSN</label>
                                        <input type="text" name="issn" value={editData.issn || ''} onChange={handleEditChange} />
                                    </div>

                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" name="email" value={editData.email || ''} onChange={handleEditChange} />
                                    </div>

                                    <div className="form-group">
                                        <label>Kontak (WA/HP)</label>
                                        <input type="text" name="kontak" value={editData.kontak || ''} onChange={handleEditChange} />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>URL Website Utama</label>
                                        <input type="url" name="url" value={editData.url || ''} onChange={handleEditChange} />
                                    </div>

                                    <div className="form-group">
                                        <label>Member DOI RJI</label>
                                        <select name="member_doi_rji" value={editData.member_doi_rji} onChange={handleEditChange}>
                                            <option value={true}>Ya</option>
                                            <option value={false}>Tidak</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Akreditasi (Contoh: Sinta 2)</label>
                                        <input type="text" name="akreditasi" value={editData.akreditasi || ''} onChange={handleEditChange} placeholder="Kosongkan jika auto-sync" />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>URL Profil Sinta</label>
                                        <input type="url" name="url_sinta" value={editData.url_sinta || ''} onChange={handleEditChange} placeholder="https://sinta..." />
                                    </div>
                                </div>
                                
                                <div className="form-actions-row">
                                    <button type="button" className="btn-cancel" onClick={handleCancelEdit}>✖ Batal Edit</button>
                                    <button type="submit" className="btn-save">💾 Simpan Perubahan</button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default Dashboard;