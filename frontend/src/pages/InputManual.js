import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import Alert Resmi
import Sidebar from '../components/Sidebar';
import apiClient from '../services/apiClient';
import '../styles/InputManual.css'; 

const InputManual = ({ onLogout }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // State untuk mendeteksi apakah user sudah mengetik sesuatu (Dirty Form)
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
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        // Tandai bahwa form sudah "kotor" (ada perubahan)
        setIsFormDirty(true);
    };

    // --- LOGIKA TOMBOL BATAL ---
    const handleCancel = () => {
        // Cek apakah ada data yang sudah diketik
        const hasData = Object.values(formData).some(val => val !== '' && val !== false);

        if (isFormDirty && hasData) {
            Swal.fire({
                title: 'Batalkan Input?',
                text: "Data yang sudah kamu ketik akan hilang.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33', // Merah
                cancelButtonColor: '#3085d6', // Biru
                confirmButtonText: 'Ya, Buang Data',
                cancelButtonText: 'Lanjut Isi'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/dashboard');
                }
            });
        } else {
            // Kalau form masih bersih, langsung balik aja
            navigate('/dashboard');
        }
    };

    // --- LOGIKA TOMBOL SIMPAN ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Konfirmasi Awal
        const result = await Swal.fire({
            title: 'Simpan Jurnal?',
            text: "Pastikan data yang dimasukkan sudah benar.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981', // Hijau (mirip Dashboard)
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Simpan!',
            cancelButtonText: 'Cek Lagi'
        });

        // Jika user klik "Ya, Simpan!"
        if (result.isConfirmed) {
            setLoading(true);
            
            // 2. Tampilkan Loading
            Swal.fire({
                title: 'Menyimpan Data...',
                html: 'Mohon tunggu sebentar.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                // Bersihkan ISSN dari tanda strip
                const payload = {
                    ...formData,
                    issn: formData.issn.replace(/-/g, '')
                };
                
                await apiClient.post('/jurnal', payload);

                // 3. Berhasil
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Jurnal baru telah ditambahkan ke database.',
                    timer: 2000,
                    showConfirmButton: false
                });

                navigate('/dashboard');

            } catch (err) {
                // 4. Gagal
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
            
            {/* Menggunakan 'main-content' agar sinkron dengan geseran Sidebar */}
            <div className="main-content">
                <div className="manual-container">
                    <h2>Input Manual Jurnal</h2>
                    <p>Lengkapi formulir di bawah ini untuk menambahkan data jurnal baru secara manual.</p>
                    
                    <form onSubmit={handleSubmit} className="manual-form-grid">
                        
                        {/* Nama Jurnal */}
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

                        {/* URL */}
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
                            <input type="text" name="kontak" value={formData.kontak} onChange={handleChange} placeholder="62xxxxx" />
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
                            {/* Tombol Batal sekarang memanggil handleCancel */}
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