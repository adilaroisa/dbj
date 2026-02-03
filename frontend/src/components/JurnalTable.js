import React, { useState } from 'react';
import { RefreshCw, ExternalLink, Mail, Phone } from 'lucide-react';
import { syncSinta } from '../services/api';
import '../styles/JurnalTable.css'; // Path ke folder styles di luar components

const JurnalTable = ({ dataJurnal }) => {
    const [loading, setLoading] = useState(null);
    // Base URL dinamis sesuai domain terbaru
    const SINTA_BASE_URL = "https://sinta.kemdiktisaintek.go.id";

    const handleSync = async (issn) => {
        setLoading(issn);
        try {
            await syncSinta(issn);
            alert("Data berhasil disinkronkan!");
            window.location.reload();
        } catch (err) {
            alert("Gagal sinkronisasi.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="table-container">
            <table className="jurnal-table">
                <thead>
                    <tr>
                        <th>Informasi Jurnal</th>
                        <th>Universitas</th>
                        <th>Kontak Internal</th>
                        <th>Akreditasi</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {dataJurnal.map((j) => (
                        <tr key={j.issn}>
                            <td>
                                <strong>{j.nama}</strong>
                                <div style={{fontSize: '10px', color: 'gray'}}>ISSN: {j.issn}</div>
                            </td>
                            <td>{j.univ}</td>
                            <td>
                                <a href={`mailto:${j.email}`} style={{display:'flex', alignItems:'center', gap:'5px', textDecoration:'none', color:'#2563eb'}}>
                                    <Mail size={14} /> {j.email}
                                </a>
                                {j.tlpn && <div style={{fontSize:'12px', display:'flex', alignItems:'center', gap:'5px'}}><Phone size={14}/> {j.tlpn}</div>}
                            </td>
                            <td style={{textAlign: 'center'}}>
                                {j.sinta_id ? (
                                    <a 
                                        href={`${SINTA_BASE_URL}/journals/detail?id=${j.sinta_id}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="sinta-badge"
                                    >
                                        SINTA {j.sinta_score} <ExternalLink size={12} />
                                    </a>
                                ) : "Belum Sync"}
                            </td>
                            <td style={{textAlign: 'center'}}>
                                <button onClick={() => handleSync(j.issn)} disabled={loading === j.issn}>
                                    <RefreshCw size={18} className={loading === j.issn ? "animate-spin" : ""} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default JurnalTable;