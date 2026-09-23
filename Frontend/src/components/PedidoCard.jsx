import { useState, useRef, useEffect, useCallback } from "react";
import {
    CheckCircle2,
    Clock,
    ChevronDown,
    ChevronUp,
    Bike,
    Store,
    MapPin,
    DollarSign,
    Pencil,
    Trash2,
    X,
    Minus,
    Plus,
    Check,
    MessageCircle,
} from "lucide-react";
import axios from 'axios';
import { toast } from 'react-toastify';

const formatARS = (value) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

function PedidoCard({ order, done, onUpdate, onDelete, expandido, onToggle }) {
    const [editando, setEditando] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [cantidades, setCantidades] = useState({});

    const esEnvio = order.metodoEntrega === "envio";

    const resumenViandas = order.items
        .map(i => `${i.product?.name ?? '—'}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`)
        .join(", ");

    const total = order.total;

    const handleMarcar = async (e) => {
        e.stopPropagation();
        const nuevoEstado = done ? 'pendiente' : 'entregado';
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.patch(
                `${import.meta.env.VITE_API_BASE_URL}/api/ordenes/${order._id}/estado`,
                { estado: nuevoEstado },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onUpdate(data);
            toast.success(`Pedido marcado como ${nuevoEstado}`);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al actualizar el estado');
        }
    };

    const handleEliminar = async (e) => {
        e.stopPropagation();
        if (!confirmDelete) { setConfirmDelete(true); return; }
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/ordenes/${order._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onDelete(order._id);
            toast.success('Pedido eliminado');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al eliminar el pedido');
        }
    };

    const handleEditToggle = (e) => {
        e.stopPropagation();
        if (editando) {
            setCantidades({});
            setEditando(false);
        } else {
            const init = {};
            order.items.forEach(i => { init[i._id] = i.quantity; });
            setCantidades(init);
            setEditando(true);
            setConfirmDelete(false);
        }
    };

    const handleGuardarEdit = async (e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const itemsToUpdate = order.items.map(i => ({
                product: i.product._id,
                quantity: cantidades[i._id] ?? i.quantity,
                price: i.price
            }));

            const { data } = await axios.patch(
                `${import.meta.env.VITE_API_BASE_URL}/api/ordenes/${order._id}/items`,
                { items: itemsToUpdate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onUpdate(data);
            setEditando(false);
            setCantidades({});
            toast.success('Cantidades actualizadas');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al actualizar las cantidades');
        }
    };

    const changeCantidad = (id, delta) => {
        setCantidades(prev => ({
            ...prev,
            [id]: Math.max(1, (prev[id] ?? 1) + delta),
        }));
    };

    const totalEdit = order.items.reduce(
        (acc, i) => acc + Number(i.price) * (cantidades[i._id] ?? i.quantity),
        0
    );

    const cliente = order.facturacion?.nombreCompleto || order.user?.name || 'Desconocido';
    const celular = order.facturacion?.celular || '';
    const wsNumber = celular.replace(/[^0-9]/g, '');
    const domicilio = order.direccionEnvio 
        ? [order.direccionEnvio.calle, order.direccionEnvio.numero, order.direccionEnvio.ciudad].filter(Boolean).join(', ')
        : order.facturacion?.domicilio;

    return (
        <div
            className={`bg-white border rounded-xl mb-2 last:mb-0 cursor-pointer overflow-hidden transition-all
                ${done
                    ? "opacity-70 border-secondary"
                    : "border-secondary hover:border-success hover:shadow-sm"
                }
                ${expandido ? "border-success shadow-sm" : ""}
            `}
            style={{ backgroundColor: done ? '#f8f9fa' : '#ffffff' }}
            onClick={() => !editando && onToggle()}
            role="button"
            tabIndex={0}
        >
            {/* ── Cabecera ── */}
            <div className="d-flex align-items-center justify-content-between px-3 py-2" style={{ minHeight: '60px' }}>
                <div className="d-flex flex-column" style={{ minWidth: 0, flex: 1 }}>
                    <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-dark text-truncate" style={{ fontSize: '0.95rem' }}>
                            {cliente}
                        </span>
                        {celular && (
                            <span className="d-flex align-items-center gap-1 flex-shrink-0 text-muted" style={{ fontSize: '0.85rem' }}>
                                {celular}
                                {wsNumber && (
                                    <a
                                        className="text-success d-inline-flex align-items-center"
                                        href={`https://wa.me/${wsNumber}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Enviar WhatsApp"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <MessageCircle size={14} />
                                    </a>
                                )}
                            </span>
                        )}
                    </div>
                    <span className="text-muted text-truncate" style={{ fontSize: '0.75rem', maxWidth: '300px' }}>
                        {resumenViandas}
                    </span>
                </div>

                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <span className={`d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill text-uppercase fw-bold
                        ${esEnvio
                            ? "bg-success bg-opacity-10 text-success"
                            : "bg-warning bg-opacity-10 text-warning"
                        }`}
                        style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}
                    >
                        {esEnvio
                            ? <Bike size={11} color="currentColor" strokeWidth={2} />
                            : <Store size={11} color="currentColor" strokeWidth={2} />
                        }
                        {esEnvio ? "Envío" : "Retira"}
                    </span>

                    <span className="text-secondary">
                        {expandido
                            ? <ChevronUp size={16} color="currentColor" />
                            : <ChevronDown size={16} color="currentColor" />
                        }
                    </span>
                </div>
            </div>

            {/* ── Detalle expandible ── */}
            {expandido && (
                <div
                    className="px-3 pb-3 border-top"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Lista de viandas */}
                    <ul className="d-flex flex-column gap-1 pt-2 list-unstyled m-0">
                        {order.items.map(item => (
                            <li key={item._id} className="d-flex align-items-center gap-2 py-1" style={{ fontSize: '0.88rem' }}>
                                {editando ? (
                                    <div className="d-flex align-items-center gap-1 bg-light border rounded px-1 flex-shrink-0">
                                        <button
                                            className="btn btn-sm btn-link text-success p-0 d-flex align-items-center justify-content-center border-0 text-decoration-none"
                                            style={{ width: '22px', height: '22px' }}
                                            onClick={() => changeCantidad(item._id, -1)}
                                            disabled={cantidades[item._id] <= 1}
                                        >
                                            <Minus size={12} strokeWidth={2.5} />
                                        </button>
                                        <span className="fw-bold text-success text-center" style={{ minWidth: '20px', fontSize: '0.82rem' }}>
                                            {cantidades[item._id]}
                                        </span>
                                        <button
                                            className="btn btn-sm btn-link text-success p-0 d-flex align-items-center justify-content-center border-0 text-decoration-none"
                                            style={{ width: '22px', height: '22px' }}
                                            onClick={() => changeCantidad(item._id, +1)}
                                        >
                                            <Plus size={12} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                ) : (
                                    <span className="fw-bold text-success" style={{ fontSize: '0.8rem', minWidth: '24px' }}>
                                        ×{item.quantity}
                                    </span>
                                )}
                                <span className="flex-grow-1 text-dark">{item.product?.name ?? '—'}</span>
                                <span className="fw-semibold text-secondary" style={{ fontSize: '0.82rem' }}>
                                    {formatARS(Number(item.price) * (editando ? (cantidades[item._id] ?? item.quantity) : item.quantity))}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* Domicilio */}
                    {esEnvio && domicilio && (
                        <div className="d-flex align-items-center gap-2 text-secondary mt-2 px-2 py-1 bg-light rounded border" style={{ fontSize: '0.8rem' }}>
                            <MapPin size={13} color="currentColor" strokeWidth={2} />
                            <span>{domicilio}</span>
                        </div>
                    )}

                    {/* Total */}
                    <div className="d-flex align-items-center gap-2 mt-2 pt-2 border-top border-secondary border-opacity-25 text-secondary" style={{ fontSize: '0.9rem' }}>
                        <DollarSign size={15} color="#198754" strokeWidth={2} />
                        <span>Total</span>
                        <strong className="ms-auto fw-bold text-success" style={{ fontSize: '1.05rem' }}>
                            {formatARS(editando ? totalEdit : total)}
                        </strong>
                    </div>

                    {/* ── Fila de acciones ── */}
                    <div className="d-flex gap-2 mt-3 align-items-center">
                        {editando ? (
                            <>
                                <button
                                    className="flex-grow-1 btn btn-success btn-sm d-flex align-items-center justify-content-center gap-1 rounded-3 fw-semibold"
                                    onClick={handleGuardarEdit}
                                >
                                    <Check size={15} strokeWidth={2.5} />
                                    Guardar
                                </button>
                                <button
                                    className="flex-grow-1 btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center gap-1 rounded-3 fw-semibold"
                                    onClick={handleEditToggle}
                                >
                                    <X size={15} strokeWidth={2} />
                                    Cancelar
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className={`flex-grow-1 btn btn-sm d-flex align-items-center justify-content-center gap-1 rounded-3 fw-semibold
                                        ${done ? "btn-outline-secondary" : "btn-success"}`}
                                    onClick={handleMarcar}
                                >
                                    <CheckCircle2 size={15} strokeWidth={2} />
                                    {done ? "Pendiente" : "Entregado"}
                                </button>

                                <button
                                    className="btn btn-outline-warning btn-sm d-flex align-items-center justify-content-center rounded-3 px-2"
                                    onClick={handleEditToggle}
                                    title="Editar cantidades"
                                >
                                    <Pencil size={14} strokeWidth={2} />
                                </button>

                                <button
                                    className={`btn btn-sm d-flex align-items-center justify-content-center gap-1 rounded-3 fw-semibold px-2
                                        ${confirmDelete ? "btn-danger flex-grow-1" : "btn-outline-danger"}`}
                                    onClick={handleEliminar}
                                    onBlur={() => setConfirmDelete(false)}
                                >
                                    {confirmDelete ? (
                                        <><Trash2 size={14} strokeWidth={2} /> Confirmar</>
                                    ) : (
                                        <Trash2 size={14} strokeWidth={2} />
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function SeccionPedidos({ titulo, orders, done, onUpdate, onDelete }) {
    const [filtro, setFiltro] = useState("todos");
    const [expandedId, setExpandedId] = useState(null);
    const sectionRef = useRef(null);

    // Cerrar al hacer click fuera de la sección
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (sectionRef.current && !sectionRef.current.contains(e.target)) {
                setExpandedId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = useCallback((orderId) => {
        setExpandedId(prev => prev === orderId ? null : orderId);
    }, []);

    const ordenesFiltradas = filtro === "todos"
        ? orders
        : orders.filter(o => o.metodoEntrega === filtro);

    return (
        <section ref={sectionRef} className="bg-white border rounded-4 shadow-sm p-3 p-lg-4 h-100">
            {/* Encabezado */}
            <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap mb-3">
                <h2 className={`h6 fw-bold m-0 d-flex align-items-center gap-2 ${done ? "text-success" : "text-warning"}`}>
                    {done
                        ? <CheckCircle2 size={17} strokeWidth={2.2} />
                        : <Clock size={17} strokeWidth={2.2} />
                    }
                    {titulo}
                    <span className={`badge rounded-pill ${done ? "bg-success bg-opacity-10 text-success" : "bg-warning bg-opacity-10 text-warning"}`}>
                        {orders.length}
                    </span>
                </h2>

                {/* Toggle Retira / Envío */}
                <div className="d-flex gap-1 bg-light border rounded-3 p-1">
                    {["todos", "retiro", "envio"].map(op => (
                        <button
                            key={op}
                            className={`btn btn-sm d-flex align-items-center gap-1 px-2 py-1 border-0 rounded-2 text-nowrap fw-semibold
                                ${filtro === op
                                    ? "bg-white text-success shadow-sm"
                                    : "bg-transparent text-secondary"
                                }`}
                            style={{ fontSize: '0.7rem' }}
                            onClick={() => setFiltro(op)}
                        >
                            {op === "retiro" && <Store size={11} strokeWidth={2} />}
                            {op === "envio" && <Bike size={11} strokeWidth={2} />}
                            {op === "todos" ? "Todos" : op === "retiro" ? "Retira" : "Envío"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-3">
                {ordenesFiltradas.length === 0 ? (
                    <p className="text-secondary fst-italic" style={{ fontSize: '0.88rem' }}>No hay pedidos.</p>
                ) : (
                    ordenesFiltradas.map(order => (
                        <PedidoCard 
                            key={order._id} 
                            order={order} 
                            done={done} 
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            expandido={expandedId === order._id}
                            onToggle={() => handleToggle(order._id)}
                        />
                    ))
                )}
            </div>
        </section>
    );
}

export { PedidoCard, SeccionPedidos };
