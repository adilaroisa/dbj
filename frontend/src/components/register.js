import React, { useState } from 'react';
import api from '../services/api'; 
import '../styles/login.css'; // Pakai CSS yang sama biar tema SAMA

const Register = ({ onSwitchToLogin }) => {
    // State Form
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setLoading(true);

        try {
            // Nembak ke endpoint Register
            await api.post('/auth/register', formData);
            setMessage({ type: 'success', text: 'Registrasi Berhasil! Silakan Login.' });
            
            // Hapus form biar bersih
            setFormData({ username: '', password: '' });
            
            // Opsional: Otomatis pindah ke login setelah 2 detik
            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);

        } catch (err) {
            const errMsg = err.response?.data?.message || 'Gagal Mendaftar';
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Daftar Admin Baru</h2>
                <p>Buat akun untuk mengelola jurnal</p>
                
                {message.text && (
                    <div className={`message-box ${message.type}`}>
                        {message.text}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Buat Username" 
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        required
                    />
                    
                    <div className="password-wrapper">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Buat Password" 
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            required
                        />
                        <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" /><path d="M5.535 16.524l-1.94 1.94a2.518 2.518 0 00-.318.062C1.39 17.509 0 15.114 0 12c0-2.38.815-4.576 2.195-6.326L.67 4.195a.75.75 0 111.06-1.06l17.29 17.29a.75.75 0 01-1.06 1.06l-1.427-1.427A11.206 11.206 0 0112 21.75c-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 001.325.214zM12.984 10.86l-2.125 2.125a2.25 2.25 0 013.199-3.198l-1.074 1.074z" /></svg>
                            )}
                        </span>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Memproses...' : 'DAFTAR SEKARANG'}
                    </button>
                </form>
                
                {/* Navigasi Kembali ke Login */}
                <div className="switch-mode">
                    Sudah punya akun? 
                    <span onClick={onSwitchToLogin}>Login di sini</span>
                </div>
            </div>
        </div>
    );
};

export default Register;