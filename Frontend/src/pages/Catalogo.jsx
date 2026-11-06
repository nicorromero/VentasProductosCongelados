import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Catalogo() {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isAdmin = (() => {
        try {
            const token = localStorage.getItem('token');
            return token ? JSON.parse(atob(token.split('.')[1])).role === 'admin' : false;
        } catch { return false; }
    })();
    const visibleProducts = products.filter((product) => isAdmin || product.active !== false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productsRes = await axios.get(`${API_URL}/products`);
                setProducts(productsRes.data);
            } catch (err) {
                setError('Error al cargar los productos');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const handleProductUpdated = (e) => {
            const updated = e.detail;
            if (!updated?._id) return;
            setProducts(prev => prev.map(p => p._id === updated._id ? { ...p, ...updated } : p));
        };
        window.addEventListener('product-updated', handleProductUpdated);
        return () => window.removeEventListener('product-updated', handleProductUpdated);
    }, []);

    if (loading) return <div className="text-center py-5">Cargando productos...</div>;
    if (error) return <div className="text-center py-5 text-danger">{error}</div>;

    return (
        <section className="container-fluid px-3 px-md-4 py-4">
            <div className="catalog-page-heading">
                <span className="catalog-eyebrow">Kepernil · cocina familiar</span>
                <h1>{location.pathname.startsWith('/catalogo/') ? decodeURIComponent(location.pathname.split('/').pop()) : 'Nuestro menú'}</h1>
                <p>Preparaciones caseras en pequeñas cantidades. Consultanos disponibilidad y coordinamos tu pedido.</p>
            </div>
            <div className="row g-3">
                {visibleProducts.map((product) => (
                    <div className="col-12 col-sm-6 col-lg-3" key={product._id}>
                        <ProductCard
                            id={product._id}
                            name={product.name}
                            price={product.price}
                            image={product.image}
                            images={product.images}
                            details={product.details}
                            category={product.category}
                            stock={product.stock}
                            badge={product.badge}
                            active={product.active}
                            suggestedPrice={product.suggestedPrice}
                            suggestedPriceDate={product.suggestedPriceDate}
                        />
                    </div>
                ))}
            </div>
            {!isAdmin && visibleProducts.length === 0 && <p className="text-center text-muted py-5">Estamos actualizando el menú. Consultanos por WhatsApp.</p>}
        </section>
    );
}

export default Catalogo;
