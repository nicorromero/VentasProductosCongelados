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
            <section className="d-flex align-items-center justify-content-center p-3 flex-grow-1" style={{ minHeight: '80vh' }}>
                <div className="card border-0 shadow rounded-4 p-4 text-center w-100" style={{ maxWidth: '420px' }}>
                    <p className="mb-3 lh-lg">
                        Si el email existe en nuestro sistema, recibirás un link de recuperación
                        en los próximos minutos. Revisá también tu carpeta de spam.
                    </p>
                    <Link to="/admin-login" className="btn btn-dark rounded-3 w-100 text-decoration-none">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="d-flex align-items-center justify-content-center p-3 flex-grow-1 flex-column gap-3" style={{ minHeight: '80vh' }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                <Form
                    title="Recuperar contraseña"
                    onSubmit={handleSubmit}
                    submitText={loading ? 'Enviando...' : 'Enviar link'}
                    submitDisabled={loading}
                    className="shadow rounded-4"
                >
                    <input
                        className="form-control rounded-3 py-2"
                        type="email"
                        placeholder="Tu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form>
            </div>
            <p className="text-muted small text-center mb-0">
                <Link to="/admin-login" className="text-dark fw-semibold text-decoration-none">Volver al inicio de sesión</Link>
            </p>
        </section>
    );
}

export default ForgotPassword;
