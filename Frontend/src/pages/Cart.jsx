import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useCart from '../hooks/useCart';
import '../assets/css/Cart.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const formatARS = (value) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

function Cart() {
    const { cartItems, increaseQty, decreaseQty, removeFromCart, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();

    const [showCheckout, setShowCheckout] = useState(false);
    const [facturacion, setFacturacion] = useState({ nombreCompleto: '', dni: '', domicilio: '' });
    const [medioPago, setMedioPago] = useState('efectivo');
    const [metodoEntrega, setMetodoEntrega] = useState('retiro');
    const [usarDomicilioFacturacion, setUsarDomicilioFacturacion] = useState(true);
    const [direccionEnvio, setDireccionEnvio] = useState({ calle: '', numero: '', ciudad: '', provincia: '', codigoPostal: '' });
    const [enviandoPedido, setEnviandoPedido] = useState(false);
    const [ordenCreada, setOrdenCreada] = useState(null);

    // ── Vista de confirmación ────────────────────────────
    if (ordenCreada) {
        const entregaLabel = ordenCreada.metodoEntrega === 'envio' ? 'Envío a domicilio' : 'Retiro en local';
        const pagoLabel = ordenCreada.medioPago === 'transferencia' ? 'Transferencia bancaria' : 'Efectivo';

        return (
            <div className="cart-confirm">
                <h1 className="cart-confirm__title">¡Gracias por tu compra!</h1>
                <div className="cart-confirm__card">
                    <p className="cart-confirm__row"><span>N° de orden</span><strong>#{ordenCreada.numeroOrden}</strong></p>
                    <p className="cart-confirm__row"><span>Total</span><strong>{formatARS(ordenCreada.total)}</strong></p>
                    <p className="cart-confirm__row"><span>Entrega</span><span>{entregaLabel}</span></p>
                    <p className="cart-confirm__row"><span>Medio de pago</span><span>{pagoLabel}</span></p>
                </div>

                {ordenCreada.medioPago === 'transferencia' && (
                    <div className="cart-confirm__transfer">
                        <h2 className="cart-confirm__transfer-title">Datos para la transferencia</h2>
                        <p className="cart-confirm__row"><span>Alias</span><strong>mitienda.shop</strong></p>
                        <p className="cart-confirm__row"><span>CBU</span><strong>0000003100012345678901</strong></p>
                        <p className="cart-confirm__row"><span>Banco</span><span>Banco Ejemplo</span></p>
                        <p className="cart-confirm__row"><span>Titular</span><span>Mi Tienda SRL</span></p>
                        <p className="cart-confirm__transfer-note">
                            Una vez realizada la transferencia, te contactaremos para confirmar tu pedido.
                        </p>
                    </div>
                )}

                <div className="cart-confirm__actions">
                    <button className="app-btn checkout-btn--back" onClick={() => navigate('/pedidos')}>
                        Ver mis pedidos
                    </button>
                    <button className="app-btn checkout-btn--submit" onClick={() => navigate('/catalogo/hombres')}>
                        Seguir comprando
                    </button>
                </div>
            </div>
        );
    }

    // ── Carrito vacío ────────────────────────────────────
    if (cartItems.length === 0) {
        return (
            <div className="cart-empty">
                <p className="cart-empty__msg">Tu carrito está vacío</p>
                <Link to="/catalogo/hombres" className="app-btn cart-empty__link">
                    Ver productos
                </Link>
            </div>
        );
    }

    function handleCheckout() {
        if (!localStorage.getItem('token')) {
            navigate('/login?redirect=/carrito');
            return;
        }
        setShowCheckout(true);
    }

    function handleClearCart() {
        if (window.confirm('¿Vaciar el carrito? Se eliminarán todos los productos.')) {
            clearCart();
        }
    }

    async function handleRealizarPedido() {
        // Validaciones
        if (!facturacion.nombreCompleto || !facturacion.dni || !facturacion.domicilio) {
            toast.error('Completá los datos de facturación');
            return;
        }
        if (metodoEntrega === 'envio' && !usarDomicilioFacturacion) {
            const { calle, numero, ciudad, provincia, codigoPostal } = direccionEnvio;
            if (!calle || !numero || !ciudad || !provincia || !codigoPostal) {
                toast.error('Completá los datos de envío');
                return;
            }
        }

        const body = {
            items: cartItems.map((item) => ({ product: item._id, quantity: item.quantity })),
            medioPago,
            metodoEntrega,
            facturacion,
            ...(metodoEntrega === 'envio' && !usarDomicilioFacturacion && { direccionEnvio })
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
        <div className="cart-page">
            <h1 className="cart-title">Tu carrito</h1>

            <ul className="cart-list">
                {cartItems.map((item) => (
                    <li key={item._id} className="cart-item">
                        <img
                            className="cart-item__img"
                            src={item.imagen || `https://placehold.co/80x80/eaebec/999999?text=${encodeURIComponent(item.nombre || 'Producto')}`}
                            alt={item.nombre}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://placehold.co/80x80/eaebec/999999?text=${encodeURIComponent(item.nombre || 'Producto')}`;
                            }}
                        />
                        <div className="cart-item__info">
                            <p className="cart-item__name">{item.nombre}</p>
                            <p className="cart-item__unit">{formatARS(item.precio)} c/u</p>
                        </div>
                        <div className="cart-item__qty">
                            <button className="qty-btn" onClick={() => decreaseQty(item._id)} aria-label="Disminuir cantidad">−</button>
                            <span className="qty-value">{item.quantity}</span>
                            <button className="qty-btn" onClick={() => increaseQty(item._id)} aria-label="Aumentar cantidad">+</button>
                        </div>
                        <p className="cart-item__subtotal">{formatARS(item.precio * item.quantity)}</p>
                        <button className="cart-item__remove" onClick={() => removeFromCart(item._id)} aria-label="Eliminar producto">
                            Eliminar
                        </button>
                    </li>
                ))}
            </ul>

            <div className="cart-footer">
                <p className="cart-total">
                    Total: <strong>{formatARS(cartTotal)}</strong>
                </p>
                {!showCheckout && (
                    <div className="cart-footer__actions">
                        <button className="app-btn cart-btn--clear" onClick={handleClearCart}>
                            Vaciar carrito
                        </button>
                        <button className="app-btn cart-btn--checkout" onClick={handleCheckout}>
                            Finalizar compra
                        </button>
                    </div>
                )}
            </div>

            {showCheckout && (
                <div className="checkout-form">

                    <section className="checkout-section">
                        <h2 className="checkout-section__title">Datos de facturación</h2>
                        <label className="checkout-label">
                            Nombre completo
                            <input
                                type="text"
                                className="checkout-input"
                                value={facturacion.nombreCompleto}
                                onChange={(e) => setFacturacion({ ...facturacion, nombreCompleto: e.target.value })}
                                placeholder="Juan Pérez"
                            />
                        </label>
                        <label className="checkout-label">
                            DNI
                            <input
                                type="text"
                                className="checkout-input"
                                value={facturacion.dni}
                                onChange={(e) => setFacturacion({ ...facturacion, dni: e.target.value })}
                                placeholder="12345678"
                            />
                        </label>
                        <label className="checkout-label">
                            Domicilio
                            <input
                                type="text"
                                className="checkout-input"
                                value={facturacion.domicilio}
                                onChange={(e) => setFacturacion({ ...facturacion, domicilio: e.target.value })}
                                placeholder="Av. Corrientes 1234, CABA"
                            />
                        </label>
                    </section>

                    <section className="checkout-section">
                        <h2 className="checkout-section__title">Medio de pago</h2>
                        <div className="checkout-radio-group">
                            <label className="checkout-radio">
                                <input
                                    type="radio"
                                    name="medioPago"
                                    value="efectivo"
                                    checked={medioPago === 'efectivo'}
                                    onChange={() => setMedioPago('efectivo')}
                                />
                                Efectivo
                            </label>
                            <label className="checkout-radio">
                                <input
                                    type="radio"
                                    name="medioPago"
                                    value="transferencia"
                                    checked={medioPago === 'transferencia'}
                                    onChange={() => setMedioPago('transferencia')}
                                />
                                Transferencia bancaria
                            </label>
                        </div>
                    </section>

                    <section className="checkout-section">
                        <h2 className="checkout-section__title">Entrega</h2>
                        <div className="checkout-radio-group">
                            <label className="checkout-radio">
                                <input
                                    type="radio"
                                    name="metodoEntrega"
                                    value="retiro"
                                    checked={metodoEntrega === 'retiro'}
                                    onChange={() => setMetodoEntrega('retiro')}
                                />
                                Retirar en local
                            </label>
                            <label className="checkout-radio">
                                <input
                                    type="radio"
                                    name="metodoEntrega"
                                    value="envio"
                                    checked={metodoEntrega === 'envio'}
                                    onChange={() => setMetodoEntrega('envio')}
                                />
                                Envío a domicilio
                            </label>
                        </div>

                        {metodoEntrega === 'envio' && (
                            <div className="checkout-envio">
                                <label className="checkout-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={usarDomicilioFacturacion}
                                        onChange={(e) => setUsarDomicilioFacturacion(e.target.checked)}
                                    />
                                    Usar domicilio de facturación para el envío
                                </label>

                                {!usarDomicilioFacturacion && (
                                    <div className="checkout-envio__fields">
                                        <label className="checkout-label">
                                            Calle
                                            <input type="text" className="checkout-input" value={direccionEnvio.calle}
                                                onChange={(e) => setDireccionEnvio({ ...direccionEnvio, calle: e.target.value })}
                                                placeholder="Av. Rivadavia" />
                                        </label>
                                        <label className="checkout-label">
                                            Número
                                            <input type="text" className="checkout-input" value={direccionEnvio.numero}
                                                onChange={(e) => setDireccionEnvio({ ...direccionEnvio, numero: e.target.value })}
                                                placeholder="1234" />
                                        </label>
                                        <label className="checkout-label">
                                            Ciudad
                                            <input type="text" className="checkout-input" value={direccionEnvio.ciudad}
                                                onChange={(e) => setDireccionEnvio({ ...direccionEnvio, ciudad: e.target.value })}
                                                placeholder="Buenos Aires" />
                                        </label>
                                        <label className="checkout-label">
                                            Provincia
                                            <input type="text" className="checkout-input" value={direccionEnvio.provincia}
                                                onChange={(e) => setDireccionEnvio({ ...direccionEnvio, provincia: e.target.value })}
                                                placeholder="Buenos Aires" />
                                        </label>
                                        <label className="checkout-label">
                                            Código postal
                                            <input type="text" className="checkout-input" value={direccionEnvio.codigoPostal}
                                                onChange={(e) => setDireccionEnvio({ ...direccionEnvio, codigoPostal: e.target.value })}
                                                placeholder="1406" />
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    <div className="checkout-actions">
                        <button type="button" className="app-btn checkout-btn--back" onClick={() => setShowCheckout(false)}
                            disabled={enviandoPedido}>
                            Volver
                        </button>
                        <button type="button" className="app-btn checkout-btn--submit" onClick={handleRealizarPedido}
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
