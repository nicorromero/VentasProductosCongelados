import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { getRole } from '../utils/auth';
import { SeccionPedidos } from '../components/PedidoCard';
import AdminOrdersSummary from '../components/Orders/AdminOrdersSummary';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedPendientes, setExpandedPendientes] = useState(false);

    const isAdmin = getRole() === 'admin';

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axiosClient.get('/api/ordenes');
                setOrders(data);
            } catch (err) {
                setError(err.response?.data?.error || 'Error al cargar los pedidos');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleUpdateOrder = (updatedOrder) => {
        setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    };

    const handleDeleteOrder = (orderId) => {
        setOrders(prev => prev.filter(o => o._id !== orderId));
    };

    if (loading) return (
        <div className="container py-5 text-center">
            <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Cargando pedidos...</span>
            </div>
            <p className="mt-2 text-muted">Cargando pedidos...</p>
        </div>
    );

    if (error) return (
        <div className="container py-5">
            <div className="alert alert-danger" role="alert">{error}</div>
        </div>
    );

    const pendientes = orders.filter(p => p.estado !== 'entregado');

    const porViandaPendientes = pendientes.reduce((acc, p) => {
        p.items.forEach(item => {
            const key = item.product?.name || "Sin nombre";
            acc[key] = (acc[key] || 0) + Number(item.quantity);
        });
        return acc;
    }, {});

    if (pendientes.length === 0) {
        return (
            <main className="container-fluid px-3 px-lg-4 py-4 pb-5">
                <AdminOrdersSummary 
                    porViandaPendientes={porViandaPendientes}
                    expandedPendientes={expandedPendientes}
                    setExpandedPendientes={setExpandedPendientes}
                />
                <div className="text-center py-5">
                    <p className="lead text-muted mb-0">
                        No hay pedidos pendientes.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="container-fluid px-3 px-lg-4 py-4 pb-5">
            <AdminOrdersSummary 
                porViandaPendientes={porViandaPendientes}
                expandedPendientes={expandedPendientes}
                setExpandedPendientes={setExpandedPendientes}
            />

            <div className="row g-4">
                <div className="col-12">
                    <SeccionPedidos
                        titulo="PENDIENTES"
                        orders={pendientes}
                        done={false}
                        onUpdate={handleUpdateOrder}
                        onDelete={handleDeleteOrder}
                    />
                </div>
            </div>
        </main>
    );
}

export default Orders;
