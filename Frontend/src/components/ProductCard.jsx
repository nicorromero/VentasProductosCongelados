import '../assets/css/ProductCard.css';
import { useNavigate } from 'react-router-dom';

function getRole() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1])).role;
    } catch { return null; }
}

function ProductCard({id, name, details, price, image, stock, category, active, badge}) {
    const navigate = useNavigate();
    const isAdmin = getRole() === 'admin';

    return (
        <article className="card" onClick={() => navigate(`/producto/${id}`)} style={{cursor: 'pointer'}}>
            <div className="imageContainer">
                {badge && <span className="badge">{badge}</span>}
                <img
                    src={image || `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(name || 'Producto')}`}
                    alt={name}
                    className="image"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(name || 'Producto')}`;
                    }}
                />
            </div>
            <div className = "info">
                <p className= "category" >{category}</p>
                <h3 className="name">{name}</h3>
                <div className="priceRow">
                    <span className="price">${price}</span>
                </div>
                <button
                    className="app-btn app-btn--small app-btn--cart"
                    onClick={(e) => { e.stopPropagation(); navigate(`/producto/${id}`); }}
                >
                    Ver producto
                </button>
                {isAdmin && (
                    <button
                        className="app-btn app-btn--small"
                        onClick={(e) => { e.stopPropagation(); navigate(`/productos/editar/${id}`); }}
                    >
                        Editar
                    </button>
                )}
            </div>
        </article>
    );
}

export default ProductCard;

