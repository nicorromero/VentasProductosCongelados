import { useNavigate } from 'react-router-dom';
import { 
  FiArrowRight, 
  FiClock, 
  FiHeart, 
  FiShoppingBag, 
  FiCheckCircle, 
  FiStar 
} from 'react-icons/fi';
import { FaFire, FaBreadSlice } from 'react-icons/fa';
import { MdFamilyRestroom } from 'react-icons/md';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-landing-page" style={{ backgroundColor: '#FAF7F2', color: '#232427' }}>
      {/* Estilos específicos para la landing: paleta, tipografías y efectos sutiles */}
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
        .dish-card {
          background: #ffffff;
          border-radius: 1.25rem;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .dish-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
        }
        .dish-card img {
          transition: transform 0.4s ease;
        }
        .dish-card:hover img {
          transform: scale(1.04);
        }
        .quote-bubble {
          background-color: #ffffff;
          border-left: 4px solid #B68949;
        }
      `}</style>

      {/* =========================================================================
          1. HERO SECTION (Impacto visual, propuesta de valor y CTA primario)
          ========================================================================= */}
      <section className="position-relative overflow-hidden py-4 py-lg-5" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF7F2 100%)' }}>
        <div className="container py-3 py-lg-4">
          <div className="row align-items-center g-4 g-lg-5">
            
            {/* Columna Izquierda: Copywriting persuasivo y llamada a la acción */}
            <div className="col-12 col-lg-6 text-center text-lg-start">
              
              {/* Badge de confianza */}
              <div className="d-inline-flex align-items-center gap-2 hero-badge px-3 py-1 rounded-pill mb-3 fw-medium small">
                <FiHeart className="text-danger" />
                <span>Cocinado en familia • Hecho con amor</span>
              </div>

              {/* Título Principal (H1) con gancho emocional y de practicidad */}
              <h1 className="display-4 fw-bold font-bebas mb-3" style={{ color: '#232427', lineHeight: 1.08 }}>
                COMIDA CASERA, RICA Y LISTA PARA DISFRUTAR EN TU HOGAR
              </h1>

              {/* Subtítulo enfocado en la solución al dolor del cliente */}
              <p className="lead fs-5 text-secondary mb-4" style={{ maxWidth: '540px' }}>
                ¿Ganas de comer rico y casero sin pasar horas en la cocina? 
                En <strong>Kepernil</strong> cocinamos perniles tiernos a fuego lento, panes esponjosos y opciones prácticas listas para calentar en minutos.
              </p>

              {/* Acciones principales (CTAs) */}
              <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center justify-content-lg-start gap-3 mb-4">
                <button 
                  onClick={() => navigate('/productos')}
                  className="btn btn-brand-primary btn-lg rounded-pill px-4 py-3 fw-bold d-flex align-items-center gap-2 w-100 w-sm-auto justify-content-center"
                  type="button"
                >
                  <FiShoppingBag size={20} />
                  <span>Ver Catálogo y Pedir</span>
                  <FiArrowRight size={20} />
                </button>
                <a 
                  href="#historia"
                  className="btn btn-brand-secondary btn-lg rounded-pill px-4 py-3 fw-semibold w-100 w-sm-auto text-center text-decoration-none"
                >
                  Conocé Nuestra Historia
                </a>
              </div>

              {/* Micro-copys de seguridad y confianza rápida */}
              <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3 text-muted small pt-2">
                <div className="d-flex align-items-center gap-1">
                  <FiCheckCircle className="text-success" />
                  <span>Sin registros obligatorios</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <FiCheckCircle className="text-success" />
                  <span>Panes y salsas caseras</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <FiCheckCircle className="text-success" />
                  <span>Listos para calentar</span>
                </div>
              </div>

            </div>

            {/* Columna Derecha: Collage visual apetitoso con imágenes reales */}
            <div className="col-12 col-lg-6">
              <div className="position-relative mx-auto" style={{ maxWidth: '520px' }}>
                
                {/* Imagen principal: La mesa servida (foto1.png) */}
                <div className="shadow-lg rounded-4 overflow-hidden border border-2 border-white" style={{ maxHeight: '420px' }}>
                  <img 
                    src="/foto1.png" 
                    alt="Pernil casero con panes esponjosos y salsas artesanales" 
                    className="w-100 h-100 object-fit-cover"
                    style={{ minHeight: '340px' }}
                  />
                </div>

                {/* Tarjeta flotante 1: Horno a fuego lento (foto3.png) */}
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

                {/* Tarjeta flotante 2: Bandeja lista (foto4.png) */}
                <div 
                  className="position-absolute bg-white rounded-4 shadow-lg p-3 d-flex align-items-center gap-3 border border-light"
                  style={{ bottom: '-20px', left: '-15px', zIndex: 2, maxWidth: '260px' }}
                >
                  <div className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#FAF2E6', color: '#B68949' }}>
                    <FiClock size={24} />
                  </div>
                  <div>
                    <div className="fw-bold text-dark small">¡Listo en 5 Minutos!</div>
                    <small className="text-secondary" style={{ fontSize: '0.78rem' }}>Calentás, armás y a disfrutar</small>
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
            
            {/* Pilar 1 */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="feature-card p-4 h-100 shadow-sm text-center text-sm-start d-flex flex-column align-items-center align-items-sm-start">
                <div className="rounded-3 p-3 mb-3 d-inline-flex" style={{ backgroundColor: '#FAF2E6', color: '#B68949' }}>
                  <FaFire size={24} />
                </div>
                <h3 className="fs-5 fw-bold mb-2">Cocción Tradicional</h3>
                <p className="text-secondary small mb-0">
                  Horas de cocción paciente para lograr carne tierna que se deshace sola y un dorado crocante irresistible.
                </p>
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="feature-card p-4 h-100 shadow-sm text-center text-sm-start d-flex flex-column align-items-center align-items-sm-start">
                <div className="rounded-3 p-3 mb-3 d-inline-flex" style={{ backgroundColor: '#EBF5FB', color: '#2980B9' }}>
                  <FiClock size={24} />
                </div>
                <h3 className="fs-5 fw-bold mb-2">Rápido y Práctico</h3>
                <p className="text-secondary small mb-0">
                  Ideal para cuando volvés cansado o tenés invitados sorpresa. Calentás unos minutos y la comida está lista.
                </p>
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="feature-card p-4 h-100 shadow-sm text-center text-sm-start d-flex flex-column align-items-center align-items-sm-start">
                <div className="rounded-3 p-3 mb-3 d-inline-flex" style={{ backgroundColor: '#FDEDEC', color: '#C0392B' }}>
                  <FaBreadSlice size={24} />
                </div>
                <h3 className="fs-5 fw-bold mb-2">Panes y Salsas Caseras</h3>
                <p className="text-secondary small mb-0">
                  Acompañado por pancitos recién horneados y salsas artesanales de albahaca, morrón o perejil y ajo.
                </p>
              </div>
            </div>

            {/* Pilar 4 */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="feature-card p-4 h-100 shadow-sm text-center text-sm-start d-flex flex-column align-items-center align-items-sm-start">
                <div className="rounded-3 p-3 mb-3 d-inline-flex" style={{ backgroundColor: '#EAFAF1', color: '#27AE60' }}>
                  <MdFamilyRestroom size={24} />
                </div>
                <h3 className="fs-5 fw-bold mb-2">Hecho en Familia</h3>
                <p className="text-secondary small mb-0">
                  Elaborado con dedicación y recetas caseras de verdad, sin aditivos ni conservantes industriales.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          3. SECCIÓN DE ESPECIALIDADES / VISTA PREVIA DEL CATÁLOGO
          ========================================================================= */}
      <section className="py-5" style={{ backgroundColor: '#FAF7F2' }}>
        <div className="container py-3">
          
          <div className="text-center mb-5">
            <span className="text-uppercase fw-bold small" style={{ color: '#B68949', letterSpacing: '2px' }}>
              Nuestras Propuestas
            </span>
            <h2 className="display-5 fw-bold font-bebas mt-1 mb-2">
              LO QUE SALE DEL HORNO DE KEPERNIL
            </h2>
            <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
              Desde nuestro clásico pernil hasta opciones congeladas prácticas para tener en casa. Elegí lo que más te guste y pedilo al instante.
            </p>
          </div>

          <div className="row g-4">
            
            {/* Especialidad 1: Pernil Desmechado Listo */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="dish-card h-100 d-flex flex-column shadow-sm">
                <div className="overflow-hidden position-relative" style={{ height: '220px' }}>
                  <img 
                    src="/foto4.png" 
                    alt="Pernil desmechado listo para servir" 
                    className="w-100 h-100 object-fit-cover"
                  />
                  <span className="position-absolute top-0 end-0 m-3 badge rounded-pill bg-danger px-3 py-2 fw-medium shadow-sm">
                    El Más Pedido
                  </span>
                </div>
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <h4 className="fw-bold mb-2">Pernil Desmechado Listo</h4>
                  <p className="text-secondary small flex-grow-1">
                    Carne tierna y jugosa con pimientos y cebollita de verdeo. Viene en bandeja lista para calentar al horno o microondas y armar tremendos sándwiches.
                  </p>
                  <button 
                    onClick={() => navigate('/productos')}
                    className="btn btn-outline-dark rounded-pill w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 mt-3"
                    type="button"
                  >
                    <span>Ver en el Catálogo</span>
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            </div>

            {/* Especialidad 2: Combo Fiesta con Panes y Salsas */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="dish-card h-100 d-flex flex-column shadow-sm">
                <div className="overflow-hidden position-relative" style={{ height: '220px' }}>
                  <img 
                    src="/foto1.png" 
                    alt="Panes caseros y salsas artesanales" 
                    className="w-100 h-100 object-fit-cover"
                  />
                  <span className="position-absolute top-0 end-0 m-3 badge rounded-pill px-3 py-2 fw-medium shadow-sm" style={{ backgroundColor: '#B68949', color: '#fff' }}>
                    Combo Completo
                  </span>
                </div>
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <h4 className="fw-bold mb-2">Panes Caseros & Salsas</h4>
                  <p className="text-secondary small flex-grow-1">
                    Figacitas esponjosas recién horneadas y 3 salsas artesanales (albahaca fresca, mayonesa al morrón y perejil con ajo). La combinación perfecta.
                  </p>
                  <button 
                    onClick={() => navigate('/productos')}
                    className="btn btn-outline-dark rounded-pill w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 mt-3"
                    type="button"
                  >
                    <span>Ver en el Catálogo</span>
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            </div>

            {/* Especialidad 3: Masas, Pizzas y Congelados Caseros */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="dish-card h-100 d-flex flex-column shadow-sm">
                <div className="overflow-hidden position-relative" style={{ height: '220px' }}>
                  <img 
                    src="/foto6 (2).png" 
                    alt="Ingredientes frescos y preparaciones caseras" 
                    className="w-100 h-100 object-fit-cover"
                  />
                  <span className="position-absolute top-0 end-0 m-3 badge rounded-pill bg-dark text-white px-3 py-2 fw-medium shadow-sm">
                    100% Fresco
                  </span>
                </div>
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <h4 className="fw-bold mb-2">Comidas Caseras & Congelados</h4>
                  <p className="text-secondary small flex-grow-1">
                    Pizzas caseras, tartas, empanadas y milanesas preparadas con vegetales seleccionados a mano. Prácticas para tener en el freezer y salvar tu almuerzo o cena.
                  </p>
                  <button 
                    onClick={() => navigate('/productos')}
                    className="btn btn-outline-dark rounded-pill w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 mt-3"
                    type="button"
                  >
                    <span>Ver en el Catálogo</span>
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
              <span>Explorar Todo el Menú y Precios</span>
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
            
            {/* Foto de la familia cocinando (foto6.png) */}
            <div className="col-12 col-lg-5 text-center">
              <div className="position-relative d-inline-block">
                <div className="rounded-4 overflow-hidden shadow-lg border border-3 border-white" style={{ maxWidth: '400px' }}>
                  <img 
                    src="/foto6.png" 
                    alt="Familia de Kepernil amasando y cocinando con amor" 
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

            {/* Texto de la historia (Integra perfectamente las frases base del usuario) */}
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
                Creemos que el momento de comer tiene que ser una pausa linda del día, no un motivo de estrés. Por eso creamos distintas opciones de comidas caseras, prácticas y listas para disfrutar, y vamos incorporando nuevas propuestas para acompañarte en cada momento.
              </p>

              {/* Valores diferenciales */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6">
                  <div className="d-flex align-items-start gap-2">
                    <FiCheckCircle className="text-success mt-1 flex-shrink-0" size={18} />
                    <span className="small text-dark fw-medium">Ingredientes frescos y seleccionados cada día</span>
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
                    <span className="small text-dark fw-medium">Recetas caseras probadas que le gustan a todos</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="d-flex align-items-start gap-2">
                    <FiCheckCircle className="text-success mt-1 flex-shrink-0" size={18} />
                    <span className="small text-dark fw-medium">Solución real para no cocinar y comer rico</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/productos')}
                className="btn btn-outline-dark rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                type="button"
              >
                <span>Conocé Nuestros Platos</span>
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
              En tan solo 3 pasos tenés la comida casera lista en tu mesa sin complicaciones.
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
                <h4 className="fw-bold mb-2">Elegís en el Menú</h4>
                <p className="text-secondary small mb-0">
                  Entrás a nuestro catálogo, seleccionás tus productos preferidos y armás tu pedido sin necesidad de registrarte.
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
                  Revisás tu carrito, completás tus datos de entrega o retiro y coordinamos el horario para que llegue fresco.
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
                  Solo te queda calentar unos minutos, servir en la mesa y disfrutar el verdadero sabor casero con quienes más querés.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          6. PRUEBA SOCIAL / SATISFACCIÓN (Generar confianza inmediata)
          ========================================================================= */}
      <section className="py-5 bg-white border-top border-light">
        <div className="container py-2">
          <div className="text-center mb-5">
            <div className="d-flex justify-content-center gap-1 text-warning mb-2 fs-5">
              <FiStar fill="#ffc107" />
              <FiStar fill="#ffc107" />
              <FiStar fill="#ffc107" />
              <FiStar fill="#ffc107" />
              <FiStar fill="#ffc107" />
            </div>
            <h2 className="display-6 fw-bold font-bebas mb-2">
              LO QUE DICEN QUIENES YA PROBARON KEPERNIL
            </h2>
            <p className="text-secondary small">Opiniones de clientes y familias que disfrutan de nuestros platos</p>
          </div>

          <div className="row g-4 justify-content-center">
            
            {/* Opinión 1 */}
            <div className="col-12 col-md-4">
              <div className="p-4 rounded-4 bg-light h-100 shadow-sm border border-light d-flex flex-column">
                <div className="d-flex text-warning mb-2 small">
                  {'★★★★★'}
                </div>
                <p className="text-secondary small fst-italic flex-grow-1">
                  &ldquo;El pernil es increíble, súper tierno y jugoso. Los pancitos una delicia total y las salsas le dan el toque exacto. Nos salvó un cumpleaños de 20 personas sin cocinar nada.&rdquo;
                </p>
                <div className="fw-bold small text-dark mt-2">— Martín R.</div>
              </div>
            </div>

            {/* Opinión 2 */}
            <div className="col-12 col-md-4">
              <div className="p-4 rounded-4 bg-light h-100 shadow-sm border border-light d-flex flex-column">
                <div className="d-flex text-warning mb-2 small">
                  {'★★★★★'}
                </div>
                <p className="text-secondary small fst-italic flex-grow-1">
                  &ldquo;Tener las bandejas en el freezer es la salvación de la semana. Llegás tarde del laburo, calentás 5 minutos y comés como en un restaurante casero. 100% recomendado.&rdquo;
                </p>
                <div className="fw-bold small text-dark mt-2">— Florencia G.</div>
              </div>
            </div>

            {/* Opinión 3 */}
            <div className="col-12 col-md-4">
              <div className="p-4 rounded-4 bg-light h-100 shadow-sm border border-light d-flex flex-column">
                <div className="d-flex text-warning mb-2 small">
                  {'★★★★★'}
                </div>
                <p className="text-secondary small fst-italic flex-grow-1">
                  &ldquo;Se nota que está hecho en familia y con amor. Todo fresco, impecable la presentación y la atención es súper cálida. Ya somos clientes fijos.&rdquo;
                </p>
                <div className="fw-bold small text-dark mt-2">— Lucas & Camila</div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          7. FINAL CTA BANNER (Conversion Closer)
          ========================================================================= */}
      <section className="py-5" style={{ backgroundColor: '#232427', color: '#ffffff' }}>
        <div className="container py-4 text-center">
          <div className="mx-auto" style={{ maxWidth: '680px' }}>
            <span className="badge rounded-pill px-3 py-2 mb-3 fw-bold" style={{ backgroundColor: '#B68949', color: '#ffffff' }}>
              ¡HOY NO COCINES!
            </span>
            <h2 className="display-4 fw-bold font-bebas mb-3" style={{ color: '#ffffff' }}>
              LLEVÁ EL VERDADERO SABOR CASERO A TU MESA
            </h2>
            <p className="lead text-light opacity-75 mb-4 fs-5">
              Hacé tu pedido en un par de clics y disfrutá de comida casera, rica y hecha con dedicación.
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
