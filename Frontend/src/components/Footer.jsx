import { FaWhatsapp, FaRocket, FaLaptopCode, FaCogs, FaArrowRight, FaChevronDown } from 'react-icons/fa';

function Footer() {
    const whatsappNumber = '5493442654872';
    const whatsappMessage = encodeURIComponent(
        '¡Hola! Vi el cartel en tu web y me gustaría consultar sobre una página web, software de gestión o automatizaciones para mi negocio.'
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    return (
        <footer className="bg-dark text-center py-4 mt-auto" style={{ borderTop: '3px solid #dc3545' }}>
            <style>{`
                .footer-promo-card {
                    background: linear-gradient(135deg, rgba(28, 32, 37, 0.95) 0%, rgba(220, 53, 69, 0.08) 100%);
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .btn-promo-whatsapp {
                    background-color: #25D366;
                    border-color: #25D366;
                    color: #ffffff !important;
                    transition: all 0.2s ease-in-out;
                }

                .btn-promo-whatsapp:hover, .btn-promo-whatsapp:focus {
                    background-color: #1ebc57 !important;
                    border-color: #1ebc57 !important;
                    color: #ffffff !important;
                    transform: scale(1.04);
                }

                /* En computadoras (>= 768px): Colapsado por defecto, se despliega suavemente al pasar el mouse */
                @media (min-width: 768px) {
                    .footer-promo-card:hover {
                        background: linear-gradient(135deg, rgba(28, 32, 37, 0.98) 0%, rgba(25, 135, 84, 0.18) 100%) !important;
                        border: 2px solid #25D366 !important;
                        box-shadow: 0 10px 25px -5px rgba(37, 211, 102, 0.3), 0 0 15px rgba(37, 211, 102, 0.2) !important;
                        transform: translateY(-3px);
                    }
                    .footer-promo-collapse {
                        max-height: 0;
                        opacity: 0;
                        overflow: hidden;
                        margin-top: 0;
                        transition: max-height 0.4s ease, opacity 0.35s ease, margin-top 0.3s ease;
                    }
                    .footer-promo-card:hover .footer-promo-collapse {
                        max-height: 520px;
                        opacity: 1;
                        margin-top: 0.85rem;
                    }
                    .footer-promo-chevron {
                        transition: transform 0.3s ease;
                    }
                    .footer-promo-card:hover .footer-promo-chevron {
                        transform: rotate(180deg);
                    }
                }

                /* En celulares (< 768px): SIEMPRE desplegado para lectura cómoda */
                @media (max-width: 767.98px) {
                    .footer-promo-card {
                        background: linear-gradient(135deg, rgba(28, 32, 37, 0.98) 0%, rgba(25, 135, 84, 0.14) 100%);
                        border: 1.5px solid rgba(37, 211, 102, 0.5);
                    }
                    .footer-promo-collapse {
                        max-height: none !important;
                        opacity: 1 !important;
                        overflow: visible !important;
                        margin-top: 0.85rem !important;
                    }
                }
            `}</style>

            <div className="container d-flex justify-content-center mb-3">
                <div
                    className="footer-promo-card rounded-4 p-3 text-start position-relative shadow-sm"
                    style={{
                        maxWidth: '680px',
                        width: '100%',
                    }}
                >
                    {/* Cabecera principal llamativa */}
                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                    color: '#fff',
                                    boxShadow: '0 0 12px rgba(37, 211, 102, 0.5)',
                                }}
                            >
                                <FaWhatsapp size={24} />
                            </div>
                            <div>
                                <h6 className="mb-0 fw-bold text-white d-flex align-items-center gap-2 fs-6 flex-wrap">
                                    ¿Querés una página para tu emprendimiento?
                                    <span className="badge bg-danger text-uppercase px-2 py-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                        ¡Escribime!
                                    </span>
                                </h6>
                                <span className="text-secondary small">
                                    WhatsApp: <strong className="text-light">3442 654872</strong>
                                </span>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2 ms-auto flex-wrap">
                            {/* Botón 'Toca para chatear' */}
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-promo-whatsapp fw-bold rounded-pill px-3 py-1 shadow-sm d-inline-flex align-items-center gap-1 text-decoration-none"
                            >
                                <FaWhatsapp size={14} /> Toca para chatear
                            </a>

                            {/* Indicador de más info para escritorio */}
                            <span className="badge rounded-pill bg-dark border border-secondary text-light small px-2 py-1 d-none d-md-inline-flex align-items-center gap-1">
                                <span style={{ color: '#25D366' }}>●</span> Más info
                            </span>
                            <FaChevronDown className="footer-promo-chevron text-muted d-none d-md-inline-block" />
                        </div>
                    </div>

                    {/* Contenido: desplegable en escritorio, fijo/abierto en celular */}
                    <div className="footer-promo-collapse">
                        <hr className="border-secondary my-2 opacity-25" />

                        <div
                            className="alert p-2 mb-3 rounded-3 text-white"
                            style={{
                                background: 'rgba(37, 211, 102, 0.12)',
                                border: '1px solid rgba(37, 211, 102, 0.3)',
                            }}
                        >
                            <small className="d-flex align-items-center gap-2 fw-medium">
                                <span className="badge bg-success">Contacto directo</span>
                                <span>Apretá en <strong>"Toca para chatear"</strong> o <strong>"Enviar WhatsApp"</strong> para hablar directamente de tu proyecto.</span>
                            </small>
                        </div>

                        <p className="text-light small mb-2 fw-semibold">
                            🚀 Llevá tu negocio al siguiente nivel tecnológico:
                        </p>

                        <div className="row g-2 mb-3">
                            <div className="col-12 col-md-4">
                                <div
                                    className="p-2 rounded-3 h-100"
                                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                                >
                                    <div className="d-flex align-items-center gap-2 text-info fw-bold small mb-1">
                                        <FaLaptopCode />
                                        <span>Webs & E-Commerce</span>
                                    </div>
                                    <p className="text-secondary small mb-0" style={{ fontSize: '0.78rem' }}>
                                        Catálogos de venta, tiendas virtuales y landing pages veloces y adaptadas a celulares.
                                    </p>
                                </div>
                            </div>

                            <div className="col-12 col-md-4">
                                <div
                                    className="p-2 rounded-3 h-100"
                                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                                >
                                    <div className="d-flex align-items-center gap-2 text-warning fw-bold small mb-1">
                                        <FaRocket />
                                        <span>Software de Gestión</span>
                                    </div>
                                    <p className="text-secondary small mb-0" style={{ fontSize: '0.78rem' }}>
                                        Control de stock, registro de ventas, cuentas corrientes y reportes inteligentes a medida.
                                    </p>
                                </div>
                            </div>

                            <div className="col-12 col-md-4">
                                <div
                                    className="p-2 rounded-3 h-100"
                                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                                >
                                    <div className="d-flex align-items-center gap-2 text-success fw-bold small mb-1">
                                        <FaCogs />
                                        <span>Automatizaciones</span>
                                    </div>
                                    <p className="text-secondary small mb-0" style={{ fontSize: '0.78rem' }}>
                                        Automatizá el flujo de tu negocio: menos tareas repetitivas, cero errores y más ventas.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-1">
                            <span className="text-white-50 small" style={{ fontSize: '0.8rem' }}>
                                💡 <em>Soluciones personalizadas pensadas para hacer crecer tu emprendimiento.</em>
                            </span>
                            {/* Botón 'Enviar WhatsApp' */}
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-promo-whatsapp fw-bold px-3 py-1 rounded-pill d-inline-flex align-items-center gap-1 shadow-sm text-decoration-none"
                            >
                                Enviar WhatsApp <FaArrowRight size={12} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-muted small mb-0">© {new Date().getFullYear()} KE · PERNIL — Todos los derechos reservados</p>
        </footer>
    );
}

export default Footer;
