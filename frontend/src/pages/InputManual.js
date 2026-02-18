import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import Sidebar from '../components/Sidebar';
import apiClient from '../services/apiClient';
import '../styles/InputManual.css'; 

const InputManual = ({ onLogout }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [isFormDirty, setIsFormDirty] = useState(false);

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

        // --- LOGIKA BARU: ISSN HANYA BOLEH ANGKA ---
        if (name === 'issn') {
            // Regex ini akan menghapus semua karakter KECUALI angka 0-9
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData({ ...formData, [name]: numericValue });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value
            });
        }
        
        setIsFormDirty(true);
    };

    const handleCancel = () => {
        const hasData = Object.values(formData).some(val => val !== '' && val !== false);

        if (isFormDirty && hasData) {
            Swal.fire({
                title: 'Batalkan Input?',
                text: "Data yang sudah kamu ketik akan hilang.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33', 
                cancelButtonColor: '#3085d6', 
                confirmButtonText: 'Ya, Buang Data',
                cancelButtonText: 'Lanjut Isi'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/dashboard');
                }
            });
        } else {
            navigate('/dashboard');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await Swal.fire({
            title: 'Simpan Jurnal?',
            text: "Pastikan data yang dimasukkan sudah benar.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981', 
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Simpan!',
            cancelButtonText: 'Cek Lagi'
        });

        if (result.isConfirmed) {
            setLoading(true);
            
            Swal.fire({
                title: 'Menyimpan Data...',
                html: 'Mohon tunggu sebentar.',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            try {
                // Tidak perlu replace(/-/g, '') lagi karena input sudah dijaga angka saja
                await apiClient.post('/jurnal', formData);

                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Jurnal baru telah ditambahkan ke database.',
                    timer: 2000,
                    showConfirmButton: false
                });

                navigate('/dashboard');

            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Menyimpan',
                    text: err.response?.data?.message || err.message
                });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar onLogout={onLogout} />
            
            <div className="main-content">
                <div className="manual-container">
                    <h2>Input Manual Jurnal</h2>
                    <p>Lengkapi formulir di bawah ini. ISSN otomatis hanya menerima angka.</p>
                    
                    <form onSubmit={handleSubmit} className="manual-form-grid">
                        
                        <div className="form-group full-width">
                            <label>Nama Jurnal</label>
                            <input type="text" name="nama" value={formData.nama} onChange={handleChange} required placeholder="Contoh: Jurnal Teknologi Informasi" />
                        </div>

                        <div className="form-group">
                            <label>Penerbit / Kampus</label>
                            <input type="text" name="penerbit" value={formData.penerbit} onChange={handleChange} placeholder="Contoh: Universitas Gadjah Mada" />
                        </div>

                        {/* INPUT ISSN (Updated Placeholder) */}
                        <div className="form-group">
                            <label>ISSN (Hanya Angka)</label>
                            <input 
                                type="text" 
                                name="issn" 
                                value={formData.issn} 
                                onChange={handleChange} 
                                placeholder="Contoh: 20881234 (Tanpa Strip)" 
                                maxLength="15" // Opsional: Batasi panjang karakter
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>URL Website</label>
                            <input type="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://jurnal.ugm.ac.id/..." />
                        </div>

                        <div className="form-group">
                            <label>Email Pengelola</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="editor@jurnal.ac.id" />
                        </div>

                        <div className="form-group">
                            <label>Kontak / WhatsApp</label>
                            <input type="text" name="kontak" value={formData.kontak} onChange={handleChange} placeholder="0812xxxx" />
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
                            <input type="checkbox" id="rji" name="member_doi_rji" checked={formData.member_doi_rji} onChange={handleChange} />
                            <label htmlFor="rji">
                                Jurnal ini adalah <strong>Member DOI RJI</strong>
                            </label>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={handleCancel}>
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