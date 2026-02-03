import React, { useState, useEffect } from 'react';
import { getJurnals, syncSinta, deleteJurnal, updateJurnal } from '../services/api';
import '../styles/JurnalTable.css';

const JurnalTable = ({ isAdmin }) => {
    // 1. Inisialisasi state dengan ARRAY KOSONG [] bukan null/undefined
    const [jurnals, setJurnals] = useState([]); 
    const [loading, setLoading] = useState(true); // Tambah state loading
    const [error, setError] = useState('');

    // State untuk mode edit
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // Ambil data saat komponen pertama kali muncul
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getJurnals();
            // PENGAMAN: Pastikan response.data itu array, kalau bukan, kasih array kosong
            setJurnals(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Gagal mengambil data jurnal.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi Update Sinta Otomatis
    const handleSync = async (id, issn) => {
        if (!issn) return alert('ISSN kosong, tidak bisa sync!');
        try {
            alert('Sedang sinkronisasi... Mohon tunggu.');
            await syncSinta(id);
            fetchData(); // Refresh tabel setelah sukses
            alert('Sukses update data Sinta!');
        } catch (err) {
            alert('Gagal update: ' + (err.response?.data?.message || err.message));
        }
    };

    // Fungsi Hapus
    const handleDelete = async (id) => {
        if (window.confirm('Yakin mau hapus jurnal ini?')) {
            try {
                await deleteJurnal(id);
                fetchData();
            } catch (err) {
                alert('Gagal menghapus');
            }
        }
    };

    // Fungsi Mulai Edit
    const startEdit = (jurnal) => {
        setEditingId(jurnal.id);
        setEditData(jurnal);
    };

    // Fungsi Simpan Edit (Manual)
    const saveEdit = async () => {
        try {
            await updateJurnal(editingId, editData);
            setEditingId(null);
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan perubahan');
        }
    };

    if (loading) return <div style={{textAlign:'center', padding:'20px'}}>Memuat data jurnal...</div>;
    if (error) return <div style={{color:'red', textAlign:'center'}}>{error}</div>;

    return (
        <div className="table-container">
            <table className="jurnal-table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Nama Jurnal</th>
                        <th>Institusi</th>
                        <th>Akreditasi</th>
                        <th>ISSN</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {jurnals.length > 0 ? (
                        jurnals.map((jurnal, index) => (
                            <tr key={jurnal.id}>
                                <td>{index + 1}</td>
              
                                <td>
                                    {editingId === jurnal.id ? (
                                        <input 
                                            value={editData.nama} 
                                            onChange={e => setEditData({...editData, nama: e.target.value})}
                                        />
                                    ) : (
                                        <a href={jurnal.url} target="_blank" rel="noreferrer">{jurnal.nama}</a>
                                    )}
                                </td>

                                <td>{jurnal.penerbit || '-'}</td>

                                <td>
                                    <span className={`badge ${jurnal.akreditasi ? jurnal.akreditasi.replace(' ', '-').toLowerCase() : 'na'}`}>
                                        {jurnal.akreditasi || 'Belum Terakreditasi'}
                                    </span>
                                </td>

                                <td>
                                    {editingId === jurnal.id ? (
                                        <input 
                                            value={editData.issn || ''} 
                                            onChange={e => setEditData({...editData, issn: e.target.value})}
                                        />
                                    ) : (
                                        jurnal.issn || '-'
                                    )}
                                </td>

                                <td>
                                    <div className="action-buttons">
                                
                                        {jurnal.url_sinta && (
                                            <a href={jurnal.url_sinta} target="_blank" rel="noreferrer" className="btn-link">
                                                🔍 Cek Sinta
                                            </a>
                                        )}

                                        {isAdmin && (
                                            <>
                                                {editingId === jurnal.id ? (
                                                    <button onClick={saveEdit} className="btn-save">💾 Simpan</button>
                                                ) : (
                                                    <button onClick={() => startEdit(jurnal)} className="btn-edit">✏️ Edit</button>
                                                )}

                                                <button 
                                                    onClick={() => handleSync(jurnal.id, jurnal.issn)} 
                                                    className="btn-sync"
                                                    title="Update otomatis dari Sinta"
                                                >
                                                    🔄 Sync
                                                </button>
                                                
                                                <button onClick={() => handleDelete(jurnal.id)} className="btn-delete">🗑️</button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{textAlign: 'center'}}>Belum ada data jurnal.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default JurnalTable;