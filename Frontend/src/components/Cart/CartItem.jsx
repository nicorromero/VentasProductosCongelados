const formatARS = (value) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

export default function CartItem({ item, decreaseQty, increaseQty, removeFromCart }) {
    return (
        <li className="bg-body-secondary rounded-3 p-3 d-flex align-items-center gap-3 flex-wrap border position-relative">
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
                <button className="btn btn-light border btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }} onClick={() => decreaseQty(item._id)} aria-label="Disminuir cantidad">−</button>
                <span className="fw-medium text-center small" style={{ minWidth: '24px' }}>{item.quantity}</span>
                <button className="btn btn-light border btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }} onClick={() => increaseQty(item._id)} aria-label="Aumentar cantidad">+</button>
            </div>
            <p className="fw-semibold text-nowrap mb-0">{formatARS(item.precio * item.quantity)}</p>
            <button className="btn btn-outline-danger btn-sm px-2 py-1 rounded-3 ms-auto" onClick={() => removeFromCart(item._id)} aria-label="Eliminar producto">
                🗑️
            </button>
        </li>
    );
}
