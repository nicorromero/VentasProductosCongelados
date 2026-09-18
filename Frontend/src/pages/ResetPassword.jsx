import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Form from '../components/Form';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/reset-password/${token}`, { password });
            toast.success('Contraseña actualizada. Podés iniciar sesión.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.error || 'El link es inválido o expiró');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page auth-page">
            <Form
                title="Nueva contraseña"
                onSubmit={handleSubmit}
                submitText={loading ? 'Guardando...' : 'Guardar contraseña'}
                submitDisabled={loading}
                className="auth-form-card"
            >
                <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Repetir contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </Form>
        </div>
    );
}

export default ResetPassword;
