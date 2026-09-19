import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Trash2, MessageCircle, Eye } from 'lucide-react';

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
    'pendiente de pago':  'bg-warning text-dark',
    'pago confirmado':    'bg-primary',
    'enviado':            'bg-info text-dark',
    'listo para retiro':  'bg-info text-dark',
    'entregado':          'bg-success',
    'cancelado':          'bg-danger',
};

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEntrega, setFiltroEntrega] = useState('todos');
    const [filtroFecha, setFiltroFecha] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos'); // Agregado el tercer filtro
    const [orderModal, setOrderModal] = useState(null);

    const tokenData = getTokenData();
    const isAdmin = tokenData?.role === 'admin';
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
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
    }, [isAdmin, navigate]);

    const handleCambiarEstado = async (orderId, nuevoEstado) => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.patch(
                `${API_URL}/api/ordenes/${orderId}/estado`,
                { estado: nuevoEstado },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
            toast.success('Estado actualizado');
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

    if (loading) return (
        <div className="container py-5 text-center">
            <div className="spinner-border text-primary" role="status">
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
                    <Link to="/catalogo/hombres" className="btn btn-primary">
                        Empezar a comprar
                    </Link>
                )}
            </div>
        );
    }

    const ordenesFiltradas = isAdmin ? orders.filter(order => {
        let matchEntrega = true;
        if (filtroEntrega !== 'todos') {
            matchEntrega = order.metodoEntrega === filtroEntrega;
        }

        let matchFecha = true;
        if (filtroFecha) {
            const orderDate = new Date(order.date).toISOString().split('T')[0];
            matchFecha = orderDate === filtroFecha;
        }

        let matchEstado = true;
        if (filtroEstado !== 'todos') {
            matchEstado = order.estado === filtroEstado;
        }

        return matchEntrega && matchFecha && matchEstado;
    }) : orders;

    return (
        <div className={isAdmin ? 'container-fluid py-4' : 'container py-4'}>
            <h1 className="mb-4">{isAdmin ? 'Todos los pedidos' : 'Mis pedidos'}</h1>

            {isAdmin ? (
                <>
                    <div className="table-responsive" style={{ minHeight: '60vh' }}>
                        <table className="table table-dark table-striped table-hover align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th>
                                        <div className="dropdown">
                                            <span className="dropdown-toggle text-white user-select-none" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ cursor: 'pointer' }}>
                                                Pedido {filtroFecha && <span className="badge bg-danger ms-1" style={{fontSize: '0.6rem'}}>1</span>}
                                            </span>
                                            <div className="dropdown-menu dropdown-menu-dark p-2 shadow border-secondary" onClick={e => e.stopPropagation()} style={{ minWidth: '180px' }}>
                                                <input type="date" className="form-control form-control-sm bg-dark text-white border-secondary" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />
                                                {filtroFecha && <button className="btn btn-sm btn-danger mt-2 w-100" onClick={() => setFiltroFecha('')}>Limpiar</button>}
                                            </div>
                                        </div>
                                    </th>
                                    <th>Cliente</th>
                                    <th>Teléfono</th>
                                    <th>
                                        <div className="dropdown">
                                            <span className="dropdown-toggle text-white user-select-none" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ cursor: 'pointer' }}>
                                                Entrega {filtroEntrega !== 'todos' && <span className="badge bg-danger ms-1" style={{fontSize: '0.6rem'}}>1</span>}
                                            </span>
                                            <ul className="dropdown-menu dropdown-menu-dark shadow border-secondary">
                                                <li><button className={`dropdown-item ${filtroEntrega === 'todos' ? 'active' : ''}`} onClick={() => setFiltroEntrega('todos')}>Todos</button></li>
                                                <li><button className={`dropdown-item ${filtroEntrega === 'envio' ? 'active' : ''}`} onClick={() => setFiltroEntrega('envio')}>Envío a domicilio</button></li>
                                                <li><button className={`dropdown-item ${filtroEntrega === 'retiro' ? 'active' : ''}`} onClick={() => setFiltroEntrega('retiro')}>Retiro en local</button></li>
                                            </ul>
                                        </div>
                                    </th>
                                    <th>Detalle</th>
                                    <th>Total</th>
                                    <th>
                                        <div className="dropdown">
                                            <span className="dropdown-toggle text-white user-select-none" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ cursor: 'pointer' }}>
                                                Estado {filtroEstado !== 'todos' && <span className="badge bg-danger ms-1" style={{fontSize: '0.6rem'}}>1</span>}
                                            </span>
                                            <ul className="dropdown-menu dropdown-menu-dark shadow border-secondary">
                                                <li><button className={`dropdown-item ${filtroEstado === 'todos' ? 'active' : ''}`} onClick={() => setFiltroEstado('todos')}>Todos</button></li>
                                                {Object.keys(ESTADO_CLASE).map(est => (
                                                    <li key={est}><button className={`dropdown-item text-capitalize ${filtroEstado === est ? 'active' : ''}`} onClick={() => setFiltroEstado(est)}>{est}</button></li>
                                                ))}
                                            </ul>
                                        </div>
                                    </th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordenesFiltradas.map((order) => {
                                    const nombre = order.facturacion?.nombreCompleto || order.user?.name || '—';
                                    const celular = order.facturacion?.celular || '—';
                                    const direccionForm = order.facturacion?.domicilio;
                                    
                                    const wsNumber = order.facturacion?.celular ? order.facturacion.celular.replace(/[^0-9]/g, '') : '';
                                    
                                    return (
                                        <tr key={order._id}>
                                            <td className="text-nowrap">
                                                #{order.numeroOrden}<br/>
                                                <small className="text-muted">{formatFecha(order.date)}</small>
                                            </td>
                                            <td style={{ wordBreak: 'break-word', minWidth: '100px' }}>{nombre}</td>
                                            <td className="text-nowrap">
                                                <div className="d-flex align-items-center gap-2">
                                                    {celular}
                                                    {wsNumber && (
                                                        <a 
                                                            className="text-success d-flex align-items-center" 
                                                            href={`https://wa.me/${wsNumber}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            title="Enviar WhatsApp"
                                                        >
                                                            <MessageCircle size={18} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ wordBreak: 'break-word', minWidth: '120px' }}>
                                                {order.metodoEntrega === 'envio' && direccionForm ? direccionForm : 'Retiro en local'}
                                            </td>
                                            <td>
                                                <button className="btn btn-secondary btn-sm d-flex align-items-center justify-content-center px-2 py-1" onClick={() => setOrderModal(order)} title="Ver detalle">
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                            <td className="text-nowrap"><strong>{formatARS(order.total)}</strong></td>
                                            <td>
                                                <select 
                                                    className={`form-select form-select-sm fw-bold border-0 ${ESTADO_CLASE[order.estado] || 'bg-secondary text-white'}`} 
                                                    value={order.estado}
                                                    onChange={(e) => handleCambiarEstado(order._id, e.target.value)}
                                                    style={{ minWidth: '130px', cursor: 'pointer' }}
                                                >
                                                    {Object.keys(ESTADO_CLASE).map(est => (
                                                        <option key={est} value={est} className="bg-white text-dark fw-normal text-capitalize">{est}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2 justify-content-center">
                                                    <button className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center px-2 py-1" onClick={() => handleEliminarPedido(order._id)} title="Eliminar pedido">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {ordenesFiltradas.length === 0 && (
                            <div className="text-center py-4 text-muted border-bottom border-secondary">
                                No se encontraron pedidos con esos filtros.
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="row g-3">
                    {orders.map((order) => {
                        const badgeClass = `badge ${ESTADO_CLASE[order.estado] || 'bg-secondary'}`;
                        const dir = order.direccionEnvio;
                        const mostrarDireccion =
                            order.metodoEntrega === 'envio' &&
                            order.estado !== 'pendiente de pago' &&
                            dir && (dir.calle || dir.ciudad);

                        return (
                            <div key={order._id} className="col-12">
                                <div className="card border-0 shadow-sm rounded-3 mb-3">
                                    <div className="card-header bg-white border-bottom-0 d-flex justify-content-between align-items-center pt-3">
                                        <div>
                                            <h6 className="mb-0">Pedido #{order.numeroOrden}</h6>
                                            <small className="text-muted">{formatFecha(order.date)}</small>
                                        </div>
                                        <span className={badgeClass}>{order.estado}</span>
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
                                            <span className="me-2">Total:</span>
                                            <strong className="fs-5">{formatARS(order.total)}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {orderModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={() => setOrderModal(null)}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Detalle - Pedido #{orderModal.numeroOrden}</h5>
                                <button type="button" className="btn-close" onClick={() => setOrderModal(null)} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-muted small mb-3">Fecha: {formatFecha(orderModal.date)}</p>
                                <ul className="list-group list-group-flush mb-3">
                                    {orderModal.items.map((item, i) => (
                                        <li key={i} className="list-group-item px-0">
                                            <div className="fw-bold">{item.quantity}x {item.product?.name ?? '—'}</div>
                                            <div className="small text-muted">Precio unitario: {formatARS(item.price)}</div>
                                            <div className="small fw-medium">Subtotal: {formatARS(item.subtotal)}</div>
                                        </li>
                                    ))}
                                </ul>
                                <div className="text-end fs-5">
                                    Total: <strong>{formatARS(orderModal.total)}</strong>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary w-100" onClick={() => setOrderModal(null)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Orders;
