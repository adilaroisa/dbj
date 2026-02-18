import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/Sidebar.css';

const Sidebar = ({ onLogout }) => {
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleLogoutClick = () => {
        Swal.fire({
            title: 'Keluar dari Sistem?', text: "Sesi kamu akan diakhiri.",
            icon: 'question', showCancelButton: true,
            confirmButtonColor: '#FF8A00', cancelButtonColor: '#aaa',
            confirmButtonText: 'Ya, Logout', cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) { if (onLogout) onLogout(); }
        });
    };

    return (
        <>
            {/* INJEKSI CSS DINAMIS BIAR GAK NABRAK */}
            <style>
                {`
                    .main-content {
                        margin-left: ${isOpen ? '250px' : '0'};
                        transition: margin-left 0.3s ease;
                        width: ${isOpen ? 'calc(100% - 250px)' : '100%'};
                        box-sizing: border-box;
                    }
                    /* KUNCI ANTI NABRAK: Kalau ketutup, top bar menjorok ke kanan untuk ngasih ruang ke tombol hamburger */
                    .top-bar {
                        /* UBAH ANGKA 80px MENJADI LEBIH BESAR, misalnya 100px atau 110px */
                        padding-left: ${isOpen ? '30px' : '110px'} !important; 
                        transition: padding-left 0.3s ease;
                    }
                    @media (max-width: 768px) {
                        .main-content { margin-left: 0; width: 100%; }
                        /* Pastikan di mobile juga diubah */
                        .top-bar { padding-left: 110px !important; } 
                    }
                `}
            </style>

            {/* Tombol Garis Tiga (Hamburger) */}
            <button className={`hamburger-btn ${isOpen ? 'open' : ''}`} onClick={toggleSidebar}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            {/* Panel Sidebar */}
            <aside className={`sidebar-panel ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>Jurnal DIY</h2>
                    <span className="badge-admin">Admin Panel</span>
                </div>
                
                <nav className="sidebar-menu">
                    <Link to="/dashboard" className={`menu-item ${location.pathname.includes('/dashboard') || location.pathname === '/' ? 'active' : ''}`}>
                        <span className="icon"></span> Dashboard
                    </Link>
                    <Link to="/input-manual" className={`menu-item ${location.pathname.includes('/input-manual') ? 'active' : ''}`}>
                        <span className="icon"></span> Input Manual
                    </Link>
                    <Link to="/import-jurnal" className={`menu-item ${location.pathname.includes('/import-jurnal') ? 'active' : ''}`}>
                        <span className="icon"></span> Import Excel
                    </Link>
                </nav>
                

                <div className="sidebar-footer">
                    <button onClick={handleLogoutClick} className="btn-logout-side">🚪 Logout</button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;