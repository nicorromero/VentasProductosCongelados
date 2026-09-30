import { Link } from 'react-router-dom';

export default function EmptyCart() {
    return (
        <div className="container py-5 mx-auto d-flex flex-column align-items-center justify-content-center gap-3" style={{ maxWidth: '860px', minHeight: '40vh' }}>
            <p className="fs-5 text-muted mb-0">Tu carrito está vacío</p>
            <Link to="/productos" className="btn btn-danger px-4 py-2 rounded-3">
                Ver productos
            </Link>
        </div>
    );
}
