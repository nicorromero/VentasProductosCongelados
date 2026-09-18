import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Form from '../components/Form';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            toast.error('Completá todos los campos');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/users`, form);
            toast.success('Cuenta creada. Podés iniciar sesión.');
            navigate(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page auth-page">
            <Form
                title="Crear cuenta"
                onSubmit={handleSubmit}
                submitText={loading ? 'Registrando...' : 'Registrarse'}
                submitDisabled={loading}
                className="auth-form-card"
            >
                <input
                    type="text"
                    placeholder="Nombre"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
            </Form>
            <p className="auth-note">
                ¿Ya tenés cuenta? <a href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}>Iniciar sesión</a>
            </p>
        </div>
    );
}

export default Register;
