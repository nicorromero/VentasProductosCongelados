import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../assets/css/EditUser.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function getRole() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1])).role;
    } catch { return null; }
}

function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', role: 'user', password: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (getRole() !== 'admin') { navigate('/usuarios'); return; }
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_URL}/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setForm({ name: data.name || '', email: data.email || '', role: data.role || 'user', password: '' });
            } catch {
                toast.error('Error al cargar el usuario');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleSave = async (e) => {
        e.preventDefault();
        const body = { name: form.name, email: form.email, role: form.role };
        if (form.password) body.password = form.password;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/users/${id}`, body, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Usuario actualizado');
            navigate('/usuarios');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al actualizar');
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="edituser-page">
            <div className="edituser-card">
                <h2 className="edituser-title">Editar usuario</h2>
                <form className="edituser-form" onSubmit={handleSave}>
                    <input className="edituser-input" type="text" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input className="edituser-input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <select className="edituser-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                        <option value="user">Cliente</option>
                        <option value="admin">Admin</option>
                    </select>
                    <input className="edituser-input" type="password" placeholder="Nueva contraseña (opcional)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    <button className="edituser-btn" type="submit">Guardar cambios</button>
                    <button className="edituser-btn-cancel" type="button" onClick={() => navigate('/usuarios')}>Cancelar</button>
                </form>
            </div>
        </div>
    );
}

export default EditUser;
