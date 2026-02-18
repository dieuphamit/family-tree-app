import { useState } from 'react';
import axios from 'axios';
import './AdminLogin.css';

const AdminLogin = ({ isOpen, onClose, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiUrl = import.meta.env.PROD ? '/api/auth/check-admin' : 'http://localhost:3001/api/auth/check-admin';
            const response = await axios.post(apiUrl, {
                password
            });

            if (response.data.isAdmin) {
                onSuccess(password);
                onClose();
                setPassword('');
            } else {
                setError('Mật khẩu không đúng');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="admin-login-overlay" onClick={onClose}>
            <div className="admin-login-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-login-header">
                    <h2>🔐 Đăng nhập Admin</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Mật khẩu:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu admin"
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="button-group">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !password}
                        >
                            {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
