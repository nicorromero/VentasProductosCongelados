import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { getRole } from '../utils/auth';
import { SeccionPedidos } from '../components/PedidoCard';
import AdminOrdersSummary from '../components/Orders/AdminOrdersSummary';
import UserOrderCard from '../components/Orders/UserOrderCard';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedPendientes, setExpandedPendientes] = useState(false);
    const [expandedEntregados, setExpandedEntregados] = useState(false);

    const isAdmin = getRole() === 'admin';
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const endpoint = isAdmin ? '/api/ordenes' : '/api/mis-ordenes';
                const { data } = await axiosClient.get(endpoint);
                setOrders(data);
            } catch (err) {
                setError(err.response?.data?.error || 'Error al cargar los pedidos');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [isAdmin]);

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

    if (orders.length === 0) {
        return (
            <div className="container py-5 text-center">
                <p className="lead text-muted mb-4">
                    {isAdmin ? 'No hay pedidos registrados.' : 'Aún no tenés pedidos.'}
                </p>
                {!isAdmin && (
                    <Link to="/productos" className="btn btn-success">
                        Empezar a comprar
                    </Link>
                )}
            </div>
        );
    }

    if (isAdmin) {
        const entregados = orders.filter(p => p.estado === 'entregado');
        const pendientes = orders.filter(p => p.estado !== 'entregado');

        const porViandaPendientes = pendientes.reduce((acc, p) => {
            p.items.forEach(item => {
                const key = item.product?.name || "Sin nombre";
                acc[key] = (acc[key] || 0) + Number(item.quantity);
            });
            return acc;
        }, {});

        const porViandaEntregados = entregados.reduce((acc, p) => {
            p.items.forEach(item => {
                const key = item.product?.name || "Sin nombre";
                acc[key] = (acc[key] || 0) + Number(item.quantity);
            });
            return acc;
        }, {});

        return (
            <main className="container-fluid px-3 px-lg-4 py-4 pb-5">
                <AdminOrdersSummary 
                    porViandaPendientes={porViandaPendientes}
                    porViandaEntregados={porViandaEntregados}
                    expandedPendientes={expandedPendientes}
                    setExpandedPendientes={setExpandedPendientes}
                    expandedEntregados={expandedEntregados}
                    setExpandedEntregados={setExpandedEntregados}
                />

                <div className="row g-4">
                    <div className="col-12 col-lg-6">
                        <SeccionPedidos
                            titulo="PENDIENTES"
                            orders={pendientes}
                            done={false}
                            onUpdate={handleUpdateOrder}
                            onDelete={handleDeleteOrder}
                        />
                    </div>
                    <div className="col-12 col-lg-6">
                        <SeccionPedidos
                            titulo="ENTREGADAS"
                            orders={entregados}
                            done={true}
                            onUpdate={handleUpdateOrder}
                            onDelete={handleDeleteOrder}
                        />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <div className="container py-4" style={{ maxWidth: '860px' }}>
            <h1 className="fs-4 fw-semibold mb-4 pb-3 border-bottom">🧾 Mis pedidos</h1>
            <div className="row g-3">
                {orders.map((order) => (
                    <UserOrderCard key={order._id} order={order} />
                ))}
            </div>
        </div>
    );
}

export default Orders;
