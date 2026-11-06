import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FiArrowRight, FiCheck, FiClock, FiHeart, FiMessageCircle, FiShield } from 'react-icons/fi';
import './Home.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const WHATSAPP_PHONE = '5493442550569';

function whatsappHref(message) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

function WeeklyProductCard({ product }) {
  const image = product.image || product.images?.[0];
  const available = Number(product.stock) > 0;

  return (
    <article className="weekly-product-card">
      <div className="weekly-product-image">
        {image ? (
          <img src={image} alt={product.name} loading="lazy" />
        ) : (
          <div className="weekly-product-placeholder" aria-label="Imagen no disponible">Kepernil</div>
        )}
        <span className={`weekly-product-status ${available ? 'is-available' : 'is-unavailable'}`}>
          {available ? 'Consultar disponibilidad' : 'Consultar por encargo'}
        </span>
      </div>
      <div className="weekly-product-body">
        <p className="weekly-product-category">{product.category || 'Cocina casera'}</p>
        <h3>{product.name}</h3>
        {product.details && <p className="weekly-product-details">{product.details}</p>}
        <p className="weekly-product-price">
          {Number.isFinite(Number(product.price))
            ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(product.price)
            : 'Consultar precio'}
        </p>
        <a
          className="kepernil-button kepernil-button-whatsapp w-100"
          href={whatsappHref(`Hola, quería consultar por ${product.name} y coordinar un cadete.`)}
          target="_blank"
          rel="noreferrer"
        >
          <FiMessageCircle aria-hidden="true" /> Consultar por WhatsApp / Coordinar cadete
        </a>
      </div>
    </article>
  );
}

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(Boolean(API_URL));

  useEffect(() => {
    let isMounted = true;
    if (!API_URL) {
      setLoading(false);
      return undefined;
    }

    axios.get(`${API_URL}/products`)
      .then(({ data }) => {
        if (isMounted && Array.isArray(data)) setProducts(data.filter((item) => item.active !== false));
      })
      .catch(() => {
        if (isMounted) setProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const generalWhatsApp = useMemo(
    () => whatsappHref('Hola, quería consultar qué prepararon esta semana y coordinar un cadete.'),
    [],
  );

  return (
    <div className="kepernil-home">
      <section className="kepernil-hero">
        <div className="kepernil-container kepernil-hero-grid">
          <div className="kepernil-hero-copy">
            <span className="kepernil-eyebrow"><FiHeart aria-hidden="true" /> Cocina familiar, hecha con dedicación</span>
            <h1>Comida casera, hecha en familia y en pequeñas cantidades</h1>
            <p>
              Cada semana cocinamos nuevas opciones con los ingredientes que conseguimos frescos y a buen precio.
              El menú y las cantidades pueden cambiar; mirá qué preparamos y escribinos para consultar disponibilidad
              y coordinar tu pedido.
            </p>
            <div className="kepernil-hero-actions">
              <a className="kepernil-button kepernil-button-primary" href="#menu-semanal">
                Ver menú de esta semana <FiArrowRight aria-hidden="true" />
              </a>
              <a className="kepernil-button kepernil-button-outline" href={generalWhatsApp} target="_blank" rel="noreferrer">
                <FiMessageCircle aria-hidden="true" /> Consultar por WhatsApp
              </a>
            </div>
            <div className="kepernil-hero-note"><FiClock aria-hidden="true" /> La disponibilidad se confirma al coordinar el pedido.</div>
          </div>
          <div className="kepernil-hero-photo">
            <img src="/foto.jpeg" alt="Preparación casera de la familia Kepernil" />
            <div className="kepernil-photo-caption"><span>De nuestra cocina</span><strong>a tu mesa</strong></div>
          </div>
        </div>
      </section>

      <section className="kepernil-pernil-story" aria-labelledby="pernil-story-title">
        <div className="kepernil-container">
          <div className="kepernil-section-heading">
            <span className="kepernil-eyebrow">Así se disfruta Kepernil</span>
            <h2 id="pernil-story-title">Del pernil al momento de compartir</h2>
            <p>Un vistazo a algunas de nuestras preparaciones y a cómo llegan a la mesa.</p>
          </div>
          <div className="kepernil-process-grid">
            <article className="kepernil-process-card">
              <img src="/foto3.png" alt="Perniles durante su cocción" loading="lazy" />
              <div><span>01</span><h3>Cocción con dedicación</h3><p>Cuidamos cada preparación para que llegue a tu mesa con todo su sabor.</p></div>
            </article>
            <article className="kepernil-process-card">
              <img src="/foto4.png" alt="Pernil desmechado listo para servir" loading="lazy" />
              <div><span>02</span><h3>Listo para compartir</h3><p>Una opción abundante para disfrutar en familia o con amigos.</p></div>
            </article>
            <article className="kepernil-process-card">
              <img src="/foto1.png" alt="Panes y salsas para acompañar el pernil" loading="lazy" />
              <div><span>03</span><h3>La mesa completa</h3><p>Consultanos qué acompañamientos están disponibles esta semana.</p></div>
            </article>
          </div>
        </div>
      </section>

      <section className="kepernil-menu-section" id="menu-semanal">
        <div className="kepernil-container">
          <div className="kepernil-section-heading">
            <span className="kepernil-eyebrow">Preparaciones en pequeñas cantidades</span>
            <h2>Menú de esta semana</h2>
            <p>La oferta cambia según los ingredientes disponibles. Consultanos antes de pedir y te confirmamos qué queda.</p>
          </div>
          {loading ? (
            <p className="kepernil-empty-state" role="status">Estamos cargando las preparaciones…</p>
          ) : products.length ? (
            <div className="kepernil-product-grid">
              {products.map((product) => <WeeklyProductCard key={product._id || product.id} product={product} />)}
            </div>
          ) : (
            <div className="kepernil-empty-state">
              <p>Estamos actualizando el menú de esta semana.</p>
              <a className="kepernil-button kepernil-button-whatsapp" href={generalWhatsApp} target="_blank" rel="noreferrer">
                <FiMessageCircle aria-hidden="true" /> Consultar por WhatsApp / Coordinar cadete
              </a>
            </div>
          )}
          <p className="kepernil-delivery-note">El envío se coordina con cadete. Confirmamos disponibilidad, costo y horario por WhatsApp.</p>
        </div>
      </section>

      <section className="kepernil-values-section">
        <div className="kepernil-container kepernil-values-grid">
          <div>
            <span className="kepernil-eyebrow">Cocinamos como en casa</span>
            <h2>Lo que nos importa</h2>
            <p className="kepernil-values-intro">
              Somos una familia que disfruta preparar comida rica y casera. Ponemos cuidado en cada preparación
              y elegimos ingredientes naturales para compartir sabores simples y familiares.
            </p>
          </div>
          <div className="kepernil-value-list">
            <div className="kepernil-value-item"><span><FiShield aria-hidden="true" /></span><div><h3>Higiene y cuidado</h3><p>Trabajamos con atención y limpieza en cada etapa de la preparación.</p></div></div>
            <div className="kepernil-value-item"><span><FiCheck aria-hidden="true" /></span><div><h3>Ingredientes naturales</h3><p>Usamos verduras, vegetales, carnes y condimentos deshidratados.</p></div></div>
            <div className="kepernil-value-item"><span><FiHeart aria-hidden="true" /></span><div><h3>Sin agregados industriales</h3><p>No agregamos conservantes ni saborizantes industriales.</p></div></div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
