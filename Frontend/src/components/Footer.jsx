import { useState, useRef, useEffect } from 'react';
import { FaWhatsapp, FaRocket, FaLaptopCode, FaCogs, FaArrowRight, FaChevronDown, FaTimes } from 'react-icons/fa';

function Footer() {
    const [isOpen, setIsOpen] = useState(false);
    const cardRef = useRef(null);

    const whatsappNumber = '5493442654872';
    const whatsappMessage = encodeURIComponent(
        '¡Hola! Vi el cartel en tu web y me gustaría consultar sobre una página web, software de gestión o automatizaciones para mi negocio.'
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    // Cierra el cartel al hacer clic o touch fuera de la tarjeta
    useEffect(() => {
        function handleClickOutside(event) {
            if (cardRef.current && !cardRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <footer className="bg-dark text-center py-4 mt-auto" style={{ borderTop: '3px solid #dc3545' }}>
            <style>{`
                .footer-promo-card {
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
                    transform: scale(1.03);
                }
            `}</style>

            <div className="container d-flex justify-content-center mb-3">
                <div
                    ref={cardRef}
                    className="footer-promo-card rounded-4 p-3 text-start position-relative shadow-sm"
                    style={{
                        maxWidth: '680px',
                        width: '100%',
                        background: isOpen
                            ? 'linear-gradient(135deg, rgba(28, 32, 37, 0.98) 0%, rgba(25, 135, 84, 0.18) 100%)'
                            : 'linear-gradient(135deg, rgba(28, 32, 37, 0.95) 0%, rgba(220, 53, 69, 0.08) 100%)',
                        border: isOpen ? '2px solid #25D366' : '1px solid rgba(255, 255, 255, 0.14)',
                        boxShadow: isOpen
                            ? '0 10px 25px -5px rgba(37, 211, 102, 0.3), 0 0 15px rgba(37, 211, 102, 0.2)'
                            : '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {/* Cabecera principal: click o touch aquí abre el cartel */}
                    <div
                        className="d-flex align-items-center justify-content-between gap-2 flex-wrap"
                        style={{ cursor: !isOpen ? 'pointer' : 'default' }}
                        onClick={() => {
                            if (!isOpen) setIsOpen(true);
                        }}
                    >
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
                                </h6>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2 ms-auto flex-wrap">
                            {/* Botón directo a WhatsApp: no propaga click para no abrir/cerrar */}
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="btn btn-sm btn-promo-whatsapp fw-bold rounded-pill px-3 py-1 shadow-sm d-inline-flex align-items-center gap-1 text-decoration-none"
                            >
                                <FaWhatsapp size={14} /> Toca para chatear
                            </a>

                            {/* Si está cerrado: botón para desplegar con click o touch */}
                            {!isOpen && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-1 text-light small d-inline-flex align-items-center gap-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(true);
                                    }}
                                    title="Ver más detalles"
                                    aria-label="Ver más información"
                                >
                                    <span style={{ color: '#25D366' }}>●</span> Ver más <FaChevronDown size={11} className="ms-1" />
                                </button>
                            )}

                            {/* Si está abierto: botón X para cerrar */}
                            {isOpen && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-light rounded-circle d-inline-flex align-items-center justify-content-center p-0"
                                    style={{ width: '30px', height: '30px', borderColor: 'rgba(255, 255, 255, 0.35)' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                    }}
                                    title="Cerrar cartel"
                                    aria-label="Cerrar cartel"
                                >
                                    <FaTimes size={13} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Contenido desplegable: controlado por click o touch */}
                    <div
                        style={{
                            maxHeight: isOpen ? '550px' : '0px',
                            opacity: isOpen ? 1 : 0,
                            overflow: 'hidden',
                            marginTop: isOpen ? '0.85rem' : '0rem',
                            transition: 'max-height 0.4s ease, opacity 0.35s ease, margin-top 0.3s ease',
                        }}
                    >
                        

                        <p className="text-light small mb-2 fw-semibold">
                            Llevá tu negocio al siguiente nivel tecnológico:
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
                                 <em>Soluciones personalizadas pensadas para hacer crecer tu emprendimiento.</em>
                            </span>
                            <div className="d-flex align-items-center gap-2 ms-auto">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 text-light small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                    }}
                                >
                                    Cerrar
                                </button>
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="btn btn-sm btn-promo-whatsapp fw-bold px-3 py-1 rounded-pill d-inline-flex align-items-center gap-1 shadow-sm text-decoration-none"
                                >
                                    Enviar WhatsApp <FaArrowRight size={12} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-muted small mb-0">© {new Date().getFullYear()} KE · PERNIL — Todos los derechos reservados</p>
        </footer>
    );
}

export default Footer;
