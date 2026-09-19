import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useCart from '../hooks/useCart';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const formatARS = (value) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

function Cart() {
    const { cartItems, increaseQty, decreaseQty, removeFromCart, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();

    const [showCheckout, setShowCheckout] = useState(false);
    const [facturacion, setFacturacion] = useState({ nombreCompleto: '', celular: '', domicilio: '' });
    const [medioPago, setMedioPago] = useState('efectivo');
    const [metodoEntrega, setMetodoEntrega] = useState('retiro');
    const [enviandoPedido, setEnviandoPedido] = useState(false);
    const [ordenCreada, setOrdenCreada] = useState(null);

    // ── Vista de confirmación ────────────────────────────
    if (ordenCreada) {
        const entregaLabel = ordenCreada.metodoEntrega === 'envio' ? 'Envío a domicilio' : 'Retiro en local';
        const pagoLabel = ordenCreada.medioPago === 'transferencia' ? 'Transferencia bancaria' : 'Efectivo';

        return (
            <div className="container py-4 mx-auto" style={{ maxWidth: '860px' }}>
                <h1 className="fs-3 fw-semibold mb-4 text-center">¡Gracias por tu compra!</h1>
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
                    <button className="btn btn-danger px-4 py-2 rounded-3" onClick={() => navigate('/catalogo/hombres')}>
                        Seguir comprando
                    </button>
                </div>
            </div>
        );
    }

    // ── Carrito vacío ────────────────────────────────────
    if (cartItems.length === 0) {
        return (
            <div className="container py-4 mx-auto d-flex flex-column align-items-center justify-content-center gap-3" style={{ maxWidth: '860px', minHeight: '40vh' }}>
                <p className="fs-5 text-muted mb-0">Tu carrito está vacío</p>
                <Link to="/catalogo/hombres" className="btn btn-danger px-4 py-2 rounded-3">
                    Ver productos
                </Link>
            </div>
        );
    }

    function handleCheckout() {
        setShowCheckout(true);
    }

    function handleClearCart() {
        if (window.confirm('¿Vaciar el carrito? Se eliminarán todos los productos.')) {
            clearCart();
        }
    }

    async function handleRealizarPedido() {
        // Validaciones
        if (!facturacion.nombreCompleto || !facturacion.celular) {
            toast.error('Completá tus datos personales');
            return;
        }
        if (metodoEntrega === 'envio' && !facturacion.domicilio) {
            toast.error('Completá el domicilio de envío');
            return;
        }

        const body = {
            items: cartItems.map((item) => ({ product: item._id, quantity: item.quantity })),
            medioPago,
            metodoEntrega,
            facturacion: {
                nombreCompleto: facturacion.nombreCompleto,
                celular: `+54 3442 ${facturacion.celular}`,
                domicilio: metodoEntrega === 'envio' ? facturacion.domicilio : ''
            }
        };

        setEnviandoPedido(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API_URL}/api/ordenes`, body, {
                headers: { Authorization: `Bearer ${token}` }
            });
            clearCart();
            setOrdenCreada(data);
            setShowCheckout(false);
            toast.success('¡Pedido realizado con éxito!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al realizar el pedido');
        } finally {
            setEnviandoPedido(false);
        }
    }

    return (
        <div className="container py-4 mx-auto" style={{ maxWidth: '860px' }}>
            <h1 className="fs-3 fw-semibold mb-3">Tu carrito</h1>

            <ul className="list-unstyled d-flex flex-column gap-3 mb-4">
                {cartItems.map((item) => (
                    <li key={item._id} className="bg-body-secondary rounded-3 p-3 d-flex align-items-center gap-3 flex-wrap">
                        <img
                            className="rounded-3 bg-body-tertiary object-fit-cover flex-shrink-0"
                            style={{ width: '80px', height: '80px' }}
                            src={item.imagen || `https://placehold.co/80x80/eaebec/999999?text=${encodeURIComponent(item.nombre || 'Producto')}`}
                            alt={item.nombre}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://placehold.co/80x80/eaebec/999999?text=${encodeURIComponent(item.nombre || 'Producto')}`;
                            }}
                        />
                        <div className="flex-grow-1">
                            <p className="fw-medium small mb-1">{item.nombre}</p>
                            <p className="text-muted small mb-0">{formatARS(item.precio)} c/u</p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <button className="btn btn-outline-dark btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }} onClick={() => decreaseQty(item._id)} aria-label="Disminuir cantidad">−</button>
                            <span className="fw-medium text-center small" style={{ minWidth: '24px' }}>{item.quantity}</span>
                            <button className="btn btn-outline-dark btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }} onClick={() => increaseQty(item._id)} aria-label="Aumentar cantidad">+</button>
                        </div>
                        <p className="fw-semibold text-nowrap mb-0">{formatARS(item.precio * item.quantity)}</p>
                        <button className="btn btn-outline-danger btn-sm rounded-3" onClick={() => removeFromCart(item._id)} aria-label="Eliminar producto">
                            Eliminar
                        </button>
                    </li>
                ))}
            </ul>

            <div className="border-top pt-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <p className="fs-5 mb-0">
                    Total: <strong>{formatARS(cartTotal)}</strong>
                </p>
                {!showCheckout && (
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-dark" onClick={handleClearCart}>
                            Vaciar carrito
                        </button>
                        <button className="btn btn-danger" onClick={handleCheckout}>
                            Finalizar compra
                        </button>
                    </div>
                )}
            </div>

            {showCheckout && (
                <div className="border-top pt-4 mt-4 d-flex flex-column gap-4">

                    <section>
                        <h2 className="fs-6 fw-semibold border-bottom pb-2 mb-3">Tus datos</h2>
                        <div className="mb-3">
                            <label className="form-label">Nombre completo</label>
                            <input
                                type="text"
                                className="form-control rounded-3"
                                value={facturacion.nombreCompleto}
                                onChange={(e) => setFacturacion({ ...facturacion, nombreCompleto: e.target.value })}
                                placeholder="Juan Pérez"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Celular</label>
                            <div className="d-flex gap-2">
                                <input
                                    type="text"
                                    className="form-control rounded-3 text-center bg-light"
                                    value="+54"
                                    disabled
                                    style={{ width: '60px' }}
                                />
                                <input
                                    type="text"
                                    className="form-control rounded-3 text-center bg-light"
                                    value="3442"
                                    disabled
                                    style={{ width: '80px' }}
                                />
                                <input
                                    type="text"
                                    className="form-control rounded-3 flex-grow-1"
                                    value={facturacion.celular}
                                    onChange={(e) => setFacturacion({ ...facturacion, celular: e.target.value })}
                                    placeholder="65872"
                                />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="fs-6 fw-semibold border-bottom pb-2 mb-3">Medio de pago</h2>
                        <div className="d-flex gap-3">
                            <div className="form-check">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    name="medioPago"
                                    id="pagoEfectivo"
                                    value="efectivo"
                                    checked={medioPago === 'efectivo'}
                                    onChange={() => setMedioPago('efectivo')}
                                />
                                <label className="form-check-label" htmlFor="pagoEfectivo">Efectivo</label>
                            </div>
                            <div className="form-check">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    name="medioPago"
                                    id="pagoTransferencia"
                                    value="transferencia"
                                    checked={medioPago === 'transferencia'}
                                    onChange={() => setMedioPago('transferencia')}
                                />
                                <label className="form-check-label" htmlFor="pagoTransferencia">Transferencia bancaria</label>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="fs-6 fw-semibold border-bottom pb-2 mb-3">Entrega</h2>
                        <div className="d-flex gap-3 mb-3">
                            <div className="form-check">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    name="metodoEntrega"
                                    id="entregaRetiro"
                                    value="retiro"
                                    checked={metodoEntrega === 'retiro'}
                                    onChange={() => setMetodoEntrega('retiro')}
                                />
                                <label className="form-check-label" htmlFor="entregaRetiro">Retirar en local</label>
                            </div>
                            <div className="form-check">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    name="metodoEntrega"
                                    id="entregaEnvio"
                                    value="envio"
                                    checked={metodoEntrega === 'envio'}
                                    onChange={() => setMetodoEntrega('envio')}
                                />
                                <label className="form-check-label" htmlFor="entregaEnvio">Envío a domicilio</label>
                            </div>
                        </div>

                        {metodoEntrega === 'envio' && (
                            <div className="mb-3">
                                <label className="form-label">Domicilio</label>
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    value={facturacion.domicilio}
                                    onChange={(e) => setFacturacion({ ...facturacion, domicilio: e.target.value })}
                                    placeholder="Av. Corrientes 1234, CABA"
                                />
                            </div>
                        )}
                    </section>

                    <div className="d-flex justify-content-end gap-2 mt-2">
                        <button type="button" className="btn btn-outline-dark" onClick={() => setShowCheckout(false)}
                            disabled={enviandoPedido}>
                            Volver
                        </button>
                        <button type="button" className="btn btn-danger" onClick={handleRealizarPedido}
                            disabled={enviandoPedido}>
                            {enviandoPedido ? 'Procesando...' : 'Realizar pedido'}
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}

export default Cart;
