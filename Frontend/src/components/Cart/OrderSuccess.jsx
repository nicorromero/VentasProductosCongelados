import { useNavigate } from 'react-router-dom';

const formatARS = (value) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

export default function OrderSuccess({ ordenCreada }) {
    const navigate = useNavigate();
    const entregaLabel = ordenCreada.metodoEntrega === 'envio' ? 'Envío a domicilio' : 'Retiro en local';
    const pagoLabel = ordenCreada.medioPago === 'transferencia' ? 'Transferencia bancaria' : 'Efectivo';

    return (
        <div className="container py-4 mx-auto" style={{ maxWidth: '860px' }}>
            <h1 className="fs-3 fw-semibold mb-4 text-center text-success">¡Gracias por tu compra!</h1>
            <div className="card border-0 shadow-sm rounded-4 p-4 mx-auto">
                <div className="d-flex justify-content-between mb-2"><span>N° de orden</span><strong>#{ordenCreada.numeroOrden}</strong></div>
                <div className="d-flex justify-content-between mb-2"><span>Total</span><strong>{formatARS(ordenCreada.total)}</strong></div>
                <div className="d-flex justify-content-between mb-2"><span>Entrega</span><span>{entregaLabel}</span></div>
                <div className="d-flex justify-content-between"><span>Medio de pago</span><span>{pagoLabel}</span></div>
            </div>

            <div className="mt-4">
                <p className="text-center fw-medium" style={{ fontSize: '1.1rem' }}>
                    ¡En breve nos comunicaremos por WhatsApp para confirmar tu pedido!
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
