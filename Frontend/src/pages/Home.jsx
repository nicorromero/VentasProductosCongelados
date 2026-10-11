import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiArrowRight, 
  FiClock, 
  FiHeart, 
  FiShoppingBag, 
  FiCheckCircle
} from 'react-icons/fi';
import { FaFire, FaPizzaSlice } from 'react-icons/fa';
import { GiPieSlice, GiMeat } from 'react-icons/gi';
import { MdOutlineKitchen } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Home() {
  const navigate = useNavigate();
  const [catalogProducts, setCatalogProducts] = useState([]);

  // Consultamos los productos reales del catálogo para utilizar sus fotos auténticas si existen
  useEffect(() => {
    let isMounted = true;
    if (API_URL) {
      axios.get(`${API_URL}/products`)
        .then((res) => {
          if (isMounted && Array.isArray(res.data)) {
            setCatalogProducts(res.data);
          }
        })
        .catch(() => {
          // Si el servidor no responde o está offline, usa fotos locales auténticas de fallback
        });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  // Función auxiliar para obtener la imagen real del catálogo según categoría o fallback a foto real local
  const getCategoryPhoto = (categoryKeyword, fallbackPhoto) => {
    const found = catalogProducts.find((p) => {
      const matchCat = p.category && p.category.toLowerCase().includes(categoryKeyword.toLowerCase());
      const hasImg = p.image || (Array.isArray(p.images) && p.images[0]);
      return matchCat && hasImg;
    });
    return found ? (found.image || found.images[0]) : fallbackPhoto;
  };

  return (
    <div className="home-landing-page" style={{ backgroundColor: '#FAF7F2', color: '#232427' }}>
      {/* Estilos específicos para la landing: paleta de marca, tipografías y sombras */}
      <style>{`
        .font-bebas {
          font-family: 'Bebas Neue', cursive, sans-serif;
          letter-spacing: 0.5px;
        }
        .hero-badge {
          background-color: rgba(182, 137, 73, 0.15);
          color: #8C5D24;
          border: 1px solid rgba(182, 137, 73, 0.35);
        }
        .btn-brand-primary {
          background-color: #dc3545;
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 14px rgba(220, 53, 69, 0.35);
          transition: all 0.25s ease;
        }
        .btn-brand-primary:hover {
          background-color: #bb2d3b;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(220, 53, 69, 0.45);
        }
        .btn-brand-secondary {
          background-color: transparent;
          color: #232427;
          border: 2px solid #B68949;
          transition: all 0.25s ease;
        }
        .btn-brand-secondary:hover {
          background-color: #B68949;
          color: #ffffff;
          transform: translateY(-2px);
        }
        .category-pill {
          background-color: #ffffff;
          color: #232427;
          border: 1px solid rgba(182, 137, 73, 0.3);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .category-pill:hover {
          background-color: #232427;
          color: #ffffff;
          border-color: #232427;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .feature-card {
          background: #ffffff;
          border-radius: 1.25rem;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          border: 1px solid rgba(182, 137, 73, 0.15);
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(35, 36, 39, 0.08) !important;
        }
        .menu-card {
          background: #ffffff;
          border-radius: 1.25rem;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .menu-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.1) !important;
        }
        .menu-card img {
          transition: transform 0.4s ease;
        }
        .menu-card:hover img {
          transform: scale(1.05);
        }
        .quote-bubble {
          background-color: #ffffff;
          border-left: 4px solid #B68949;
        }
      `}</style>

      {/* =========================================================================
          1. HERO SECTION (Propuesta de valor completa: Pernil + Congelados)
          ========================================================================= */}
      <section className="position-relative overflow-hidden py-4 py-lg-5" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF7F2 100%)' }}>
        <div className="container py-3 py-lg-4">
          <div className="row align-items-center g-4 g-lg-5">
            
            {/* Columna Izquierda: Copywriting persuasivo sin emojis, con iconos vectoriales */}
            <div className="col-12 col-lg-6 text-center text-lg-start">
              
              {/* Badge de confianza */}
              <div className="d-inline-flex align-items-center gap-2 hero-badge px-3 py-1 rounded-pill mb-3 fw-medium small">
                <FiHeart className="text-danger" />
                <span>Cocinado en familia • Hecho con dedicación</span>
              </div>

              {/* Título Principal (H1) */}
              <h1 className="display-4 fw-bold font-bebas mb-3" style={{ color: '#232427', lineHeight: 1.08 }}>
                COMIDA CASERA, RICA Y LISTA PARA TU DÍA A DÍA
              </h1>

              {/* Subtítulo enfocado en la variedad del catálogo */}
              <p className="lead fs-5 text-secondary mb-4" style={{ maxWidth: '540px' }}>
                ¿Ganas de comer rico y casero sin pasar horas en la cocina? 
                En <strong>Kepernil</strong> cocinamos para vos: desde nuestros clásicos <strong>perniles a fuego lento</strong> hasta <strong>milanesas tiernas, pizzas caseras y tarteletas frescas</strong>. Listas para calentar y disfrutar en minutos.
              </p>

              {/* Acciones principales (CTAs) */}
              <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center justify-content-lg-start gap-3 mb-4">
                <button 
                  onClick={() => navigate('/productos')}
                  className="btn btn-brand-primary btn-lg rounded-pill px-4 py-3 fw-bold d-flex align-items-center gap-2 w-100 w-sm-auto justify-content-center"
                  type="button"
                >
                  <FiShoppingBag size={20} />
                  <span>Explorar Todo el Catálogo</span>
                  <FiArrowRight size={20} />
                </button>
                <a 
                  href="#menu-completo"
                  className="btn btn-brand-secondary btn-lg rounded-pill px-4 py-3 fw-semibold w-100 w-sm-auto text-center text-decoration-none"
                >
                  Ver Opciones del Menú
                </a>
              </div>

              {/* Accesos rápidos a categorías clave con iconos vectoriales limpios */}
              <div className="pt-2">
                <span className="text-muted small fw-medium d-block mb-2">Explorá directo por categoría:</span>
                <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-2">
                  <button 
                    onClick={() => navigate('/productos')} 
                    className="btn btn-sm category-pill rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-1"
                    type="button"
                  >
                    <FaFire className="text-danger" size={13} />
                    <span>Pernil & Combos</span>
                  </button>
                  <button 
                    onClick={() => navigate('/catalogo/Milanesas')} 
                    className="btn btn-sm category-pill rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-1"
                    type="button"
                  >
                    <GiMeat style={{ color: '#C0392B' }} size={14} />
                    <span>Milanesas</span>
                  </button>
                  <button 
                    onClick={() => navigate('/catalogo/Pizzas')} 
                    className="btn btn-sm category-pill rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-1"
                    type="button"
                  >
                    <FaPizzaSlice style={{ color: '#E67E22' }} size={13} />
                    <span>Pizzas</span>
                  </button>
                  <button 
                    onClick={() => navigate('/catalogo/Tarteletas')} 
                    className="btn btn-sm category-pill rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-1"
                    type="button"
                  >
                    <GiPieSlice className="text-success" size={14} />
                    <span>Tarteletas</span>
                  </button>
                </div>
              </div>

              {/* Micro-copys de seguridad y practicidad */}
              <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3 text-muted small pt-4">
                <div className="d-flex align-items-center gap-1">
                  <FiCheckCircle className="text-success" />
                  <span>Sin registros obligatorios</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <FiCheckCircle className="text-success" />
                  <span>Directo a tu freezer o mesa</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <FiCheckCircle className="text-success" />
                  <span>Listo en 5 a 10 minutos</span>
                </div>
              </div>

            </div>

            {/* Columna Derecha: Fotos 100% auténticas y reales del negocio */}
            <div className="col-12 col-lg-6">
              <div className="position-relative mx-auto" style={{ maxWidth: '520px' }}>
                
                {/* Imagen principal: Mesa servida con pernil, figacitas y salsas (foto1.png) */}
                <div className="shadow-lg rounded-4 overflow-hidden border border-2 border-white" style={{ maxHeight: '420px' }}>
                  <img 
                    src="/foto1.png" 
                    alt="Pernil casero con panes esponjosos y salsas artesanales de Kepernil" 
                    className="w-100 h-100 object-fit-cover"
                    style={{ minHeight: '340px' }}
                  />
                </div>

                {/* Tarjeta flotante 1: Horno a leña y cocción lenta real (foto3.png) */}
                <div 
                  className="position-absolute bg-white rounded-3 shadow p-2 d-none d-sm-flex align-items-center gap-2 border border-light"
                  style={{ top: '-15px', right: '-15px', zIndex: 2, maxWidth: '220px' }}
                >
                  <img 
                    src="/foto3.png" 
                    alt="Cocción lenta en horno" 
                    className="rounded-2 object-fit-cover"
                    style={{ width: '54px', height: '54px' }}
                  />
                  <div>
                    <div className="fw-bold small" style={{ color: '#232427' }}>Cocción Lenta</div>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>Dorado y jugoso</small>
                  </div>
                </div>

                {/* Tarjeta flotante 2: Bandeja lista de pernil desmechado (foto4.png) */}
                <div 
                  className="position-absolute bg-white rounded-4 shadow-lg p-3 d-flex align-items-center gap-3 border border-light"
                  style={{ bottom: '-20px', left: '-15px', zIndex: 2, maxWidth: '260px' }}
                >
                  <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#FAF2E6', color: '#B68949' }}>
                    <FiClock size={24} />
                  </div>
                  <div>
                    <div className="fw-bold text-dark small">¡Listo en 5 Minutos!</div>
                    <small className="text-secondary" style={{ fontSize: '0.78rem' }}>Calentás, servís y a disfrutar</small>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          2. TRUST BAR: BENEFICIOS CLAVE (Los 4 pilares de valor)
          ========================================================================= */}
      <section className="py-5 bg-white border-top border-bottom border-light">
        <div className="container">
          <div className="row g-4 justify-content-center">
            
            {/* Pilar 1: Cocción lenta y pernil */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="feature-card p-4 h-100 shadow-sm text-center text-sm-start d-flex flex-column align-items-center align-items-sm-start">
                <div className="rounded-3 p-3 mb-3 d-inline-flex" style={{ backgroundColor: '#FAF2E6', color: '#B68949' }}>
                  <FaFire size={24} />
                </div>
                <h3 className="fs-5 fw-bold mb-2">Pernil a Fuego Lento</h3>
                <p className="text-secondary small mb-0">
                  Horas de cocción paciente para una carne tierna y jugosa con panes esponjosos y salsas artesanales.
                </p>
              </div>
            </div>

            {/* Pilar 2: Milanesas y carnes caseras */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="feature-card p-4 h-100 shadow-sm text-center text-sm-start d-flex flex-column align-items-center align-items-sm-start">
                <div className="rounded-3 p-3 mb-3 d-inline-flex" style={{ backgroundColor: '#FDEDEC', color: '#C0392B' }}>
                  <GiMeat size={24} />
                </div>
                <h3 className="fs-5 fw-bold mb-2">Milanesas de Primera</h3>
                <p className="text-secondary small mb-0">
                  De carne seleccionada y pollo tierno, rebozadas a mano para resolver tus almuerzos y cenas al toque.
                </p>
              </div>
            </div>

            {/* Pilar 3: Pizzas y Tarteletas caseras */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="feature-card p-4 h-100 shadow-sm text-center text-sm-start d-flex flex-column align-items-center align-items-sm-start">
                <div className="rounded-3 p-3 mb-3 d-inline-flex" style={{ backgroundColor: '#EBF5FB', color: '#2980B9' }}>
                  <FaPizzaSlice size={24} />
                </div>
                <h3 className="fs-5 fw-bold mb-2">Pizzas & Tarteletas</h3>
                <p className="text-secondary small mb-0">
                  Masas caseras y vegetales frescos picados a mano. Comidas completas, ricas y listas para el horno.
                </p>
              </div>
            </div>

            {/* Pilar 4: Freezer lleno y practicidad */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="feature-card p-4 h-100 shadow-sm text-center text-sm-start d-flex flex-column align-items-center align-items-sm-start">
                <div className="rounded-3 p-3 mb-3 d-inline-flex" style={{ backgroundColor: '#EAFAF1', color: '#27AE60' }}>
                  <MdOutlineKitchen size={24} />
                </div>
                <h3 className="fs-5 fw-bold mb-2">Práctico para el Freezer</h3>
                <p className="text-secondary small mb-0">
                  Stockeá tu cocina con comida casera real. Cero conservantes artificiales y máxima practicidad.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          3. SECCIÓN DEL MENÚ COMPLETO: PERNIL, MILANESAS, PIZZAS Y TARTELETAS
          (Utiliza fotos 100% reales del negocio y fotos reales del catálogo)
          ========================================================================= */}
      <section id="menu-completo" className="py-5" style={{ backgroundColor: '#FAF7F2' }}>
        <div className="container py-3">
          
          <div className="text-center mb-5">
            <span className="text-uppercase fw-bold small" style={{ color: '#B68949', letterSpacing: '2px' }}>
              Todo lo que Preparamos
            </span>
            <h2 className="display-5 fw-bold font-bebas mt-1 mb-2">
              NUESTRAS ESPECIALIDADES CASERAS
            </h2>
            <p className="text-secondary mx-auto" style={{ maxWidth: '620px' }}>
              Desde el clásico pernil para compartir hasta milanesas, pizzas y tarteletas para tener siempre una opción rica en casa.
            </p>
          </div>

          <div className="row g-4">
            
            {/* Opción 1: Pernil Desmechado & Combos (Foto real /foto4.png) */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="menu-card h-100 d-flex flex-column shadow-sm">
                <div className="overflow-hidden position-relative" style={{ height: '200px' }}>
                  <img 
                    src={getCategoryPhoto('Pernil', '/foto4.png')} 
                    alt="Pernil desmechado listo con pimientos y verdeo" 
                    className="w-100 h-100 object-fit-cover"
                  />
                  <span className="position-absolute top-0 end-0 m-3 badge rounded-pill bg-danger px-3 py-1 fw-medium shadow-sm small">
                    La Especialidad
                  </span>
                </div>
                <div className="p-3 p-xl-4 d-flex flex-column flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaFire className="text-danger" />
                    <h4 className="fs-5 fw-bold mb-0">Pernil & Sándwiches</h4>
                  </div>
                  <p className="text-secondary small flex-grow-1">
                    Carne tierna y desmechada con verdeo y morrón. Disponible en bandeja lista o en combo con figacitas caseras y 3 salsas artesanales para armar sándwiches increíbles.
                  </p>
                  <button 
                    onClick={() => navigate('/productos')}
                    className="btn btn-outline-dark rounded-pill w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 mt-3 small"
                    type="button"
                  >
                    <span>Ver Perniles</span>
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            </div>

            {/* Opción 2: Milanesas Caseras (Foto real del catálogo o foto artesanal de mesa) */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="menu-card h-100 d-flex flex-column shadow-sm">
                <div className="overflow-hidden position-relative" style={{ height: '200px', backgroundColor: '#FAF2E6' }}>
                  <img 
                    src={getCategoryPhoto('Milanesas', '/foto1.png')} 
                    alt="Milanesas caseras y preparaciones de Kepernil" 
                    className="w-100 h-100 object-fit-cover"
                  />
                  <span className="position-absolute top-0 end-0 m-3 badge rounded-pill bg-dark text-white px-3 py-1 fw-medium shadow-sm small">
                    Para Todos los Días
                  </span>
                </div>
                <div className="p-3 p-xl-4 d-flex flex-column flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <GiMeat style={{ color: '#C0392B' }} />
                    <h4 className="fs-5 fw-bold mb-0">Milanesas Caseras</h4>
                  </div>
                  <p className="text-secondary small flex-grow-1">
                    Supremas de pollo, milanesas de carne seleccionada, medallones y bocaditos rebozados a mano. Tiernas, crocantes y listas para tu sartén o bandeja de horno.
                  </p>
                  <button 
                    onClick={() => navigate('/catalogo/Milanesas')}
                    className="btn btn-outline-dark rounded-pill w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 mt-3 small"
                    type="button"
                  >
                    <span>Ver Milanesas</span>
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            </div>

            {/* Opción 3: Pizzas & Empanadas (Foto real de horno /foto3.png o foto real del catálogo) */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="menu-card h-100 d-flex flex-column shadow-sm">
                <div className="overflow-hidden position-relative" style={{ height: '200px', backgroundColor: '#FDF2E9' }}>
                  <img 
                    src={getCategoryPhoto('Pizzas', '/foto3.png')} 
                    alt="Cocción al horno y masas caseras" 
                    className="w-100 h-100 object-fit-cover"
                  />
                  <span className="position-absolute top-0 end-0 m-3 badge rounded-pill px-3 py-1 fw-medium shadow-sm small" style={{ backgroundColor: '#B68949', color: '#fff' }}>
                    Masa Artesanal
                  </span>
                </div>
                <div className="p-3 p-xl-4 d-flex flex-column flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaPizzaSlice style={{ color: '#E67E22' }} />
                    <h4 className="fs-5 fw-bold mb-0">Pizzas & Empanadas</h4>
                  </div>
                  <p className="text-secondary small flex-grow-1">
                    Pizzas grandes de muzzarella, napolitana, prepizzas esponjosas y empanadas con rellenos abundantes. El comodín infalible para tus fines de semana.
                  </p>
                  <button 
                    onClick={() => navigate('/catalogo/Pizzas')}
                    className="btn btn-outline-dark rounded-pill w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 mt-3 small"
                    type="button"
                  >
                    <span>Ver Pizzas</span>
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            </div>

            {/* Opción 4: Tarteletas & Vegetales Frescos (Foto real /foto6 (2).png de vegetales frescos picados) */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="menu-card h-100 d-flex flex-column shadow-sm">
                <div className="overflow-hidden position-relative" style={{ height: '200px' }}>
                  <img 
                    src={getCategoryPhoto('Tarteletas', '/foto6 (2).png')} 
                    alt="Vegetales frescos picados para tarteletas y preparaciones" 
                    className="w-100 h-100 object-fit-cover"
                  />
                  <span className="position-absolute top-0 end-0 m-3 badge rounded-pill bg-success text-white px-3 py-1 fw-medium shadow-sm small">
                    100% Fresco
                  </span>
                </div>
                <div className="p-3 p-xl-4 d-flex flex-column flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <GiPieSlice className="text-success" />
                    <h4 className="fs-5 fw-bold mb-0">Tarteletas & Tartas</h4>
                  </div>
                  <p className="text-secondary small flex-grow-1">
                    Rellenos generosos de verduras frescas (choclo cremoso, espinaca salteada, mix de pimientos y cebollita). Masa tierna y crocante, ideales para comer rico y liviano.
                  </p>
                  <button 
                    onClick={() => navigate('/catalogo/Tarteletas')}
                    className="btn btn-outline-dark rounded-pill w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 mt-3 small"
                    type="button"
                  >
                    <span>Ver Tarteletas</span>
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Banner central de llamada al catálogo */}
          <div className="text-center mt-5">
            <button 
              onClick={() => navigate('/productos')}
              className="btn btn-brand-primary btn-lg rounded-pill px-5 py-3 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
              type="button"
            >
              <span>Ver Precios y Armar Mi Pedido</span>
              <FiArrowRight size={20} />
            </button>
          </div>

        </div>
      </section>


      {/* =========================================================================
          4. SECCIÓN HISTORIA FAMILIAR & TRANSPARENCIA (Humanizar la marca)
          ========================================================================= */}
      <section id="historia" className="py-5 bg-white border-top border-light">
        <div className="container py-4">
          <div className="row align-items-center g-4 g-lg-5">
            
            {/* Foto real de la familia cocinando juntos con cofia (foto6.png) */}
            <div className="col-12 col-lg-5 text-center">
              <div className="position-relative d-inline-block">
                <div className="rounded-4 overflow-hidden shadow-lg border border-3 border-white" style={{ maxWidth: '400px' }}>
                  <img 
                    src="/foto6.png" 
                    alt="Familia de Kepernil amasando y cocinando con dedicación" 
                    className="w-100 h-100 object-fit-cover"
                    style={{ minHeight: '380px' }}
                  />
                </div>
                {/* Sello de autenticidad */}
                <div 
                  className="position-absolute bottom-0 start-50 translate-middle-x mb-n3 bg-dark text-white rounded-pill px-4 py-2 shadow d-flex align-items-center gap-2"
                  style={{ whiteSpace: 'nowrap', border: '2px solid #B68949' }}
                >
                  <FiHeart className="text-danger" />
                  <span className="fw-semibold small">De Nuestra Familia a Tu Mesa</span>
                </div>
              </div>
            </div>

            {/* Texto de la historia (Integra perfectamente las frases base del negocio) */}
            <div className="col-12 col-lg-7 pt-4 pt-lg-0">
              <span className="text-uppercase fw-bold small" style={{ color: '#B68949', letterSpacing: '2px' }}>
                Nuestra Historia
              </span>
              <h2 className="display-5 fw-bold font-bebas mt-1 mb-3">
                ¡HOLA! SOMOS KEPERNIL
              </h2>
              
              <div className="quote-bubble p-4 rounded-3 shadow-sm mb-4">
                <p className="fs-5 mb-0 fst-italic" style={{ color: '#232427', lineHeight: '1.6' }}>
                  &ldquo;Somos una familia que disfruta hacer comida casera, rica y hecha con amor. 
                  Trabajamos en familia y ponemos dedicación en cada cosa que preparamos.&rdquo;
                </p>
              </div>

              <p className="text-secondary mb-4" style={{ lineHeight: '1.7' }}>
                Creemos que el momento de comer tiene que ser una pausa linda del día, no un motivo de estrés. Por eso tenemos distintas opciones de comidas caseras, prácticas y listas para disfrutar, y vamos incorporando nuevas propuestas para acompañarte en cada momento: desde un pernil inolvidable para compartir con amigos hasta milanesas, pizzas y tarteletas para tener siempre a mano en tu freezer.
              </p>

              {/* Valores diferenciales */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6">
                  <div className="d-flex align-items-start gap-2">
                    <FiCheckCircle className="text-success mt-1 flex-shrink-0" size={18} />
                    <span className="small text-dark fw-medium">Ingredientes frescos y seleccionados cada mañana</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="d-flex align-items-start gap-2">
                    <FiCheckCircle className="text-success mt-1 flex-shrink-0" size={18} />
                    <span className="small text-dark fw-medium">Higiene, amor y dedicación en cada bandeja</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="d-flex align-items-start gap-2">
                    <FiCheckCircle className="text-success mt-1 flex-shrink-0" size={18} />
                    <span className="small text-dark fw-medium">Recetas caseras probadas que le gustan a grandes y chicos</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="d-flex align-items-start gap-2">
                    <FiCheckCircle className="text-success mt-1 flex-shrink-0" size={18} />
                    <span className="small text-dark fw-medium">La solución perfecta para no cocinar y comer rico</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/productos')}
                className="btn btn-outline-dark rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                type="button"
              >
                <span>Conocé Todo Nuestro Menú</span>
                <FiArrowRight />
              </button>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          5. CÓMO FUNCIONA (Eliminar fricción y objeciones de compra)
          ========================================================================= */}
      <section className="py-5" style={{ backgroundColor: '#FAF7F2' }}>
        <div className="container py-3">
          <div className="text-center mb-5">
            <span className="text-uppercase fw-bold small" style={{ color: '#B68949', letterSpacing: '2px' }}>
              Simple y Rápido
            </span>
            <h2 className="display-5 fw-bold font-bebas mt-1 mb-2">
              ¿CÓMO PEDIR EN KEPERNIL?
            </h2>
            <p className="text-secondary mx-auto" style={{ maxWidth: '540px' }}>
              En tan solo 3 pasos tenés tu comida casera lista en tu mesa sin complicaciones.
            </p>
          </div>

          <div className="row g-4 text-center">
            
            {/* Paso 1 */}
            <div className="col-12 col-md-4">
              <div className="bg-white p-4 rounded-4 shadow-sm h-100 border border-light position-relative">
                <div 
                  className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '48px', height: '48px', backgroundColor: '#232427', fontSize: '1.2rem' }}
                >
                  1
                </div>
                <h4 className="fw-bold mb-2">Elegís en el Catálogo</h4>
                <p className="text-secondary small mb-0">
                  Explorás nuestros perniles, milanesas, pizzas o tarteletas, agregás tus favoritos al carrito sin trámites ni registros.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="col-12 col-md-4">
              <div className="bg-white p-4 rounded-4 shadow-sm h-100 border border-light position-relative">
                <div 
                  className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '48px', height: '48px', backgroundColor: '#B68949', fontSize: '1.2rem' }}
                >
                  2
                </div>
                <h4 className="fw-bold mb-2">Confirmás tu Pedido</h4>
                <p className="text-secondary small mb-0">
                  Completás tus datos de entrega o retiro y coordinamos el horario para que recibas todo fresco y en su punto justo.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="col-12 col-md-4">
              <div className="bg-white p-4 rounded-4 shadow-sm h-100 border border-light position-relative">
                <div 
                  className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '48px', height: '48px', backgroundColor: '#dc3545', fontSize: '1.2rem' }}
                >
                  3
                </div>
                <h4 className="fw-bold mb-2">Calentás y Disfrutás</h4>
                <p className="text-secondary small mb-0">
                  Unos minutitos de horno o microondas, y tenés un banquete casero servido en la mesa con sabor auténtico de hogar.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          6. FINAL CTA BANNER (Conversion Closer)
          ========================================================================= */}
      <section className="py-5" style={{ backgroundColor: '#232427', color: '#ffffff' }}>
        <div className="container py-4 text-center">
          <div className="mx-auto" style={{ maxWidth: '680px' }}>
            <span className="badge rounded-pill px-3 py-2 mb-3 fw-bold" style={{ backgroundColor: '#B68949', color: '#ffffff' }}>
              ¡HOY NO COCINES!
            </span>
            <h2 className="display-4 fw-bold font-bebas mb-3" style={{ color: '#ffffff' }}>
              LLENÁ TU FREEZER Y TU MESA CON VERDADERO SABOR CASERO
            </h2>
            <p className="lead text-light opacity-75 mb-4 fs-5">
              Pernil a fuego lento, milanesas caseras, pizzas y tarteletas. Hacé tu pedido en un par de clics y disfrutá en familia.
            </p>
            <button 
              onClick={() => navigate('/productos')}
              className="btn btn-brand-primary btn-lg rounded-pill px-5 py-3 fw-bold shadow-lg d-inline-flex align-items-center gap-2"
              type="button"
            >
              <FiShoppingBag size={22} />
              <span>Ir al Catálogo de Productos</span>
              <FiArrowRight size={22} />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
