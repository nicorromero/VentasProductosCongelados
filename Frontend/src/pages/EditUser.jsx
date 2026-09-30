import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';
import { getRole } from '../utils/auth';

function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', role: 'user', password: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (getRole() !== 'admin') { navigate('/usuarios'); return; }
        const fetchUser = async () => {
            try {
                const { data } = await axiosClient.get(`/users/${id}`);
                setForm({ name: data.name || '', email: data.email || '', role: data.role || 'user', password: '' });
            } catch {
                toast.error('Error al cargar el usuario');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id, navigate]);

    const handleSave = async (e) => {
        e.preventDefault();
        const body = { name: form.name, email: form.email, role: form.role };
        if (form.password) body.password = form.password;

        try {
            await axiosClient.put(`/users/${id}`, body);
            toast.success('Usuario actualizado');
            navigate('/usuarios');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al actualizar');
        }
    };

    if (loading) return <div className="text-center py-5 text-muted">Cargando...</div>;

    return (
        <section className="d-flex align-items-center justify-content-center p-3" style={{ minHeight: '80vh' }}>
            <div className="card border-0 shadow-sm rounded-4 p-4 w-100" style={{ maxWidth: '440px' }}>
                <h2 className="fs-5 fw-semibold text-center mb-4">Editar usuario</h2>
                <form className="d-flex flex-column gap-3" onSubmit={handleSave}>
                    <input className="form-control rounded-3" type="text" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input className="form-control rounded-3" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <select className="form-select rounded-3" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                        <option value="user">Cliente</option>
                        <option value="admin">Admin</option>
                    </select>
                    <input className="form-control rounded-3" type="password" placeholder="Nueva contraseña (opcional)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    <button className="btn btn-dark w-100 rounded-3 py-2 fw-semibold" type="submit">Guardar cambios</button>
                    <button className="btn btn-outline-secondary w-100 rounded-3 py-2" type="button" onClick={() => navigate('/usuarios')}>Cancelar</button>
                </form>
            </div>
        </section>
    );
}

export default EditUser;
