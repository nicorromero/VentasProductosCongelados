import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

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

    const categoriaFiltro = categoria ? categoria.toLowerCase() : null;

    const productosFiltrados = !categoriaFiltro
        ? products
        : products.filter((p) => p.category.toLowerCase() === categoriaFiltro);

    const isAdmin = (() => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;
            return JSON.parse(atob(token.split('.')[1])).role === 'admin';
        } catch { return false; }
    })();

    if (loading) return <div className="text-center py-5">Cargando productos...</div>;
    if (error) return <div className="text-center py-5 text-danger">{error}</div>;

    return (
        <section className="container-fluid px-3 px-md-4 py-4">
            <div className="d-flex align-items-center mb-4">
                <span className="me-2 fw-medium fs-5">Mostrar:</span>
                <div className="dropdown">
                    <button className="btn btn-outline-secondary dropdown-toggle rounded-pill px-3 fw-medium" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        {categoria ? categoria.charAt(0).toUpperCase() + categoria.slice(1) : 'Todos los productos'}
                    </button>
                    <ul className="dropdown-menu shadow-sm border-0">
                        <li><button className="dropdown-item" onClick={() => navigate('/productos')}>Todos los productos</button></li>
                        {categories.map((cat) => (
                            <li key={cat.name}>
                                <button className="dropdown-item" onClick={() => navigate(`/catalogo/${cat.name}`)}>
                                    {cat.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="row g-3">
                {isAdmin && !categoriaFiltro && (
                    <div className="col-12 col-sm-6 col-lg-3">
                        <ProductCard
                            isCreate={true}
                            id="new"
                            name=""
                            details=""
                            price=""
                            image=""
                            stock=""
                            category=""
                            active={true}
                            badge=""
                            onCreateSuccess={(newProduct) => {
                                setProducts([...products, newProduct]);
                            }}
                        />
                    </div>
                )}
                {productosFiltrados.map((product) => (
                    <div className="col-12 col-sm-6 col-lg-3" key={product._id}>
                        <ProductCard
                            id={product._id}
                            name={product.name}
                            price={product.price}
                            image={product.image}
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
