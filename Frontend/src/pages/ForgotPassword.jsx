import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Form from '../components/Form';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Ingresá tu email');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            setEnviado(true);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al enviar el email');
        } finally {
            setLoading(false);
        }
    };

    if (enviado) {
        return (
            <div className="login-page auth-page">
                <div className="auth-form-card form-card">
                    <p style={{ textAlign: 'center', lineHeight: 1.6, color: '#1a1a1a' }}>
                        Si el email existe en nuestro sistema, recibirás un link de recuperación
                        en los próximos minutos. Revisá también tu carpeta de spam.
                    </p>
                    <Link to="/login" className="app-btn" style={{ textDecoration: 'none', marginTop: '0.5rem' }}>
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page auth-page">
            <Form
                title="Recuperar contraseña"
                onSubmit={handleSubmit}
                submitText={loading ? 'Enviando...' : 'Enviar link'}
                submitDisabled={loading}
                className="auth-form-card"
            >
                <input
                    type="email"
                    placeholder="Tu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </Form>
            <p className="auth-note">
                <Link to="/login">Volver al inicio de sesión</Link>
            </p>
        </div>
    );
}

export default ForgotPassword;
