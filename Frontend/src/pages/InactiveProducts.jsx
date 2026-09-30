import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

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

    if (loading) return <div className="text-center py-5 text-muted">Cargando...</div>;

    return (
        <section className="container-fluid px-3 px-md-4 py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fs-4 fw-semibold mb-0">Productos dados de baja</h2>
                <button className="btn btn-dark btn-sm rounded-3" onClick={() => navigate('/productos')}>
                    Volver
                </button>
            </div>

            {products.length === 0 ? (
                <p className="text-muted">No hay productos dados de baja.</p>
            ) : (
                <div className="row g-3">
                    {products.map((p) => (
                        <div key={p._id} className="col-12 col-sm-6 col-lg-3">
                            <article className="card border-0 shadow-sm rounded-3 overflow-hidden opacity-75">
                                <div className="bg-body-secondary" style={{ height: '220px' }}>
                                    <img
                                        src={(p.images && p.images.length > 0 ? p.images[0] : p.image) || `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(p.name)}`}
                                        alt={p.name}
                                        className="w-100 h-100 object-fit-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(p.name)}`;
                                        }}
                                    />
                                </div>
                                <div className="card-body p-3">
                                    <p className="text-muted small text-uppercase mb-1" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>{p.category}</p>
                                    <h3 className="fs-6 fw-medium mb-1">{p.name}</h3>
                                    <span className="fw-medium">${p.price}</span>
                                    <button
                                        className="btn btn-success btn-sm w-100 mt-2 rounded-3"
                                        onClick={() => handleReactivar(p._id)}
                                    >
                                        Reactivar
                                    </button>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default InactiveProducts;
