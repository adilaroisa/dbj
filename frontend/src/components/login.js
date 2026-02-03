import React, { useState } from 'react';
import api from '../services/api'; // Pastikan import api benar
import '../styles/Login.css';

const Login = ({ onLogin }) => {
    const [isRegisterMode, setIsRegisterMode] = useState(false); // State buat ganti mode
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fungsi handle Login / Register
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' }); // Reset pesan

        const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';

        try {
            const res = await api.post(endpoint, formData);

            if (isRegisterMode) {
                // Kalo sukses register
                setMessage({ type: 'success', text: 'Registrasi Berhasil! Silakan Login.' });
                setIsRegisterMode(false); // Balikin ke mode login
                setFormData({ username: '', password: '' }); // Bersihkan form
            } else {
                // Kalo sukses login
                localStorage.setItem('token', res.data.token);
                onLogin();
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Terjadi Kesalahan';
            setMessage({ type: 'error', text: errMsg });
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>{isRegisterMode ? 'Daftar Admin Baru' : 'Login Admin'}</h2>
                <p>{isRegisterMode ? 'Buat akun untuk mengelola jurnal' : 'Masuk untuk akses dashboard'}</p>
                
                {/* Tampilkan Pesan Error/Sukses */}
                {message.text && (
                    <div className={`message-box ${message.type}`}>
                        {message.text}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Username"
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Password"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        required
                    />
                    <button type="submit">
                        {isRegisterMode ? 'DAFTAR SEKARANG' : 'MASUK'}
                    </button>
                </form>

                {/* Tombol Ganti Mode */}
                <div className="switch-mode">
                    {isRegisterMode ? (
                        <p>Sudah punya akun? <span onClick={() => setIsRegisterMode(false)}>Login di sini</span></p>
                    ) : (
                        <p>Belum punya akun? <span onClick={() => setIsRegisterMode(true)}>Daftar dulu</span></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;