import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CATEGORIES = [
  { label: 'Hombre', ruta: '/catalogo/hombres' },
  { label: 'Mujer',  ruta: '/catalogo/mujer'   },
  { label: 'Niños',  ruta: '/catalogo/ninos'   },
];

const VISIBLE = 4;

function FeaturedCarousel({ products }) {
  const chunkedProducts = [];
  for (let i = 0; i < products.length; i += VISIBLE) {
    chunkedProducts.push(products.slice(i, i + VISIBLE));
  }

  return (
    <div id="featuredCarousel" className="carousel slide" data-bs-ride="carousel">
      {/* Indicators */}
      {chunkedProducts.length > 1 && (
        <div className="carousel-indicators mb-0" style={{ bottom: '-2.5rem' }}>
          {chunkedProducts.map((_, index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#featuredCarousel"
              data-bs-slide-to={index}
              className={index === 0 ? 'active bg-dark' : 'bg-dark'}
              aria-current={index === 0 ? 'true' : undefined}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>
      )}

      {/* Slides */}
      <div className="carousel-inner">
        {chunkedProducts.map((group, index) => (
          <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
            <div className="row g-3 px-2 px-md-4 pb-3">
              {group.map(p => (
                <div key={p._id} className="col-6 col-md-3">
                  <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
                    <div className="position-relative bg-body-secondary" style={{ height: '180px' }}>
                      {p.badge && (
                        <span className="badge bg-dark position-absolute top-0 start-0 m-2 z-1 small text-uppercase">
                          {p.badge}
                        </span>
                      )}
                      <img
                        src={p.image || `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(p.name || 'Producto')}`}
                        alt={p.name}
                        className="w-100 h-100 object-fit-cover"
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(p.name || 'Producto')}`;
                        }}
                      />
                    </div>
                    <div className="card-body p-2 text-center">
                      <p className="text-muted mb-0" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>{p.category}</p>
                      <h6 className="card-title text-truncate mb-1 small fw-semibold">{p.name}</h6>
                      <span className="fw-bold small">${p.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      {chunkedProducts.length > 1 && (
        <>
          <button className="carousel-control-prev" type="button" data-bs-target="#featuredCarousel" data-bs-slide="prev" style={{ width: '2.5rem' }}>
            <span className="carousel-control-prev-icon bg-dark rounded-circle p-3" aria-hidden="true"></span>
            <span className="visually-hidden">Anterior</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#featuredCarousel" data-bs-slide="next" style={{ width: '2.5rem' }}>
            <span className="carousel-control-next-icon bg-dark rounded-circle p-3" aria-hidden="true"></span>
            <span className="visually-hidden">Siguiente</span>
          </button>
        </>
      )}
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
      <section
        className="position-relative text-white text-center d-flex align-items-center justify-content-center"
        style={{ minHeight: '55vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
      >
        <div className="container position-relative z-1 py-5">
          <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: '2px' }}>KE · PERNIL</h1>
          <p className="lead mb-4 opacity-75">Los mejores productos congelados, al mejor precio.</p>
          <button
            className="btn btn-light rounded-pill px-4 py-2 fw-semibold"
            onClick={() => navigate('/productos')}
          >
            Ver productos
          </button>
        </div>
      </section>

      {/* Productos destacados */}
      <section className="container py-5">
        <h2 className="text-center fw-bold mb-4">Productos destacados</h2>
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        )}
        {!loading && products.length > 0 && (
          <FeaturedCarousel products={products} />
        )}
        {!loading && products.length === 0 && (
          <p className="text-center text-muted">No hay productos destacados aún.</p>
        )}
      </section>

      {/* Categorías */}
      <section className="container py-5">
        <h2 className="text-center fw-bold mb-4">Explorar por categoría</h2>
        <div className="row g-3">
          {CATEGORIES.map(({ label, ruta }) => (
            <div key={ruta} className="col-12 col-md-4">
              <div
                className="rounded-3 d-flex align-items-end p-3 text-white shadow-sm"
                onClick={() => navigate(ruta)}
                role="button"
                style={{
                  height: '180px',
                  cursor: 'pointer',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3)), #343a40',
                }}
              >
                <span className="fs-5 fw-semibold">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
