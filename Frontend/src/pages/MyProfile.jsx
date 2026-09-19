import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Form from '../components/Form';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function getTokenData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1]));
    } catch { return null; }
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doLogout(navigate) {
    setTimeout(() => {
        localStorage.removeItem('token');
        navigate('/admin-login');
    }, 1500);
}

function MyProfile() {
    const [form, setForm] = useState({ name: '', email: '' });
    const [originalData, setOriginalData] = useState({ name: '', email: '' });
    const [editing, setEditing] = useState({ name: false, email: false });
    const [passwords, setPasswords] = useState({ current: '', newPass: '', repeat: '' });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!getTokenData()) { navigate('/admin-login'); return; }
        const fetchMe = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setForm({ name: data.name, email: data.email });
                setOriginalData({ name: data.name, email: data.email });
            } catch {
                toast.error('Error al cargar el perfil');
            } finally {
                setLoading(false);
            }
        };
        fetchMe();
    }, []);

    const handleSaveDatos = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            toast.error('El nombre no puede estar vacío');
            return;
        }
        if (!emailRegex.test(form.email)) {
            toast.error('El email no tiene un formato válido');
            return;
        }

        try {
            const tokenData = getTokenData();
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/users/${tokenData.id}`,
                { name: form.name.trim(), email: form.email.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (form.email !== originalData.email) {
                toast.success('Datos actualizados. Iniciá sesión nuevamente.');
                doLogout(navigate);
            } else {
                toast.success('Datos actualizados correctamente');
                setEditing({ name: false, email: false });
                setOriginalData({ name: form.name.trim(), email: form.email.trim() });
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al actualizar los datos');
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();

        if (!passwords.current || !passwords.newPass || !passwords.repeat) {
            toast.error('Completá todos los campos de contraseña');
            return;
        }
        if (passwords.newPass !== passwords.repeat) {
            toast.error('Las contraseñas nuevas no coinciden');
            return;
        }

        try {
            const tokenData = getTokenData();
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/users/${tokenData.id}`,
                { password: passwords.newPass, currentPassword: passwords.current },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Contraseña actualizada. Iniciá sesión nuevamente.');
            doLogout(navigate);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al cambiar la contraseña');
        }
    };

    if (loading) return <div className="text-center py-5 text-muted">Cargando...</div>;

    return (
        <section className="d-flex justify-content-center p-3 p-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 w-100" style={{ maxWidth: '440px' }}>
                <h2 className="fs-4 fw-semibold mb-4">Mi perfil</h2>

                <Form title="Datos personales" onSubmit={handleSaveDatos} submitText="Guardar datos" className="border-0 shadow-none p-0">

                    <div className="mb-2">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="form-label small text-muted text-uppercase fw-semibold mb-0" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>Nombre de usuario</label>
                            <div className="form-check form-switch mb-0">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    checked={editing.name}
                                    onChange={(e) => setEditing({ ...editing, name: e.target.checked })}
                                    id="editNameSwitch"
                                />
                                <label className="form-check-label small text-muted" htmlFor="editNameSwitch">Editar</label>
                            </div>
                        </div>
                        <input
                            className="form-control rounded-3"
                            type="text"
                            placeholder="Tu nombre"
                            value={form.name}
                            disabled={!editing.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div className="mb-2">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="form-label small text-muted text-uppercase fw-semibold mb-0" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>Email</label>
                            <div className="form-check form-switch mb-0">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    checked={editing.email}
                                    onChange={(e) => setEditing({ ...editing, email: e.target.checked })}
                                    id="editEmailSwitch"
                                />
                                <label className="form-check-label small text-muted" htmlFor="editEmailSwitch">Editar</label>
                            </div>
                        </div>
                        <input
                            className="form-control rounded-3"
                            type="email"
                            placeholder="tu@email.com"
                            value={form.email}
                            disabled={!editing.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>

                </Form>

                <hr className="my-3" />

                <Form title="Cambiar contraseña" onSubmit={handleSavePassword} submitText="Cambiar contraseña" className="border-0 shadow-none p-0">

                    <div className="mb-2">
                        <label className="form-label small text-muted text-uppercase fw-semibold" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>Contraseña actual</label>
                        <input
                            className="form-control rounded-3"
                            type="password"
                            placeholder="••••••••"
                            value={passwords.current}
                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        />
                    </div>

                    <div className="mb-2">
                        <label className="form-label small text-muted text-uppercase fw-semibold" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>Nueva contraseña</label>
                        <input
                            className="form-control rounded-3"
                            type="password"
                            placeholder="••••••••"
                            value={passwords.newPass}
                            onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                        />
                    </div>

                    <div className="mb-2">
                        <label className="form-label small text-muted text-uppercase fw-semibold" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>Repetir nueva contraseña</label>
                        <input
                            className="form-control rounded-3"
                            type="password"
                            placeholder="••••••••"
                            value={passwords.repeat}
                            onChange={(e) => setPasswords({ ...passwords, repeat: e.target.value })}
                        />
                    </div>

                </Form>
            </div>
        </section>
    );
}

export default MyProfile;
