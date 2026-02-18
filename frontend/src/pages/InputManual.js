import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import apiClient from '../services/apiClient';
import '../styles/InputManual.css'; 

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
            // Bersihkan ISSN dari tanda strip
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
            {/* Sidebar akan otomatis menyuntikkan style margin ke div .content di bawah ini */}
            <Sidebar onLogout={onLogout} />
            
            <div className="content">
                <div className="manual-container">
                    <h2>Input Manual Jurnal</h2>
                    <p>Lengkapi formulir di bawah ini untuk menambahkan data jurnal baru secara manual.</p>
                    
                    <form onSubmit={handleSubmit} className="manual-form-grid">
                        
                        {/* Nama Jurnal (Lebar Penuh) */}
                        <div className="form-group full-width">
                            <label>Nama Jurnal</label>
                            <input type="text" name="nama" value={formData.nama} onChange={handleChange} required placeholder="Contoh: Jurnal Teknologi Informasi" />
                        </div>

                        {/* Penerbit */}
                        <div className="form-group">
                            <label>Penerbit / Kampus</label>
                            <input type="text" name="penerbit" value={formData.penerbit} onChange={handleChange} placeholder="Contoh: Universitas Gadjah Mada" />
                        </div>

                        {/* ISSN */}
                        <div className="form-group">
                            <label>ISSN (8 Digit)</label>
                            <input type="text" name="issn" value={formData.issn} onChange={handleChange} placeholder="Contoh: 20881234" />
                        </div>

                        {/* URL (Lebar Penuh) */}
                        <div className="form-group full-width">
                            <label>URL Website</label>
                            <input type="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://jurnal.ugm.ac.id/..." />
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label>Email Pengelola</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="editor@jurnal.ac.id" />
                        </div>

                        {/* Kontak WA */}
                        <div className="form-group">
                            <label>Kontak / WhatsApp</label>
                            <input type="text" name="kontak" value={formData.kontak} onChange={handleChange} placeholder="0812xxxx" />
                        </div>

                        {/* Akreditasi */}
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

                        {/* Checkbox RJI */}
                        <div className="form-group checkbox-group">
                            <input type="checkbox" id="rji" name="member_doi_rji" checked={formData.member_doi_rji} onChange={handleChange} />
                            <label htmlFor="rji">
                                Jurnal ini adalah <strong>Member DOI RJI</strong>
                            </label>
                        </div>

                        {/* Tombol Aksi */}
                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>
                                Batal
                            </button>
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? 'Menyimpan...' : 'Simpan Data'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InputManual;