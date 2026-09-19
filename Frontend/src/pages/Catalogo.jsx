import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Catalogo() {
    const { categoria } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${API_URL}/products`);
                console.log("Datos del backend:", response.data);
                setProducts(response.data);
            } catch (err) {
                setError('Error al cargar los productos');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const slugToCategory = {
        Milanesas: 'Milanesas',
        Tarteletas: 'Tarteletas',
        Pizzas: 'Pizzas',
    };

    const categoriaFiltro = slugToCategory[categoria?.toLowerCase()];

    const productosFiltrados = !categoriaFiltro
        ? products
        : products.filter((p) => p.category.toLowerCase() === categoriaFiltro);

    const categoriaMap = {
        Pizzas: 'Pizzas',
        Tarteletas: 'Tarteletas',
        Milanesas: 'Milanesas',
    };
    const categoriaLabel = categoriaMap[categoria?.toLowerCase()] || null;

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
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Catalogo;
