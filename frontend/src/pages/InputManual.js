import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import apiClient from '../services/apiClient';
import '../styles/ImportJurnal.css'; // Memakai style yang sudah ada agar konsisten

const InputManual = ({ onLogout }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama: '',
        issn: '',
        url: '',
        penerbit: '',
        email: '',
        kontak: '',
        akreditasi: '',
        member_doi_rji: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Membersihkan ISSN dari tanda strip sebelum kirim
            const payload = {
                ...formData,
                issn: formData.issn.replace(/-/g, '')
            };
            
            await apiClient.post('/jurnal', payload);
            alert('Jurnal berhasil ditambahkan!');
            navigate('/dashboard');
        } catch (err) {
            alert('Gagal menambah data: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar onLogout={onLogout} />
            <div className="content">
                <div className="import-container">
                    <h2>Input Manual Jurnal</h2>
                    <p>Masukkan detail jurnal secara manual ke dalam database DIY.</p>
                    
                    <form onSubmit={handleSubmit} className="manual-form-grid">
                        <div className="form-group">
                            <label>Nama Jurnal</label>
                            <input type="text" name="nama" value={formData.nama} onChange={handleChange} required placeholder="Contoh: Jurnal Teknologi" />
                        </div>

                        <div className="form-group">
                            <label>ISSN (8 Digit)</label>
                            <input type="text" name="issn" value={formData.issn} onChange={handleChange} placeholder="Contoh: 1234-5678" />
                        </div>

                        <div className="form-group">
                            <label>Penerbit / Kampus</label>
                            <input type="text" name="penerbit" value={formData.penerbit} onChange={handleChange} placeholder="Contoh: Universitas Gadjah Mada" />
                        </div>

                        <div className="form-group">
                            <label>URL Website</label>
                            <input type="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://..." />
                        </div>

                        <div className="form-group">
                            <label>Email Pengelola</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@jurnal.ac.id" />
                        </div>

                        <div className="form-group">
                            <label>Kontak / WA</label>
                            <input type="text" name="kontak" value={formData.kontak} onChange={handleChange} placeholder="0812..." />
                        </div>

                        <div className="form-group">
                            <label>Status Akreditasi</label>
                            <select name="akreditasi" value={formData.akreditasi} onChange={handleChange}>
                                <option value="">-- Pilih Status --</option>
                                <option value="S1">Sinta 1</option>
                                <option value="S2">Sinta 2</option>
                                <option value="S3">Sinta 3</option>
                                <option value="S4">Sinta 4</option>
                                <option value="S5">Sinta 5</option>
                                <option value="S6">Sinta 6</option>
                                <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                            </select>
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input type="checkbox" name="member_doi_rji" checked={formData.member_doi_rji} onChange={handleChange} />
                                Member DOI RJI
                            </label>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-import" disabled={loading}>
                                {loading ? 'Menyimpan...' : 'Simpan Jurnal'}
                            </button>
                            <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>Batal</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InputManual;