import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../assets/css/Orders.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function getTokenData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

const formatARS = (value) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

const formatFecha = (dateString) =>
    new Date(dateString).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const textoEntrega = (metodo) =>
    metodo === 'envio' ? 'Envío a domicilio' : 'Retiro en local';

const ESTADO_CLASE = {
    'pendiente de pago':  'badge--pending',
    'pago confirmado':    'badge--confirmed',
    'enviado':            'badge--shipped',
    'listo para retiro':  'badge--ready',
    'entregado':          'badge--delivered',
    'cancelado':          'badge--cancelled',
};

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const tokenData = getTokenData();
    const isAdmin = tokenData?.role === 'admin';

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_URL}/api/ordenes`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(data);
            } catch (err) {
                setError(err.response?.data?.error || 'Error al cargar los pedidos');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleConfirmarPago = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.patch(
                `${API_URL}/api/ordenes/${orderId}/estado`,
                { estado: 'pago confirmado' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
            toast.success('Pago confirmado');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al actualizar el estado');
        }
    };

    const handleEliminarPedido = async (orderId) => {
        if (!window.confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
            toast.success('Pedido eliminado');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al eliminar el pedido');
        }
    };

    if (loading) return <div className="orders-page"><p className="orders-loading">Cargando pedidos...</p></div>;
    if (error)   return <div className="orders-page"><p className="orders-error">{error}</p></div>;

    if (orders.length === 0) {
        return (
            <div className="orders-page orders-empty">
                <p className="orders-empty__msg">
                    {isAdmin ? 'No hay pedidos registrados.' : 'Aún no tenés pedidos.'}
                </p>
                {!isAdmin && (
                    <Link to="/catalogo/hombres" className="app-btn orders-empty__btn">
                        Empezar a comprar
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="orders-page">
            <h1 className="orders-title">{isAdmin ? 'Todos los pedidos' : 'Mis pedidos'}</h1>

            <div className="orders-list">
                {orders.map((order) => {
                    const badgeClass = ESTADO_CLASE[order.estado] || 'badge--pending';
                    const dir = order.direccionEnvio;
                    const mostrarDireccion =
                        order.metodoEntrega === 'envio' &&
                        order.estado !== 'pendiente de pago' &&
                        dir && (dir.calle || dir.ciudad);

                    return (
                        <div key={order._id} className="order-card">

                            {/* Header */}
                            <div className="order-card__header">
                                <div className="order-card__id">
                                    <span className="order-card__num">Pedido #{order.numeroOrden}</span>
                                    <span className="order-card__date">{formatFecha(order.date)}</span>
                                </div>
                                <span className={`order-status-badge ${badgeClass}`}>{order.estado}</span>
                            </div>

                            {/* Info admin: usuario */}
                            {isAdmin && order.user && (
                                <div className="order-card__section">
                                    <p className="order-card__label">Cliente</p>
                                    <p className="order-card__value">{order.user.name} — {order.user.email}</p>
                                </div>
                            )}

                            {/* Entrega */}
                            <div className="order-card__section order-card__meta">
                                <div>
                                    <p className="order-card__label">Entrega</p>
                                    <p className="order-card__value">{textoEntrega(order.metodoEntrega)}</p>
                                    {mostrarDireccion && (
                                        <p className="order-card__value order-card__address">
                                            {[dir.calle, dir.numero, dir.ciudad, dir.provincia, dir.codigoPostal]
                                                .filter(Boolean).join(', ')}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="order-card__label">Medio de pago</p>
                                    <p className="order-card__value">
                                        {order.medioPago === 'transferencia' ? 'Transferencia bancaria' : 'Efectivo'}
                                    </p>
                                </div>
                            </div>

                            {/* Facturación */}
                            {order.facturacion && (
                                <div className="order-card__section">
                                    <p className="order-card__label">Facturación</p>
                                    <p className="order-card__value">
                                        {order.facturacion.nombreCompleto} · DNI {order.facturacion.dni} · {order.facturacion.domicilio}
                                    </p>
                                </div>
                            )}

                            {/* Items */}
                            <div className="order-card__section">
                                <p className="order-card__label">Productos</p>
                                <div className="order-items">
                                    <div className="order-items__header">
                                        <span>Producto</span>
                                        <span>Cant.</span>
                                        <span>Precio</span>
                                        <span>Subtotal</span>
                                    </div>
                                    {order.items.map((item, i) => (
                                        <div key={i} className="order-items__row">
                                            <span>{item.product?.name ?? '—'}</span>
                                            <span>{item.quantity}</span>
                                            <span>{formatARS(item.price)}</span>
                                            <span>{formatARS(item.subtotal)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <p className="order-total">Total: <strong>{formatARS(order.total)}</strong></p>

                            {isAdmin && (
                                <div className="order-card__actions">
                                    {order.estado === 'pendiente de pago' && (
                                        <button className="app-btn order-card__btn-confirm" onClick={() => handleConfirmarPago(order._id)}>
                                            Confirmar pago
                                        </button>
                                    )}
                                    <button className="app-btn order-card__btn-delete" onClick={() => handleEliminarPedido(order._id)}>
                                        Eliminar pedido
                                    </button>
                                </div>
                            )}

                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Orders;
