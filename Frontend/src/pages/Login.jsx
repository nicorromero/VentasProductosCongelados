import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import Form from '../components/Form';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            toast.error('Completá todos los campos');
            return;
        }
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/login`, form);
            localStorage.setItem('token', data.token);
            const decodedUser = jwtDecode(data.token);
            localStorage.setItem('user', JSON.stringify(decodedUser));
            toast.success('Sesión iniciada');
            navigate(redirect || '/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="d-flex align-items-center justify-content-center p-3 flex-grow-1" style={{ minHeight: '80vh' }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                <Form
                    title="Iniciar sesión"
                    onSubmit={handleSubmit}
                    submitText={loading ? 'Ingresando...' : 'Entrar'}
                    submitDisabled={loading}
                    className="shadow rounded-4"
                >
                    <input
                        className="form-control rounded-3 py-2"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <input
                        className="form-control rounded-3 py-2"
                        type="password"
                        placeholder="Contraseña"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <Link to="/forgot-password" className="text-muted small text-decoration-none d-block text-end">¿Olvidaste tu contraseña?</Link>
                </Form>
            </div>
        </section>
    );
}

export default Login;