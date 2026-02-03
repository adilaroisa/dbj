import React, { useState, useEffect, useRef } from 'react';
import { getJurnals, syncSinta, deleteJurnal, importExcel } from '../services/api';
import '../styles/JurnalTable.css';

const JurnalTable = ({ isAdmin }) => {
    const [jurnals, setJurnals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    const fileInputRef = useRef(null);

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
            alert(`Sedang sinkronisasi ISSN ${issn}...`);
            await syncSinta(id);
            await fetchData(); 
            alert('Berhasil Update dari Sinta!');
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

    return (
        <div className="table-container">
            <div className="toolbar">
                <h3>Data Jurnal Terdaftar</h3>
                <div className="toolbar-actions">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                    />
                    <button 
                        className="btn-import" 
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                    >
                        {uploading ? 'Mengupload...' : '📂 Import Excel'}
                    </button>
                    <button className="btn-add" onClick={() => alert('Fitur tambah manual menyusul')}>
                        + Tambah Manual
                    </button>
                </div>
            </div>

            <table className="jurnal-table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Jurnal & Institusi</th>
                        <th>ISSN & Validasi</th>
                        <th>Akreditasi Sinta</th>
                        <th>Kontak (Internal)</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {jurnals.length > 0 ? (
                        jurnals.map((jurnal, index) => (
                            <tr key={jurnal.id}>
                                <td>{index + 1}</td>
                                
                                <td>
                                    <div className="jurnal-info">
                                        <a href={jurnal.url || '#'} target="_blank" rel="noreferrer" className="jurnal-link">
                                            {jurnal.nama}
                                        </a>
                                        <small>{jurnal.penerbit || 'Tidak ada data penerbit'}</small>
                                        
                                
                                        {jurnal.member_doi_rji && <span className="badge-rji">Member RJI</span>}
                                    </div>
                                </td>

                                <td>
                                    {jurnal.issn ? (
                                        <div className="issn-box">
                                            <span>{jurnal.issn}</span>
                                            <a 
                                                href={`https://portal.issn.org/resource/ISSN/${jurnal.issn}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="link-validasi"
                                            >
                                                 Validasi
                                            </a>
                                        </div>
                                    ) : <span className="text-muted">-</span>}
                                </td>

                                <td>
                                    <span className={`badge-sinta ${jurnal.akreditasi ? jurnal.akreditasi.replace(' ', '') : 'na'}`}>
                                        {jurnal.akreditasi || 'Belum Terakreditasi'}
                                    </span>
                                </td>

                                <td>
                                    <div className="contact-info">
                                        {jurnal.email && <div> {jurnal.email}</div>}
                                        {jurnal.kontak && <div> {jurnal.kontak}</div>}
                                        {!jurnal.email && !jurnal.kontak && <span className="text-muted">-</span>}
                                    </div>
                                </td>

                                <td>
                                    <div className="action-buttons">
                                        <button 
                                            onClick={() => handleSync(jurnal.id, jurnal.issn)} 
                                            className="btn-sync"
                                            title="Update Akreditasi dari Sinta"
                                        >
                                            Sync
                                        </button>
                                        <button onClick={() => handleDelete(jurnal.id)} className="btn-delete"></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="6" align="center">Belum ada data. Silakan Import Excel.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default JurnalTable;