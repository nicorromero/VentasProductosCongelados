import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiHeart, FiMessageCircle } from 'react-icons/fi';

const WHATSAPP_PHONE = '5493442550569';

function Footer() {
  const message = encodeURIComponent('Hola, quería consultar por el menú de esta semana.');
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${message}`;

  return (
    <footer className="kepernil-footer">
      <div className="container py-4 py-md-5">
        <div className="kepernil-footer-main">
          <div className="kepernil-footer-brand">
            <img src="/logoo.svg" alt="Kepernil" />
            <div>
              <h2>Comida casera, hecha en familia</h2>
              <p>Preparaciones en pequeñas cantidades, con dedicación y buenos ingredientes.</p>
            </div>
          </div>
          <div className="kepernil-footer-links">
            <Link to="/productos">Ver el menú <FiArrowUpRight aria-hidden="true" /></Link>
            <Link to="/contacto">Contactanos <FiArrowUpRight aria-hidden="true" /></Link>
            <a href={whatsappUrl} target="_blank" rel="noreferrer"><FiMessageCircle aria-hidden="true" /> WhatsApp</a>
          </div>
        </div>
        <div className="kepernil-footer-bottom">
          <span>© {new Date().getFullYear()} Kepernil. Todos los derechos reservados.</span>
          <span>Hecho en familia <FiHeart aria-hidden="true" /></span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
