import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SeccionPedidos } from '../components/PedidoCard';
import { Save, ChevronDown, ChevronUp } from 'lucide-react';

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
    'pendiente': 'bg-warning text-dark',
    'entregado': 'bg-success',
};

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedPendientes, setExpandedPendientes] = useState(false);
    const [expandedEntregados, setExpandedEntregados] = useState(false);

    const tokenData = getTokenData();
    const isAdmin = tokenData?.role === 'admin';
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const endpoint = isAdmin ? `${API_URL}/api/ordenes` : `${API_URL}/api/mis-ordenes`;
                const { data } = await axios.get(endpoint, {
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
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <div className="d-flex flex-column rounded-4 border overflow-hidden shadow-sm bg-white" style={{ borderColor: '#dc3545' }}>
                            <div 
                                className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom border-danger border-opacity-25 user-select-none" 
                                style={{ cursor: 'pointer', backgroundColor: 'rgba(220, 53, 69, 0.05)' }}
                                onClick={() => setExpandedPendientes(!expandedPendientes)}
                            >
                                <span className="fw-bold text-uppercase text-danger" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                    Productos que faltan entregar
                                </span>
                                <span className="text-danger">
                                    {expandedPendientes ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </span>
                            </div>
                            {expandedPendientes && (
                                <ul className="list-unstyled m-0 overflow-auto px-3 py-2" style={{ maxHeight: '15rem' }}>
                                    {Object.entries(porViandaPendientes).length === 0 ? (
                                        <li className="text-danger opacity-75 fst-italic py-1" style={{ fontSize: '0.8rem' }}>No hay productos pendientes.</li>
                                    ) : (
                                        Object.entries(porViandaPendientes).map(([vianda, total]) => (
                                            <li key={vianda} className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                                                <span className="text-dark fw-medium text-truncate me-2" style={{ fontSize: '0.85rem' }}>{vianda}</span>
                                                <span className="badge bg-danger rounded-pill flex-shrink-0" style={{ fontSize: '0.8rem' }}>{total}</span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="d-flex flex-column rounded-4 border overflow-hidden shadow-sm bg-white" style={{ borderColor: '#198754' }}>
                            <div 
                                className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom border-success border-opacity-25 user-select-none" 
                                style={{ cursor: 'pointer', backgroundColor: 'rgba(25, 135, 84, 0.05)' }}
                                onClick={() => setExpandedEntregados(!expandedEntregados)}
                            >
                                <span className="fw-bold text-uppercase text-success" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                    Productos entregados
                                </span>
                                <span className="text-success">
                                    {expandedEntregados ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </span>
                            </div>
                            {expandedEntregados && (
                                <ul className="list-unstyled m-0 overflow-auto px-3 py-2" style={{ maxHeight: '15rem' }}>
                                    {Object.entries(porViandaEntregados).length === 0 ? (
                                        <li className="text-success opacity-75 fst-italic py-1" style={{ fontSize: '0.8rem' }}>No hay productos entregados.</li>
                                    ) : (
                                        Object.entries(porViandaEntregados).map(([vianda, total]) => (
                                            <li key={vianda} className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                                                <span className="text-dark fw-medium text-truncate me-2" style={{ fontSize: '0.85rem' }}>{vianda}</span>
                                                <span className="badge bg-success rounded-pill flex-shrink-0" style={{ fontSize: '0.8rem' }}>{total}</span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

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
                {orders.map((order) => {
                    const badgeClass = `badge ${ESTADO_CLASE[order.estado] || 'bg-secondary'}`;
                    const dir = order.direccionEnvio;
                    const mostrarDireccion =
                        order.metodoEntrega === 'envio' &&
                        order.estado !== 'pendiente' &&
                        dir && (dir.calle || dir.ciudad);

                    return (
                        <div key={order._id} className="col-12">
                            <div className="card border-0 shadow-sm rounded-3 mb-3 overflow-hidden" style={{ borderLeft: `4px solid ${order.estado === 'entregado' ? '#198754' : order.estado === 'pendiente' ? '#ffc107' : '#6c757d'}` }}>
                                <div className="card-header bg-white border-bottom-0 d-flex justify-content-between align-items-center pt-3 px-3">
                                    <div>
                                        <h6 className="mb-0 fw-semibold">Pedido #{order.numeroOrden}</h6>
                                        <small className="text-muted">{formatFecha(order.date)}</small>
                                    </div>
                                    <span className={`${badgeClass} rounded-pill px-3 py-1`}>{order.estado}</span>
                                </div>
                                <div className="card-body pt-0">
                                    <div className="row mb-3">
                                        <div className="col-sm-6 mb-2 mb-sm-0">
                                            <span className="text-muted small d-block">Entrega</span>
                                            <strong>{textoEntrega(order.metodoEntrega)}</strong>
                                            {mostrarDireccion && (
                                                <span className="d-block small text-muted">
                                                    {[dir.calle, dir.numero, dir.ciudad, dir.provincia, dir.codigoPostal].filter(Boolean).join(', ')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="col-sm-6">
                                            <span className="text-muted small d-block">Medio de pago</span>
                                            <strong>{order.medioPago === 'transferencia' ? 'Transferencia bancaria' : 'Efectivo'}</strong>
                                        </div>
                                    </div>

                                    {order.facturacion && (
                                        <div className="mb-3">
                                            <span className="text-muted small d-block">Facturación</span>
                                            <span className="small">
                                                {order.facturacion.nombreCompleto} · DNI {order.facturacion.dni} · {order.facturacion.domicilio}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <span className="text-muted small d-block mb-2">Productos</span>
                                        <div className="table-responsive">
                                            <table className="table table-sm table-borderless mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Producto</th>
                                                        <th className="text-center">Cant.</th>
                                                        <th className="text-end">Precio</th>
                                                        <th className="text-end">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.items.map((item, i) => (
                                                        <tr key={i}>
                                                            <td>{item.product?.name ?? '—'}</td>
                                                            <td className="text-center">{item.quantity}</td>
                                                            <td className="text-end">{formatARS(item.price)}</td>
                                                            <td className="text-end fw-semibold">{formatARS(item.subtotal)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-end align-items-center border-top pt-3">
                                        <span className="me-2 text-muted">Total:</span>
                                        <strong className="fs-5 text-success">{formatARS(order.total)}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Orders;
