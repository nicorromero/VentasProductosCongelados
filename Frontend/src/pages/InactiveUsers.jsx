import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';
import { getRole } from '../utils/auth';

function InactiveUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (getRole() !== 'admin') {
            navigate('/');
            return;
        }
        const fetchInactiveUsers = async () => {
            try {
                const { data } = await axiosClient.get('/users/inactive');
                setUsers(data);
            } catch {
                toast.error('Error al cargar usuarios inactivos');
            } finally {
                setLoading(false);
            }
        };
        fetchInactiveUsers();
    }, [navigate]);

    const handleReactivar = async (id) => {
        if (!window.confirm('¿Reactivar este usuario?')) return;
        try {
            await axiosClient.patch(`/users/${id}/reactivate`);
            setUsers((prev) => prev.filter((u) => u._id !== id));
            toast.success('Usuario reactivado');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al reactivar');
        }
    };

    if (loading) return <div className="text-center py-5 text-muted">Cargando...</div>;

    return (
        <section className="container py-4" style={{ maxWidth: '860px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fs-4 fw-semibold mb-0">Usuarios dados de baja</h2>
                <button className="btn btn-dark btn-sm rounded-3" onClick={() => navigate('/usuarios')}>
                    Volver
                </button>
            </div>

            {users.length === 0 ? (
                <p className="text-muted">No hay usuarios dados de baja.</p>
            ) : (
                <div className="table-responsive">
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
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleReactivar(u._id)}
                                        >
                                            Reactivar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default InactiveUsers;
