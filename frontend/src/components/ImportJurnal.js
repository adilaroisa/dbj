import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx'; // Import Library Excel
import { importExcel } from '../services/api';
import '../styles/Dashboard.css'; // Style Sidebar
import '../styles/ImportJurnal.css'; // Style Upload Area

const ImportJurnal = ({ onLogout }) => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]); // State untuk data preview
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleLogoutClick = () => {
        if (onLogout) {
            onLogout();
        }
    };

    // --- FUNGSI BACA EXCEL (PREVIEW) - SUDAH DI-FILTER ---
    const readExcel = (file) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const bstr = e.target.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });
            
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            
            // 1. Ambil data dengan defval "" (biar kolom header lengkap)
            const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            
            // 2. FILTER: Hapus baris yang isinya kosong semua
            // (Kadang Excel baca baris kosong sbg data, ini solusinya)
            const cleanData = rawData.filter(row => {
                const values = Object.values(row);
                // Baris dianggap valid jika ada minimal satu cell yang ada isinya
                return values.some(val => val !== "" && val !== null && val !== undefined);
            });
            
            setPreviewData(cleanData); 
        };
        
        reader.readAsBinaryString(file);
    };

    // --- VALIDASI FILE ---
    const validateAndSetFile = (selectedFile) => {
        const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        
        // Cek Tipe MIME atau Ekstensi File
        if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
            setFile(selectedFile);
            readExcel(selectedFile); // Jalankan fungsi preview
        } else {
            alert('Harap upload file Excel (.xlsx / .xls)');
        }
    };

    // --- HANDLE FILE INPUT & DRAG DROP ---
    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    // --- UPLOAD PROCESS ---
    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const res = await importExcel(formData);
            alert(res.data.message); // Tampilkan pesan sukses dari backend
            navigate('/dashboard'); // Kembali ke dashboard
        } catch (err) {
            alert('Gagal Import: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // --- DOWNLOAD TEMPLATE (FIX FORMAT NUMBER) ---
    const downloadTemplate = () => {
        // Data Dummy
        const templateData = [
            {
                "Nama Jurnal": "Contoh Jurnal Teknik",
                "Institusi": "Universitas Contoh",
                "ISSN": "12345678",      
                "Email": "admin@jurnal.com",
                "WA": "'08123456789", 
                "Website": "https://jurnal.contoh.ac.id",
                "Member RJI": "Ya"
            }
        ];

        // Buat WorkSheet
        const ws = XLSX.utils.json_to_sheet(templateData);

        // --- TRIK: PAKSA FORMAT TEXT UNTUK KOLOM ANGKA ---
        // A=0, B=1, C=2 (ISSN), D=3, E=4 (WA)
        const range = XLSX.utils.decode_range(ws['!ref']);
        
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = XLSX.utils.encode_cell({r: R, c: C});
            if (!ws[cell_address]) continue;

            // Jika Kolom ke-2 (ISSN) atau ke-4 (WA), paksa jadi Text
            if (C === 2 || C === 4) { 
                ws[cell_address].z = '@'; // Format TEXT
                ws[cell_address].t = 's'; // Tipe String
            }
          }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        
        // Simpan File
        XLSX.writeFile(wb, "Template_Jurnal_DIY.xlsx");
    };

    // --- HAPUS FILE (RESET) ---
    const removeFile = () => {
        setFile(null);
        setPreviewData([]);
    };

    return (
        <div className="dashboard-layout">
            {/* --- SIDEBAR --- */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Jurnal DIY</h2>
                    <span className="badge-admin">Admin Panel</span>
                </div>
                
                <nav className="sidebar-menu">
                    <a href="/dashboard" className="menu-item">
                        <span className="icon">📊</span> Dashboard
                    </a>
                    <a href="/add-jurnal" className="menu-item">
                        <span className="icon">📝</span> Input Manual
                    </a>
                    <a href="#" className="menu-item active">
                        <span className="icon">📂</span> Import Excel
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogoutClick} className="btn-logout-side">
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="main-content">
                <header className="top-bar">
                    <h3>Import Data Excel</h3>
                    <div className="user-profile">
                        <span>Panel Import</span>
                    </div>
                </header>

                <div className="content-wrapper">
                    <div className="import-container">
                        <div className="import-card">
                            <h2 style={{marginTop:0}}>Upload File Excel</h2>
                            <p style={{color:'#666', marginBottom:'20px'}}>
                                Upload file .xlsx berisi data jurnal. Pastikan header kolom sesuai template.
                            </p>

                            {/* TAMPILAN 1: AREA UPLOAD */}
                            {!file ? (
                                <div 
                                    className={`upload-area ${dragActive ? 'active' : ''}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('fileInput').click()}
                                >
                                    <input 
                                        type="file" 
                                        id="fileInput" 
                                        style={{display:'none'}} 
                                        accept=".xlsx, .xls"
                                        onChange={handleChange}
                                    />
                                    <div className="upload-icon">📂</div>
                                    <div className="upload-text">
                                        <span>Drag & Drop file di sini atau <b>Klik untuk Cari</b></span>
                                    </div>
                                </div>
                            ) : (
                                // TAMPILAN 2: PREVIEW SETELAH PILIH FILE
                                <div className="file-selected-area">
                                    <div className="file-header">
                                        <div className="file-name-badge">
                                            📄 {file.name} 
                                            <span className="row-count">({previewData.length} Baris Data Valid)</span>
                                        </div>
                                        <button onClick={removeFile} className="btn-remove-file">
                                            ❌ Ganti File
                                        </button>
                                    </div>

                                    {/* TABEL PREVIEW */}
                                    <div className="preview-table-wrapper">
                                        <table className="preview-table">
                                            <thead>
                                                <tr>
                                                    <th className="row-number">#</th>
                                                    {/* Render Header Dinamis */}
                                                    {previewData.length > 0 && Object.keys(previewData[0]).map((key) => (
                                                        <th key={key}>{key}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Render Body Table (Max 100 baris) */}
                                                {previewData.slice(0, 100).map((row, index) => (
                                                    <tr key={index}>
                                                        <td className="row-number">{index + 1}</td>
                                                        {Object.values(row).map((val, i) => (
                                                            <td key={i}>{val}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        
                                        {previewData.length > 100 && (
                                            <div className="preview-footer">
                                                ... Menampilkan 100 baris pertama dari total {previewData.length} baris.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TOMBOL AKSI */}
                            <div className="action-buttons-import">
                                <button onClick={downloadTemplate} className="btn-template">
                                    📥 Download Template
                                </button>
                                
                                <button 
                                    onClick={handleUpload} 
                                    className="btn-upload" 
                                    disabled={!file || loading}
                                >
                                    {loading ? 'Mengupload...' : '🚀 Upload ke Database'}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ImportJurnal;