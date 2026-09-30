import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';
import { getRole } from '../utils/auth';
import Form from '../components/Form';

function Users() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const { data } = await axiosClient.get('/users');
            setUsers(data);
        } catch {
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (getRole() !== 'admin') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [navigate]);

    const handleDarDeBaja = async (id) => {
        if (!window.confirm('¿Dar de baja este usuario?')) return;
        try {
            await axiosClient.delete(`/users/${id}`);
            setUsers((prev) => prev.filter((u) => u._id !== id));
            toast.success('Usuario dado de baja');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al dar de baja');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            toast.error('Completá todos los campos');
            return;
        }
        try {
            await axiosClient.post('/users', form);
            toast.success('Usuario creado');
            setForm({ name: '', email: '', password: '', role: 'user' });
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al crear usuario');
        }
    };

    if (loading) return <div className="text-center py-5 text-muted">Cargando...</div>;

    return (
        <section className="container py-4" style={{ maxWidth: '860px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fs-4 fw-semibold mb-0">Usuarios</h2>
                <button className="btn btn-dark btn-sm rounded-3" onClick={() => navigate('/usuarios/inactivos')}>
                    Ver dados de baja
                </button>
            </div>

            <div className="table-responsive mb-4">
                <table className="table table-striped table-hover align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id}>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-dark btn-sm"
                                            onClick={() => navigate(`/usuarios/editar/${u._id}`)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDarDeBaja(u._id)}
                                        >
                                            Dar de baja
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Form title="Nuevo usuario" onSubmit={handleSubmit} submitText="Crear usuario" className="bg-body-secondary border-0 rounded-3">
                <input className="form-control rounded-3" type="text" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="form-control rounded-3" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className="form-control rounded-3" type="password" placeholder="Contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <select className="form-select rounded-3" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="user">Cliente</option>
                    <option value="admin">Admin</option>
                </select>
            </Form>
        </section>
    );
}

export default Users;
