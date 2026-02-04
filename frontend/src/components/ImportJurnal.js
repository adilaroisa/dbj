import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx'; 
import { importExcel } from '../services/api';
import '../styles/Dashboard.css'; 
import '../styles/ImportJurnal.css'; 

const ImportJurnal = ({ onLogout }) => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleLogoutClick = () => {
        if (onLogout) {
            onLogout();
        }
    };

    const readExcel = (file) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const bstr = e.target.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            
            const cleanData = rawData
                .filter(row => {
                    // A. Hapus Baris Kosong
                    const values = Object.values(row);
                    return values.some(val => val !== "" && val !== null && val !== undefined && String(val).trim().length > 0);
                })
                .map(row => {
                    const newRow = {};
                    Object.keys(row).forEach(key => {
                        if (!key.startsWith('__EMPTY')) { 
                            newRow[key] = row[key];
                        }
                    });
                    return newRow;
                });
            
            setPreviewData(cleanData); 
        };
        
        reader.readAsBinaryString(file);
    };

    const validateAndSetFile = (selectedFile) => {
        const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        
        if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
            setFile(selectedFile);
            readExcel(selectedFile); 
        } else {
            alert('Harap upload file Excel (.xlsx / .xls)');
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
        e.target.value = null; 
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

    const handleUpload = async () => {
        if (!file) return;
        if (previewData.length === 0) {
            alert("Tidak ada data valid yang bisa diupload!");
            return;
        }

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

        const ws = XLSX.utils.json_to_sheet(templateData);
        const range = XLSX.utils.decode_range(ws['!ref']);
        
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = XLSX.utils.encode_cell({r: R, c: C});
            if (!ws[cell_address]) continue;
            if (C === 2 || C === 4) { 
                ws[cell_address].z = '@'; 
                ws[cell_address].t = 's'; 
            }
          }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Template_Jurnal_DIY.xlsx");
    };

    const removeFile = () => {
        setFile(null);
        setPreviewData([]);
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
                    <button onClick={handleLogoutClick} className="btn-logout-side">
                         Logout
                    </button>
                </div>
            </aside>

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
                                    <div className="upload-icon"></div>
                                    <div className="upload-text">
                                        <span>Drag & Drop file di sini atau <b>Klik untuk Cari</b></span>
                                    </div>
                                </div>
                            ) : (
                                <div className="file-selected-area">
                                    <div className="file-header">
                                        <div className="file-name-badge">
                                             {file.name} 
                                            <span className="row-count">({previewData.length} Baris Data Valid)</span>
                                        </div>
                                        <button onClick={removeFile} className="btn-remove-file">
                                             Ganti File
                                        </button>
                                    </div>

                                    <div className="preview-table-wrapper">
                                        <table className="preview-table">
                                            <thead>
                                                <tr>
                                                    <th className="row-number">#</th>
                                                    {previewData.length > 0 && Object.keys(previewData[0]).map((key) => (
                                                        <th key={key}>{key}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
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
                                        
                                        {previewData.length === 0 && (
                                            <div className="preview-footer" style={{color: '#e74c3c', fontWeight: 'bold'}}>
                                                 File terbaca kosong atau tidak ada baris data yang valid.
                                            </div>
                                        )}
                                        {previewData.length > 100 && (
                                            <div className="preview-footer">
                                                ... Menampilkan 100 baris pertama dari {previewData.length} data.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="action-buttons-import">
                                <button onClick={downloadTemplate} className="btn-template">
                                     Download Template
                                </button>
                                
                                <button 
                                    onClick={handleUpload} 
                                    className="btn-upload" 
                                    disabled={!file || loading || previewData.length === 0}
                                >
                                    {loading ? 'Mengupload...' : ' Upload ke Database'}
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