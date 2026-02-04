import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { importExcel } from '../services/api';
import '../styles/Dashboard.css';
import '../styles/ImportJurnal.css'; 

const ImportJurnal = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
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

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
            setFile(selectedFile);
        } else {
            alert('Harap upload file Excel (.xlsx / .xls)');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const res = await importExcel(formData);
            alert(res.data.message); 
            navigate('/dashboard'); 
        } catch (err) {
            alert('Gagal Import: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,Nama Jurnal,Institusi,ISSN,Email,WA,Website\nContoh Jurnal Tekno,Univ A,12345678,email@contoh.com,08123456,https://jurnal.com";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "template_jurnal.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Jurnal DIY</h2>
                    <span className="badge-admin">Admin Panel</span>
                </div>
                
                <nav className="sidebar-menu">
                    <a href="/dashboard" className="menu-item">
                        <span className="icon"></span> Dashboard
                    </a>
                    <a href="/add-jurnal" className="menu-item">
                        <span className="icon"></span> Input Manual
                    </a>
                    <a href="#" className="menu-item active">
                        <span className="icon"></span> Import Excel
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="btn-logout-side">
                         Logout
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
                            <p style={{color:'#666', marginBottom:'30px'}}>
                                Pastikan format sesuai template. Data duplikat (ISSN sama) akan dilewati otomatis.
                            </p>

                            {/* AREA DRAG & DROP */}
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
                                <div className="upload-icon"></div>
                                <div className="upload-text">
                                    {file ? (
                                        <span style={{color:'#27ae60', fontWeight:'bold'}}>File Siap: {file.name}</span>
                                    ) : (
                                        <span>Drag & Drop file di sini atau <b>Klik untuk Cari</b></span>
                                    )}
                                </div>
                            </div>

                            {/* TOMBOL AKSI */}
                            <div className="action-buttons-import">
                                <button onClick={downloadTemplate} className="btn-template">
                                     Download Template
                                </button>
                                
                                <button 
                                    onClick={handleUpload} 
                                    className="btn-upload" 
                                    disabled={!file || loading}
                                >
                                    {loading ? 'Mengupload...' : ' Mulai Import'}
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