import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { getRole } from '../utils/auth';
import {
    TrendingUp,
    Package,
    DollarSign,
    ShoppingBag,
    ChevronDown,
    ChevronUp,
    CalendarDays,
    BarChart3,
    Bike,
    Store,
    MapPin,
    MessageCircle,
} from 'lucide-react';

const formatARS = (value) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

const formatFecha = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

function StatCard({ icon: Icon, label, value, color, subtext }) {
    return (
        <div className="col-6 col-md-3">
            <div className="bg-white border rounded-4 shadow-sm p-3 h-100">
                <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 36, height: 36, backgroundColor: `${color}15` }}>
                        <Icon size={18} color={color} strokeWidth={2.2} />
                    </div>
                    <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                        {label}
                    </span>
                </div>
                <div className="fw-bold text-dark" style={{ fontSize: '1.3rem', lineHeight: 1.2 }}>
                    {value}
                </div>
                {subtext && (
                    <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                        {subtext}
                    </div>
                )}
            </div>
        </div>
    );
}

function ProductBar({ name, quantity, maxQuantity, revenue }) {
    const pct = maxQuantity > 0 ? (quantity / maxQuantity) * 100 : 0;
    return (
        <div className="mb-3">
            <div className="d-flex justify-content-between align-items-end mb-1">
                <span className="fw-medium text-dark text-truncate me-2" style={{ fontSize: '0.85rem' }}>{name}</span>
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill" style={{ fontSize: '0.75rem' }}>
                        {quantity} uds.
                    </span>
                    <span className="text-muted fw-medium" style={{ fontSize: '0.78rem' }}>
                        {formatARS(revenue)}
                    </span>
                </div>
            </div>
            <div className="progress rounded-pill" style={{ height: 8 }}>
                <div className="progress-bar bg-success rounded-pill" role="progressbar"
                    style={{ width: `${pct}%`, transition: 'width 0.5s ease' }}
                    aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
                />
            </div>
        </div>
    );
}

function VentaRow({ order, expanded, onToggle }) {
    const esEnvio = order.metodoEntrega === 'envio';
    const cliente = order.facturacion?.nombreCompleto || order.user?.name || 'Desconocido';
    const celular = order.facturacion?.celular || '';
    const wsNumber = celular.replace(/[^0-9]/g, '');
    const domicilio = order.direccionEnvio
        ? [order.direccionEnvio.calle, order.direccionEnvio.numero, order.direccionEnvio.ciudad].filter(Boolean).join(', ')
        : order.facturacion?.domicilio;

    const resumen = order.items
        .map(i => `${i.product?.name ?? '—'}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`)
        .join(', ');

    return (
        <div
            className={`bg-white border rounded-3 mb-2 overflow-hidden ${expanded ? 'border-success shadow-sm' : 'border-secondary'}`}
            style={{ cursor: 'pointer', opacity: 0.85 }}
            onClick={onToggle}
            role="button"
            tabIndex={0}
        >
            {/* Header */}
            <div className="d-flex flex-column px-3 py-2 border-bottom" style={{ minHeight: '52px' }}>
                <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-dark text-truncate" style={{ fontSize: '0.9rem' }}>
                            {cliente}
                        </span>
                        {celular && (
                            <span className="d-flex align-items-center gap-1 flex-shrink-0 text-muted" style={{ fontSize: '0.8rem' }}>
                                {celular}
                                {wsNumber && (
                                    <a
                                        className="text-success d-inline-flex align-items-center ms-1"
                                        href={`https://wa.me/${wsNumber}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Enviar WhatsApp"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <MessageCircle size={13} />
                                    </a>
                                )}
                            </span>
                        )}
                    </div>
                    <div className="text-end flex-shrink-0">
                        {order.numeroOrden && (
                            <span className="d-block text-muted" style={{ fontSize: '0.7rem', lineHeight: 1 }}>
                                #{order.numeroOrden}
                            </span>
                        )}
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {formatFecha(order.date)}
                        </span>
                    </div>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                    <span className="text-muted text-truncate me-2" style={{ fontSize: '0.72rem', flex: 1 }}>
                        {resumen}
                    </span>
                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                        <span className="fw-bold text-success" style={{ fontSize: '0.85rem' }}>
                            {formatARS(order.total)}
                        </span>
                        <span className={`d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill text-uppercase fw-bold
                            ${esEnvio ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}
                            style={{ fontSize: '0.62rem', letterSpacing: '0.05em' }}
                        >
                            {esEnvio ? <Bike size={10} strokeWidth={2} /> : <Store size={10} strokeWidth={2} />}
                            {esEnvio ? 'Envío' : 'Retira'}
                        </span>
                        <span className="text-secondary">
                            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                    </div>
                </div>
            </div>

            {/* Detail */}
            {expanded && (
                <div className="px-3 pb-3 border-top" onClick={e => e.stopPropagation()}>
                    <ul className="d-flex flex-column gap-1 pt-2 list-unstyled m-0">
                        {order.items.map(item => (
                            <li key={item._id} className="d-flex align-items-center gap-2 py-1" style={{ fontSize: '0.85rem' }}>
                                <span className="fw-bold text-success" style={{ fontSize: '0.78rem', minWidth: '24px' }}>
                                    ×{item.quantity}
                                </span>
                                <span className="flex-grow-1 text-dark">{item.product?.name ?? '—'}</span>
                                <span className="fw-semibold text-secondary" style={{ fontSize: '0.8rem' }}>
                                    {formatARS(Number(item.price) * item.quantity)}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {esEnvio && domicilio && (
                        <div className="d-flex align-items-center gap-2 text-secondary mt-2 px-2 py-1 bg-light rounded border" style={{ fontSize: '0.78rem' }}>
                            <MapPin size={12} strokeWidth={2} />
                            <span>{domicilio}</span>
                        </div>
                    )}

                    <div className="d-flex align-items-center gap-2 mt-2 pt-2 border-top border-secondary border-opacity-25 text-secondary" style={{ fontSize: '0.85rem' }}>
                        <DollarSign size={14} color="#198754" strokeWidth={2} />
                        <span>Total</span>
                        <strong className="ms-auto fw-bold text-success" style={{ fontSize: '1rem' }}>
                            {formatARS(order.total)}
                        </strong>
                    </div>
                </div>
            )}
        </div>
    );
}

function Ventas() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [showAllOrders, setShowAllOrders] = useState(false);
    const [periodoFiltro, setPeriodoFiltro] = useState('todo');

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
                setError(err.response?.data?.error || 'Error al cargar las ventas');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const entregados = useMemo(() => {
        let filtrados = orders.filter(p => p.estado === 'entregado');

        if (periodoFiltro !== 'todo') {
            const ahora = new Date();
            let desde;
            if (periodoFiltro === 'hoy') {
                desde = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
            } else if (periodoFiltro === 'semana') {
                desde = new Date(ahora);
                desde.setDate(desde.getDate() - 7);
            } else if (periodoFiltro === 'mes') {
                desde = new Date(ahora);
                desde.setMonth(desde.getMonth() - 1);
            }
            if (desde) {
                filtrados = filtrados.filter(o => new Date(o.date) >= desde);
            }
        }

        return filtrados;
    }, [orders, periodoFiltro]);

    const stats = useMemo(() => {
        const totalVentas = entregados.reduce((sum, o) => sum + (o.total || 0), 0);
        const totalPedidos = entregados.length;
        const totalProductos = entregados.reduce(
            (sum, o) => sum + o.items.reduce((s, i) => s + Number(i.quantity), 0), 0
        );
        const promedioTicket = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

        return { totalVentas, totalPedidos, totalProductos, promedioTicket };
    }, [entregados]);

    const productoRanking = useMemo(() => {
        const mapa = {};
        entregados.forEach(o => {
            o.items.forEach(item => {
                const name = item.product?.name || 'Sin nombre';
                if (!mapa[name]) mapa[name] = { quantity: 0, revenue: 0 };
                mapa[name].quantity += Number(item.quantity);
                mapa[name].revenue += Number(item.price) * Number(item.quantity);
            });
        });
        return Object.entries(mapa)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.quantity - a.quantity);
    }, [entregados]);

    const maxQuantity = productoRanking.length > 0 ? productoRanking[0].quantity : 0;

    const ordersToShow = showAllOrders ? entregados : entregados.slice(0, 8);

    if (loading) return (
        <div className="container py-5 text-center">
            <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Cargando ventas...</span>
            </div>
            <p className="mt-2 text-muted">Cargando ventas...</p>
        </div>
    );

    if (error) return (
        <div className="container py-5">
            <div className="alert alert-danger" role="alert">{error}</div>
        </div>
    );

    return (
        <main className="container-fluid px-3 px-lg-4 py-4 pb-5">
            {/* Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 40, height: 40, backgroundColor: 'rgba(25, 135, 84, 0.1)' }}>
                        <TrendingUp size={20} color="#198754" strokeWidth={2.2} />
                    </div>
                    <div>
                        <h1 className="h5 fw-bold text-dark m-0">Ventas</h1>
                        <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>
                            Rendimiento de pedidos entregados
                        </p>
                    </div>
                </div>

                {/* Period filter */}
                <div className="d-flex gap-1 bg-light border rounded-3 p-1">
                    {[
                        { key: 'hoy', label: 'Hoy' },
                        { key: 'semana', label: '7 días' },
                        { key: 'mes', label: '30 días' },
                        { key: 'todo', label: 'Todo' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            className={`btn btn-sm px-3 py-1 border-0 rounded-2 fw-semibold user-select-none
                                ${periodoFiltro === key
                                    ? 'bg-white text-success shadow-sm'
                                    : 'bg-transparent text-secondary'
                                }`}
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => setPeriodoFiltro(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats cards */}
            <div className="row g-3 mb-4">
                <StatCard
                    icon={DollarSign}
                    label="Total vendido"
                    value={formatARS(stats.totalVentas)}
                    color="#198754"
                />
                <StatCard
                    icon={ShoppingBag}
                    label="Pedidos"
                    value={stats.totalPedidos}
                    color="#0d6efd"
                    subtext="entregados"
                />
                <StatCard
                    icon={Package}
                    label="Productos"
                    value={stats.totalProductos}
                    color="#6f42c1"
                    subtext="unidades vendidas"
                />
                <StatCard
                    icon={BarChart3}
                    label="Ticket promedio"
                    value={formatARS(stats.promedioTicket)}
                    color="#fd7e14"
                />
            </div>

            <div className="row g-4">
                {/* Product ranking */}
                <div className="col-12 col-lg-5">
                    <div className="bg-white border rounded-4 shadow-sm p-3 p-lg-4 h-100">
                        <h2 className="h6 fw-bold text-dark d-flex align-items-center gap-2 mb-3">
                            <BarChart3 size={17} color="#198754" strokeWidth={2.2} />
                            Ranking de productos
                        </h2>
                        {productoRanking.length === 0 ? (
                            <p className="text-muted fst-italic" style={{ fontSize: '0.88rem' }}>
                                No hay productos vendidos en este período.
                            </p>
                        ) : (
                            <div className="overflow-auto" style={{ maxHeight: '28rem' }}>
                                {productoRanking.map(p => (
                                    <ProductBar
                                        key={p.name}
                                        name={p.name}
                                        quantity={p.quantity}
                                        maxQuantity={maxQuantity}
                                        revenue={p.revenue}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Delivered orders list */}
                <div className="col-12 col-lg-7">
                    <div className="bg-white border rounded-4 shadow-sm p-3 p-lg-4 h-100 border-top border-3 border-success">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h2 className="h6 fw-bold text-success d-flex align-items-center gap-2 m-0">
                                <CalendarDays size={17} strokeWidth={2.2} />
                                Pedidos entregados
                                <span className="badge rounded-pill bg-success bg-opacity-10 text-success">
                                    {entregados.length}
                                </span>
                            </h2>
                        </div>

                        {entregados.length === 0 ? (
                            <p className="text-muted fst-italic" style={{ fontSize: '0.88rem' }}>
                                No hay pedidos entregados en este período.
                            </p>
                        ) : (
                            <>
                                <div className="overflow-auto" style={{ maxHeight: '32rem' }}>
                                    {ordersToShow.map(order => (
                                        <VentaRow
                                            key={order._id}
                                            order={order}
                                            expanded={expandedId === order._id}
                                            onToggle={() => setExpandedId(prev => prev === order._id ? null : order._id)}
                                        />
                                    ))}
                                </div>
                                {entregados.length > 8 && (
                                    <button
                                        className="btn btn-outline-success btn-sm w-100 mt-3 rounded-3 fw-semibold"
                                        onClick={() => setShowAllOrders(!showAllOrders)}
                                    >
                                        {showAllOrders ? 'Ver menos' : `Ver todos (${entregados.length})`}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Ventas;
