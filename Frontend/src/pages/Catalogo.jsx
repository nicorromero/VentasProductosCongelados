import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { FaPizzaSlice, FaHamburger, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { GiPieSlice, GiDumpling, GiFrenchFries } from 'react-icons/gi';
import { MdOutlineRestaurantMenu } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Catalogo() {
    const { categoria } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    axios.get(`${API_URL}/products`),
                    axios.get(`${API_URL}/categories`).catch(() => ({ data: [] }))
                ]);
                setProducts(productsRes.data);
                setCategories(categoriesRes.data);
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

    const categoriaFiltro = categoria ? categoria.toLowerCase() : null;

    const productosFiltrados = !categoriaFiltro
        ? products
        : products.filter((p) => p.category && p.category.toLowerCase() === categoriaFiltro);

    const isAdmin = (() => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;
            return JSON.parse(atob(token.split('.')[1])).role === 'admin';
        } catch { return false; }
    })();

    const scrollRef = useRef(null);

    const scroll = (scrollOffset) => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const maxScrollLeft = container.scrollWidth - container.clientWidth;
            let newScrollLeft = container.scrollLeft + scrollOffset;
            
            if (newScrollLeft > maxScrollLeft) newScrollLeft = maxScrollLeft;
            if (newScrollLeft < 0) newScrollLeft = 0;
            
            container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
        }
    };

    const getCategoryIcon = (catName) => {
        if (!catName) return <MdOutlineRestaurantMenu className="me-2 fs-5" />;
        const name = catName.toLowerCase();
        if (name.includes('pizza')) return <FaPizzaSlice className="me-2 fs-5" />;
        if (name.includes('tarta')) return <GiPieSlice className="me-2 fs-5" />;
        if (name.includes('empanada')) return <GiDumpling className="me-2 fs-5" />;
        if (name.includes('hamburguesa') || name.includes('burger')) return <FaHamburger className="me-2 fs-5" />;
        if (name.includes('papa') || name.includes('frita')) return <GiFrenchFries className="me-2 fs-5" />;
        return <MdOutlineRestaurantMenu className="me-2 fs-5" />;
    };

    if (loading) return <div className="text-center py-5" style={{ paddingTop: '80px' }}>Cargando productos...</div>;
    if (error) return <div className="text-center py-5 text-danger" style={{ paddingTop: '80px' }}>{error}</div>;

    return (
        <section className="container-fluid px-3 px-md-4 pb-4" style={{ paddingTop: '80px' }}>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            <div className="d-flex align-items-center mb-4 position-relative w-100">
                <button 
                    className="btn btn-dark rounded-circle shadow-sm position-absolute start-0 z-3 d-flex align-items-center justify-content-center" 
                    onClick={() => scroll(-200)}
                    style={{ width: '36px', height: '36px' }}
                    aria-label="Desplazar izquierda"
                >
                    <FaChevronLeft />
                </button>
                
                <div 
                    ref={scrollRef}
                    className="d-flex gap-3 overflow-auto px-5 py-2 w-100 hide-scrollbar"
                    style={{ whiteSpace: 'nowrap' }}
                >
                    <button 
                        className={`btn d-flex align-items-center justify-content-center flex-shrink-0 rounded-pill px-4 py-2 fw-medium ${!categoria ? 'btn-dark shadow-sm' : 'btn-outline-dark border-2'}`}
                        onClick={() => navigate('/productos')}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        <MdOutlineRestaurantMenu className="me-2 fs-5" /> Todos
                    </button>
                    {Array.isArray(categories) && categories.map((cat, idx) => (
                        <button 
                            key={cat._id || cat.name || idx}
                            className={`btn d-flex align-items-center justify-content-center flex-shrink-0 rounded-pill px-4 py-2 fw-medium ${categoriaFiltro === (cat.name || '').toLowerCase() ? 'btn-dark shadow-sm' : 'btn-outline-dark border-2'}`}
                            onClick={() => navigate(`/catalogo/${cat.name}`)}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {getCategoryIcon(cat.name)} {cat.name || 'Sin nombre'}
                        </button>
                    ))}
                </div>

                <button 
                    className="btn btn-dark rounded-circle shadow-sm position-absolute end-0 z-3 d-flex align-items-center justify-content-center" 
                    onClick={() => scroll(200)}
                    style={{ width: '36px', height: '36px' }}
                    aria-label="Desplazar derecha"
                >
                    <FaChevronRight />
                </button>
            </div>
            <div className="row g-3">
                {Array.isArray(productosFiltrados) && productosFiltrados.map((product) => (
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
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Catalogo;
