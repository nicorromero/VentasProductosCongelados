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

export default function UserOrderCard({ order }) {
    const badgeClass = `badge ${ESTADO_CLASE[order.estado] || 'bg-secondary'}`;
    const dir = order.direccionEnvio;
    const mostrarDireccion =
        order.metodoEntrega === 'envio' &&
        order.estado !== 'pendiente' &&
        dir && (dir.calle || dir.ciudad);

    return (
        <div className="col-12">
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
}
