import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../assets/css/Users.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function getRole() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1])).role;
    } catch {
        return null;
    }
}

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
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_URL}/users/inactive`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(data);
            } catch {
                toast.error('Error al cargar usuarios inactivos');
            } finally {
                setLoading(false);
            }
        };
        fetchInactiveUsers();
    }, []);

    const handleReactivar = async (id) => {
        if (!window.confirm('¿Reactivar este usuario?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/users/${id}/reactivate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers((prev) => prev.filter((u) => u._id !== id));
            toast.success('Usuario reactivado');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al reactivar');
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="users-page">
            <div className="users-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="page-heading">Usuarios dados de baja</h2>
                    <button className="app-btn" onClick={() => navigate('/usuarios')}>
                        Volver
                    </button>
                </div>

                {users.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)' }}>No hay usuarios dados de baja.</p>
                ) : (
                    <table className="users-table">
                        <thead>
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
                                            className="app-btn"
                                            style={{ background: '#2e7d32' }}
                                            onClick={() => handleReactivar(u._id)}
                                        >
                                            Reactivar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default InactiveUsers;
