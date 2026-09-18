import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../assets/css/Catalogo.css';

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

function InactiveProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (getRole() !== 'admin') {
            navigate('/');
            return;
        }
        const fetchInactiveProducts = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_URL}/products/inactive`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProducts(data);
            } catch {
                toast.error('Error al cargar productos inactivos');
            } finally {
                setLoading(false);
            }
        };
        fetchInactiveProducts();
    }, []);

    const handleReactivar = async (id) => {
        if (!window.confirm('¿Reactivar este producto?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/products/${id}/reactivate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts((prev) => prev.filter((p) => p._id !== id));
            toast.success('Producto reactivado');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al reactivar');
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="catalogo-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Productos dados de baja</h2>
                <button className="app-btn" onClick={() => navigate('/productos')}>
                    Volver
                </button>
            </div>

            {products.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>No hay productos dados de baja.</p>
            ) : (
                <div className="container-cards">
                    {products.map((p) => (
                        <div key={p._id} className="card" style={{ opacity: 0.7 }}>
                            <div className="imageContainer">
                                <img
                                    src={p.image || `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(p.name)}`}
                                    alt={p.name}
                                    className="image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(p.name)}`;
                                    }}
                                />
                            </div>
                            <div className="info">
                                <p className="category">{p.category}</p>
                                <h3 className="name">{p.name}</h3>
                                <div className="priceRow">
                                    <span className="price">${p.price}</span>
                                </div>
                                <button
                                    className="app-btn app-btn--small"
                                    style={{ background: '#2e7d32', width: '100%', marginTop: '8px' }}
                                    onClick={() => handleReactivar(p._id)}
                                >
                                    Reactivar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default InactiveProducts;
