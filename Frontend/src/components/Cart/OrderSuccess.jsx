import { useNavigate } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';

const formatARS = (value) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

export default function OrderSuccess({ ordenCreada }) {
    const navigate = useNavigate();
    const entregaLabel = ordenCreada.metodoEntrega === 'envio' ? 'Envío a domicilio' : 'Retiro en local';
    const pagoLabel = ordenCreada.medioPago === 'transferencia' ? 'Transferencia bancaria' : 'Efectivo';

    // Número admin del cliente: 3442 550569 (formato internacional WhatsApp Argentina: 5493442550569)
    const adminPhone = '5493442550569';

    const itemsList = (ordenCreada.items || []).map((item) => {
        const nombre = item.nombre || item.name || item.product?.name || 'Producto';
        const cant = item.quantity || 1;
        const subtotal = item.subtotal || ((item.precio || item.price || 0) * cant);
        return `• ${cant}x ${nombre}${subtotal ? ` (${formatARS(subtotal)})` : ''}`;
    }).join('\n');

    let mensaje = `¡Hola! Acabo de realizar el pedido #${ordenCreada.numeroOrden || ''} en la tienda:\n\n`;

    if (itemsList) {
        mensaje += `📋 *Detalle del pedido:*\n${itemsList}\n\n`;
    }

    mensaje += ` *Total:* ${formatARS(ordenCreada.total)}\n`;
    mensaje += `*Método de pago:* ${pagoLabel}\n`;
    mensaje += `*Método de entrega:* ${entregaLabel}`;

    if (ordenCreada.metodoEntrega === 'envio' && ordenCreada.facturacion?.domicilio) {
        mensaje += `\n*Domicilio:* ${ordenCreada.facturacion.domicilio}`;
    }

    if (ordenCreada.facturacion?.nombreCompleto) {
        mensaje += `\n *Cliente:* ${ordenCreada.facturacion.nombreCompleto}`;
    }

    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(mensaje)}`;

    return (
        <div className="container py-4 mx-auto" style={{ maxWidth: '860px' }}>
            <h1 className="fs-3 fw-semibold mb-4 text-center text-success">¡Gracias por tu compra!</h1>
            <div className="card border-0 shadow-sm rounded-4 p-4 mx-auto">
                <div className="d-flex justify-content-between mb-2"><span>N° de orden</span><strong>#{ordenCreada.numeroOrden}</strong></div>
                <div className="d-flex justify-content-between mb-2"><span>Total</span><strong>{formatARS(ordenCreada.total)}</strong></div>
                <div className="d-flex justify-content-between mb-2"><span>Entrega</span><span>{entregaLabel}</span></div>
                <div className="d-flex justify-content-between mb-2"><span>Medio de pago</span><span>{pagoLabel}</span></div>
                {ordenCreada.metodoEntrega === 'envio' && ordenCreada.facturacion?.domicilio && (
                    <div className="d-flex justify-content-between mb-2"><span>Domicilio</span><span>{ordenCreada.facturacion.domicilio}</span></div>
                )}
                {ordenCreada.items && ordenCreada.items.length > 0 && (
                    <div className="border-top pt-3 mt-2">
                        <span className="fw-semibold text-secondary small d-block mb-2">Detalle de productos:</span>
                        <ul className="list-unstyled mb-0 small">
                            {ordenCreada.items.map((item, idx) => (
                                <li key={idx} className="d-flex justify-content-between py-1">
                                    <span>{item.quantity}x {item.nombre || item.name || item.product?.name || 'Producto'}</span>
                                    <span className="text-muted">{formatARS(item.subtotal || ((item.precio || item.price || 0) * item.quantity))}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="mt-4 text-center d-flex flex-column align-items-center gap-3">
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success btn-lg px-4 py-3 rounded-pill fw-bold shadow-sm d-inline-flex align-items-center justify-content-center gap-2 text-decoration-none"
                    style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                >
                    <FaWhatsapp size={26} />
                    Confirmar pedido por WhatsApp
                </a>
                <p className="text-muted small mb-0">
                    Hacé clic en el botón para enviar el detalle de tu compra directamente a nuestro WhatsApp y coordinar la entrega.
                </p>
            </div>

            <div className="mt-4 text-center">
                <button className="btn btn-danger px-4 py-2 rounded-3" onClick={() => navigate('/productos')}>
                    Seguir comprando
                </button>
            </div>
        </div>
    );
}
