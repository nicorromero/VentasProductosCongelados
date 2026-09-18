import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/css/Home.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CATEGORIES = [
  { label: 'Hombre', ruta: '/catalogo/hombres' },
  { label: 'Mujer',  ruta: '/catalogo/mujer'   },
  { label: 'Niños',  ruta: '/catalogo/ninos'   },
];

const VISIBLE = 4; // tarjetas visibles a la vez

function FeaturedCarousel({ products }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const total = products.length;
  const maxIndex = Math.max(0, total - VISIBLE);

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(maxIndex, i + 1));

  const offset = -(index * (100 / VISIBLE));

  return (
    <div className="carousel-wrapper">
      <button
        className="carousel-arrow carousel-arrow--left"
        onClick={prev}
        disabled={index === 0}
        aria-label="Anterior"
      >
        &#8249;
      </button>

      <div className="carousel-viewport">
        <div
          className="carousel-track"
          style={{ transform: `translateX(${offset}%)` }}
        >
          {products.map(p => (
            <div
              key={p._id}
              className="carousel-slide"
              style={{ flex: `0 0 ${100 / VISIBLE}%` }}
              onClick={() => navigate(`/producto/${p._id}`)}
            >
              <div className="carousel-img-wrap">
                {p.badge && <span className="carousel-badge">{p.badge}</span>}
                <img
                  src={p.image || `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(p.name || 'Producto')}`}
                  alt={p.name}
                  className="carousel-img"
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(p.name || 'Producto')}`;
                  }}
                />
              </div>
              <div className="carousel-info">
                <p className="carousel-category">{p.category}</p>
                <h3 className="carousel-name">{p.name}</h3>
                <span className="carousel-price">${p.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="carousel-arrow carousel-arrow--right"
        onClick={next}
        disabled={index >= maxIndex}
        aria-label="Siguiente"
      >
        &#8250;
      </button>

      {/* Dots */}
      <div className="carousel-dots">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            className={`carousel-dot${i === index ? ' carousel-dot--active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Ir a página ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/products`)
      .then(({ data }) => {
        const featured = data
          .filter(p => p.badge && p.badge !== '')
          .slice(0, 8);
        setProducts(featured);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      {/* Hero */}
      <div className="home-hero">
        <div className="home-hero-content">
          <h1>STORE SHOP</h1>
          <p>Las mejores zapatillas, al mejor precio.</p>
          <button
            className="home-hero-btn"
            onClick={() => navigate('/catalogo/hombres')}
          >
            Ver colección
          </button>
        </div>
      </div>

      {/* Productos destacados — carrusel */}
      <div className="home-featured">
        <h2>Productos destacados</h2>
        {loading && <p style={{ textAlign: 'center' }}>Cargando...</p>}
        {!loading && products.length > 0 && (
          <FeaturedCarousel products={products} />
        )}
      </div>

      {/* Categorías */}
      <div className="home-categories">
        <h2>Explorar por categoría</h2>
        <div className="home-categories-grid">
          {CATEGORIES.map(({ label, ruta }) => (
            <div
              key={ruta}
              className="home-cat-banner"
              onClick={() => navigate(ruta)}
            >
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Home;
