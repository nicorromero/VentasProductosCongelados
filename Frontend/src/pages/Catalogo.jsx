import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import '../assets/css/Catalogo.css';


const API_URL = import.meta.env.VITE_API_BASE_URL;
axios.get(`${API_URL}/products`)
  .then(res => console.log(res.data))
  .catch(err => console.error("Error en la petición:", err));
  
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
        hombres: 'hombre',
        mujer: 'mujer',
        ninos: 'niños',
    };

    const categoriaFiltro = slugToCategory[categoria?.toLowerCase()];

    const productosFiltrados = !categoriaFiltro
        ? products
        : products.filter((p) => p.category.toLowerCase() === categoriaFiltro);

    const categoriaMap = {
        hombres: 'Hombre',
        mujer: 'Mujer',
        ninos: 'Niños',
    };
    const categoriaLabel = categoriaMap[categoria?.toLowerCase()] || null;

    if (loading) return <div>Cargando productos...</div>;
    if (error) return <div>{error}</div>;
    console.log("Datos listos para renderizar:", products);
    return (
        <div className="catalogo-page">
            <div className="app-title">
                <h1>{categoriaLabel ? `Productos de ${categoriaLabel}` : 'Store Shop'}</h1>
            </div>
            <div className="container-cards">
                {productosFiltrados.map((product) => (
                    <ProductCard
                        key={product._id}
                        id={product._id}
                        name={product.name}
                        price={product.price}
                        image={product.image}
                        details={product.details}
                        category={product.category}
                        stock={product.stock}
                        badge={product.badge}
                    />
                ))}
            </div>
        </div>
    );
}

export default Catalogo;
