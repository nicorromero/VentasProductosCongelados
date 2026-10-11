import { useState } from 'react';
import { toast } from 'react-toastify';
import useCart from '../hooks/useCart';
import axiosClient from '../api/axiosClient';

// UI Submodules
import OrderSuccess from '../components/Cart/OrderSuccess';
import EmptyCart from '../components/Cart/EmptyCart';
import CheckoutForm from '../components/Cart/CheckoutForm';
import CartItem from '../components/Cart/CartItem';

const formatARS = (value) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

function Cart() {
    const { cartItems, increaseQty, decreaseQty, removeFromCart, clearCart, cartTotal } = useCart();

    const [showCheckout, setShowCheckout] = useState(false);
    const [facturacion, setFacturacion] = useState({ nombreCompleto: '', celular: '', domicilio: '' });
    const [medioPago, setMedioPago] = useState('efectivo');
    const [metodoEntrega, setMetodoEntrega] = useState('retiro');
    const [enviandoPedido, setEnviandoPedido] = useState(false);
    const [ordenCreada, setOrdenCreada] = useState(null);
    const [showClearCartModal, setShowClearCartModal] = useState(false);

    if (ordenCreada) {
        return <OrderSuccess ordenCreada={ordenCreada} />;
    }

    if (cartItems.length === 0) {
        return <EmptyCart />;
    }

    async function handleRealizarPedido() {
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
            const itemsResumen = cartItems.map((item) => ({
                _id: item._id,
                nombre: item.nombre || item.name || 'Producto',
                precio: item.precio || item.price || 0,
                quantity: item.quantity,
                subtotal: (item.precio || item.price || 0) * item.quantity
            }));
            const { data } = await axiosClient.post('/api/ordenes', body);
            clearCart();
            setOrdenCreada({
                ...data,
                items: itemsResumen
            });
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
            <h1 className="fs-4 fw-semibold border-bottom pb-3 mb-4">Tu carrito</h1>

            <ul className="list-unstyled d-flex flex-column gap-3 mb-4">
                {cartItems.map((item) => (
                    <CartItem 
                        key={item._id} 
                        item={item} 
                        decreaseQty={decreaseQty} 
                        increaseQty={increaseQty} 
                        removeFromCart={removeFromCart} 
                    />
                ))}
            </ul>

            <div className="border-top pt-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <p className="fs-5 mb-0">
                    Total: <strong>{formatARS(cartTotal)}</strong>
                </p>
                {!showCheckout && (
                    <div className="d-flex gap-2">
                        <button className="btn btn-danger btn-lg px-4 py-2 fw-semibold shadow-sm" onClick={() => setShowCheckout(true)}>
                            Finalizar compra
                        </button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowClearCartModal(true)}>
                            Vaciar carrito
                        </button>
                    </div>
                )}
            </div>

            {showCheckout && (
                <CheckoutForm 
                    facturacion={facturacion}
                    setFacturacion={setFacturacion}
                    medioPago={medioPago}
                    setMedioPago={setMedioPago}
                    metodoEntrega={metodoEntrega}
                    setMetodoEntrega={setMetodoEntrega}
                    enviandoPedido={enviandoPedido}
                    onVolver={() => setShowCheckout(false)}
                    onSubmit={handleRealizarPedido}
                />
            )}

            {showClearCartModal && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }} aria-modal="true" role="dialog">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border border-danger border-opacity-25 shadow-lg rounded-4">
                                <div className="modal-header border-bottom-0 pb-0">
                                    <h5 className="modal-title fw-bold text-dark">Vaciar carrito</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowClearCartModal(false)} aria-label="Cerrar"></button>
                                </div>
                                <div className="modal-body text-dark">
                                    <div className="p-2">
                                        <p className="mb-2 fs-5"><strong>¿Estás seguro de que querés vaciar el carrito?</strong></p>
                                        <p className="mb-0 text-secondary">
                                            Se eliminarán todos los productos y no podrás deshacer esta acción.
                                        </p>
                                    </div>
                                </div>
                                <div className="modal-footer border-top-0 pt-0 pb-3 px-4 d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-light rounded-pill px-4 fw-medium border" onClick={() => setShowClearCartModal(false)}>Cancelar</button>
                                    <button type="button" className="btn btn-danger rounded-pill px-4 fw-medium" onClick={() => {
                                        clearCart();
                                        setShowClearCartModal(false);
                                    }}>Vaciar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;
