import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Form from '../components/Form';
import '../assets/css/MyProfile.css';

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
        navigate('/login');
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
        if (!getTokenData()) { navigate('/login'); return; }
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

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="profile-page">
            <div className="profile-card">
                <h2 className="page-heading">Mi perfil</h2>

                <Form title="Datos personales" onSubmit={handleSaveDatos} submitText="Guardar datos" className="profile-form-card">

                    <div className="profile-field">
                        <div className="profile-label-row">
                            <label className="profile-label">Nombre de usuario</label>
                            <label className="profile-toggle">
                                <input
                                    type="checkbox"
                                    checked={editing.name}
                                    onChange={(e) => setEditing({ ...editing, name: e.target.checked })}
                                />
                                Editar
                            </label>
                        </div>
                        <input
                            className={editing.name ? '' : 'profile-input-disabled'}
                            type="text"
                            placeholder="Tu nombre"
                            value={form.name}
                            disabled={!editing.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div className="profile-field">
                        <div className="profile-label-row">
                            <label className="profile-label">Email</label>
                            <label className="profile-toggle">
                                <input
                                    type="checkbox"
                                    checked={editing.email}
                                    onChange={(e) => setEditing({ ...editing, email: e.target.checked })}
                                />
                                Editar
                            </label>
                        </div>
                        <input
                            className={editing.email ? '' : 'profile-input-disabled'}
                            type="email"
                            placeholder="tu@email.com"
                            value={form.email}
                            disabled={!editing.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>

                </Form>

                <Form title="Cambiar contraseña" onSubmit={handleSavePassword} submitText="Cambiar contraseña" className="profile-form-card">

                    <div className="profile-field">
                        <label className="profile-label">Contraseña actual</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={passwords.current}
                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        />
                    </div>

                    <div className="profile-field">
                        <label className="profile-label">Nueva contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={passwords.newPass}
                            onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                        />
                    </div>

                    <div className="profile-field">
                        <label className="profile-label">Repetir nueva contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={passwords.repeat}
                            onChange={(e) => setPasswords({ ...passwords, repeat: e.target.value })}
                        />
                    </div>

                </Form>

            </div>
        </div>
    );
}

export default MyProfile;
