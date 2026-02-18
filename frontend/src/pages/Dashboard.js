import React, { useState, useEffect } from 'react';
import { getJurnals, syncSinta, deleteJurnal, updateJurnal } from '../services/apiClient';
import Swal from 'sweetalert2';
import Sidebar from '../components/Sidebar';
import '../styles/Dashboard.css';

const Dashboard = ({ onLogout }) => {
    const [jurnals, setJurnals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('Admin');
    const [searchTerm, setSearchTerm] = useState(''); 

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
            const btn = document.getElementById(`sync-${id}`);
            if (btn) btn.innerText = "⏳";
            
            const res = await syncSinta(id);
            await fetchData(); 
            Swal.fire({ icon: 'success', title: 'Sync Selesai', text: res.data?.message, timer: 2000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal Sync', text: err.response?.data?.message || err.message });
            const btn = document.getElementById(`sync-${id}`);
            if (btn) btn.innerText = "🔄";
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

    const handleEditClick = (jurnal) => {
        setEditData(jurnal); 
        setIsEditing(true); 
        setIsFormDirty(false); 
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        
        // --- LOGIKA BARU: ISSN EDIT HANYA ANGKA ---
        if (name === 'issn') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setEditData({ ...editData, [name]: numericValue });
        } else {
            setEditData({ ...editData, [name]: name === 'member_doi_rji' ? value === 'true' : value });
        }
        
        setIsFormDirty(true); 
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!isFormDirty) {
            Swal.fire({ 
                icon: 'info', title: 'Tidak Ada Perubahan', 
                text: 'Data tidak diubah.', timer: 1500, showConfirmButton: false 
            });
            setIsEditing(false);
            return;
        }

        const result = await Swal.fire({
            title: 'Simpan Perubahan?',
            text: "Apakah kamu yakin data yang diedit sudah benar?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Simpan!',
            cancelButtonText: 'Cek Lagi'
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: 'Menyimpan...',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading(); }
                });

                await updateJurnal(editData.id, editData);
                
                setIsEditing(false); 
                setIsFormDirty(false); 
                await fetchData();
                
                Swal.fire({ icon: 'success', title: 'Tersimpan!', text: 'Data berhasil diperbarui.', timer: 1500, showConfirmButton: false });
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Gagal Edit', text: err.response?.data?.message || err.message });
            }
        }
    };

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
                    setIsEditing(false); 
                    setIsFormDirty(false);
                }
            });
        } else {
            setIsEditing(false); 
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar onLogout={onLogout} />

            <main className="main-content">
                <header className="top-bar">
                    <div className="top-bar-left">
                        <h3>{isEditing ? '✏️ Edit Data Jurnal' : 'Data Jurnal Terdaftar'}</h3>
                        <p>{isEditing ? `Mengedit: ${editData?.nama}` : `Total: ${filteredJurnals.length} Jurnal`}</p>
                    </div>
                    
                    {!isEditing && (
                        <div className="search-container">
                            <input type="text" placeholder="🔍 Cari Jurnal, Kampus, atau ISSN..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input"/>
                        </div>
                    )}
                    <div className="user-profile"><span>👋 Halo, {username}</span></div>
                </header>

                <div className="content-wrapper">
                    
                    {!isEditing ? (
                        <div className="table-responsive">
                            <table className="jurnal-table">
                                <thead>
                                    <tr>
                                        <th width="5%" style={{textAlign: 'center'}}>No</th>
                                        <th width="20%" style={{textAlign: 'left'}}>Nama Jurnal</th>
                                        <th width="15%" style={{textAlign: 'left'}}>ISSN</th>
                                        <th width="10%" style={{textAlign: 'left'}}>URL Web</th>
                                        <th width="15%" style={{textAlign: 'left'}}>Penerbit</th>
                                        <th width="15%" style={{textAlign: 'left'}}>Kontak</th>
                                        <th width="10%" style={{textAlign: 'left'}}>Member RJI</th>
                                        <th width="10%" style={{textAlign: 'left'}}>Akreditasi Sinta</th>
                                        <th width="10%" style={{textAlign: 'center'}}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="9" align="center" style={{padding: '40px'}}>Memuat database...</td></tr>
                                    ) : filteredJurnals.length > 0 ? (
                                        filteredJurnals.map((jurnal, index) => (
                                            <tr key={jurnal.id}>
                                                <td style={{textAlign: 'center'}}>{index + 1}</td>
                                                
                                                <td style={{textAlign: 'left'}}>
                                                    <div style={{fontWeight: 'bold', color: '#1e293b', fontSize: '1rem'}}>
                                                        {jurnal.nama || '-'}
                                                    </div>
                                                </td>

                                                <td style={{textAlign: 'left'}}>
                                                    {jurnal.issn ? (
                                                        <a href={`https://portal.issn.org/resource/ISSN/${jurnal.issn}`} target="_blank" rel="noreferrer" style={{color: '#2563eb', textDecoration: 'none', fontWeight: 'bold', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '4px', display: 'inline-block'}} title="Cek Validasi ISSN">
                                                            {jurnal.issn}
                                                        </a>
                                                    ) : (
                                                        <span style={{color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem'}}>Kosong</span>
                                                    )}
                                                </td>

                                                <td style={{textAlign: 'left'}}>
                                                    {jurnal.url ? (
                                                        <a href={jurnal.url} target="_blank" rel="noreferrer" style={{color: '#FF8A00', textDecoration: 'none', fontWeight: 'bold'}}>
                                                            🌐 Kunjungi
                                                        </a>
                                                    ) : '-'}
                                                </td>
                                                
                                                <td style={{textAlign: 'left'}}>{jurnal.penerbit || '-'}</td>
                                                
                                                <td style={{textAlign: 'left'}}>
                                                    <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                                        {jurnal.email && <span style={{fontSize: '0.85rem'}}>Email: {jurnal.email}</span>}
                                                        {jurnal.kontak && <span style={{fontSize: '0.85rem'}}>Kontak: {jurnal.kontak}</span>}
                                                        {(!jurnal.email && !jurnal.kontak) && '-'}
                                                    </div>
                                                </td>
                                                
                                                <td style={{textAlign: 'left'}}>
                                                    {jurnal.member_doi_rji ? (
                                                        <span style={{backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #bbf7d0'}}>Ya</span>
                                                    ) : (
                                                        <span style={{color: '#94a3b8', fontSize: '0.85rem'}}>Tidak</span>
                                                    )}
                                                </td>
                                                
                                                <td style={{textAlign: 'left'}}>
                                                    {jurnal.url_sinta && jurnal.url_sinta.trim() !== '' && jurnal.akreditasi && jurnal.akreditasi !== 'Belum Terakreditasi' ? (
                                                        <a href={jurnal.url_sinta} target="_blank" rel="noreferrer" style={{textDecoration: 'none'}}>
                                                            <span className={`badge-sinta ${jurnal.akreditasi.replace(/\s+/g, '')}`} title="Buka profil Sinta">
                                                                {jurnal.akreditasi} 🔗
                                                            </span>
                                                        </a>
                                                    ) : (
                                                        <span className={`badge-sinta ${(!jurnal.akreditasi || jurnal.akreditasi === 'Belum Terakreditasi') ? 'belum' : 'na'}`}>
                                                            {jurnal.akreditasi || 'Belum Terakreditasi'}
                                                        </span>
                                                    )}
                                                </td>

                                                <td style={{textAlign: 'center'}}>
                                                    <div className="action-buttons">
                                                        <button onClick={() => handleEditClick(jurnal)} className="btn-edit" title="Edit Data">Edit</button>
                                                        <button id={`sync-${jurnal.id}`} onClick={() => handleSync(jurnal.id, jurnal.issn)} className="btn-sync" title="Auto Sync Sinta">Sync Sinta</button>
                                                        <button onClick={() => handleDelete(jurnal.id, jurnal.nama)} className="btn-delete" title="Hapus Jurnal">Hapus</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="9" align="center" style={{padding: '40px'}}>Data kosong atau tidak ditemukan.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    ) : (

                        <div className="edit-form-card">
                            <form onSubmit={handleEditSubmit}>
                                
                                <div className="edit-form-grid">
                                    <div className="form-group full-width">
                                        <label>Nama Jurnal</label>
                                        <input type="text" name="nama" value={editData.nama || ''} onChange={handleEditChange} required />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Penerbit / Institusi</label>
                                        <input type="text" name="penerbit" value={editData.penerbit || ''} onChange={handleEditChange} required />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>ISSN (Hanya Angka)</label>
                                        <input 
                                            type="text" 
                                            name="issn" 
                                            value={editData.issn || ''} 
                                            onChange={handleEditChange} 
                                            placeholder="2088xxxx (Tanpa Strip)"
                                        />
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
                                    <button type="submit" className="btn-save"> Simpan Perubahan</button>
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