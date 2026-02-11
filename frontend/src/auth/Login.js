import React, { useState } from 'react';
import api from '../services/apiClient'; 
import '../styles/Login.css'; 

const Login = ({ onLogin, onSwitchToRegister }) => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setLoading(true);

        try {
            const res = await api.post('/auth/login', formData);
            
            localStorage.setItem('token', res.data.token);
            
            if (res.data.user && res.data.user.username) {
                localStorage.setItem('username', res.data.user.username);
            }
            onLogin(); 
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Gagal Login. Periksa username/password.';
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Login Admin</h2>
                <p>Silakan masuk untuk mengelola database</p>
                
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
                    
                    <div className="password-wrapper">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Password" 
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            required
                        />
                        <span 
                            className="toggle-password" 
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Sembunyikan Password" : "Lihat Password"}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            )}
                        </span>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Masuk...' : 'MASUK'}
                    </button>
                </form>
                
                <div className="switch-mode">
                    Belum punya akun? 
                    <span onClick={onSwitchToRegister}>Daftar di sini</span>
                </div>
            </div>
        </div>
    );
};

export default Login;