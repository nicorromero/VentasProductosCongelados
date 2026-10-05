import { useRef, useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi';

import useCart from '../hooks/useCart';
import InlineProductEdit from './InlineProductEdit';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function getTokenData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

function NavBar() {
    const navigate = useNavigate();
    useLocation();
    const { cartQuantity } = useCart();
    const tokenData = getTokenData();
    const isLoggedIn = !!tokenData;
    const isAdmin = tokenData?.role === 'admin';

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (!showCreateModal) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowCreateModal(false);
            }
        };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showCreateModal]);

    const handleCreateSuccess = (newProduct) => {
        setShowCreateModal(false);
        window.dispatchEvent(new CustomEvent('product-created', { detail: newProduct }));
        window.location.reload(); // Simple way to ensure the new product shows up everywhere
    };

    const closeOffcanvas = useCallback(() => {
        const offcanvasEl = document.getElementById('userOffcanvas');
        if (offcanvasEl && offcanvasEl.classList.contains('show')) {
            const closeBtn = offcanvasEl.querySelector('.btn-close');
            if (closeBtn) closeBtn.click();
        }
    }, []);

    const handleNavClick = (path) => {
        closeOffcanvas();
        navigate(path);
    };

    const logout = () => {
        closeOffcanvas();
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleLoginClick = () => {
        setShowLoginModal(true);
    };

    const handleConfirmLogin = () => {
        setShowLoginModal(false);
        navigate('/admin-login');
    };

    return (
        <>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
            <div className="container-fluid px-3 px-lg-4 position-relative d-flex justify-content-between align-items-center" style={{ minHeight: '60px' }}>
                
                {/* Left Actions */}
                <div className="d-flex align-items-center">
                    {!isLoggedIn && (
                        <button className="btn btn-outline-light opacity-75 rounded-circle p-2 d-flex align-items-center justify-content-center" onClick={handleLoginClick} type="button" title="Iniciar sesión (Solo Admin)">
                            <FiUser size={18} />
                        </button>
                    )}
                </div>

                {/* Brand */}
                <NavLink 
                    to="/productos" 
                    className="navbar-brand position-absolute top-50 start-50 translate-middle m-0 fw-bold" 
                    style={{ fontSize: '1.75rem', letterSpacing: '2px', textShadow: '2px 2px 4px rgba(0,0,0,0.6)', fontFamily: "'Bebas Neue', sans-serif" }}
                    onClick={closeOffcanvas}
                >
                    KE <span className="text-warning">·</span> PERNIL
                </NavLink>

                {/* Right Actions */}
                <div className="d-flex align-items-center gap-2">
                    
                    {/* PC Admin Options */}
                    {isAdmin && (
                        <div className="d-none d-lg-flex gap-2">
                            <button className="btn btn-outline-light rounded-pill py-1 px-3 small" onClick={() => setShowCreateModal(true)} type="button">Crear Producto</button>
                            <button className="btn btn-outline-light rounded-pill py-1 px-3 small" onClick={() => navigate('/productos')} type="button">Productos</button>
                            <button className="btn btn-outline-light rounded-pill py-1 px-3 small" onClick={() => navigate('/pedidos')} type="button">Pedidos</button>
                            <button className="btn btn-outline-light rounded-pill py-1 px-3 small" onClick={() => navigate('/ventas')} type="button">Ventas</button>
                        </div>
                    )}
                    
                    {/* PC Profile & Logout */}
                    {isLoggedIn && (
                        <div className="d-none d-lg-flex gap-2">
                            <button className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center" onClick={() => navigate('/mi-perfil')} type="button" title="Mi perfil">
                                <FiUser size={18} />
                            </button>
                            <button className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center" onClick={logout} type="button" title="Cerrar sesión">
                                <FiLogOut size={18} />
                            </button>
                        </div>
                    )}

                    {!isAdmin && (
                        <button
                            className="btn btn-danger rounded-pill position-relative d-flex align-items-center gap-1 gap-lg-2 py-1 px-3 small fw-medium"
                            style={{ boxShadow: '0 2px 8px rgba(220,53,69,0.3)', transition: 'all 0.2s ease' }}
                            onClick={() => navigate('/carrito')}
                            type="button"
                        >
                            <FiShoppingCart size={16} />
                            <span className="d-none d-lg-inline">Carrito</span>
                            {cartQuantity > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-white text-danger" style={{ fontSize: '0.65rem' }}>
                                    {cartQuantity}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Mobile Menu Toggler (For any logged-in user) */}
                    {isLoggedIn && (
                        <button
                            className="navbar-toggler border-0 shadow-none ms-1 p-1"
                            type="button"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#userOffcanvas"
                            aria-controls="userOffcanvas"
                        >
                            <span className="navbar-toggler-icon" style={{ transform: 'scale(0.85)' }}></span>
                        </button>
                    )}
                </div>

                {/* Mobile Offcanvas (For Logged-in Users) */}
                {isLoggedIn && (
                    <div className="offcanvas offcanvas-end bg-dark text-white d-lg-none" tabIndex="-1" id="userOffcanvas" style={{ width: '280px' }}>
                        <div className="offcanvas-header border-bottom border-secondary">
                            <h5 className="offcanvas-title text-white fw-bold">Menú</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
                        </div>
                        <div className="offcanvas-body d-flex flex-column gap-3 p-4">
                            <button className="btn btn-outline-light rounded-pill py-2 fw-medium" onClick={() => handleNavClick('/productos')} type="button">Productos</button>
                            {isAdmin && (
                                <>
                                    <button className="btn btn-outline-light rounded-pill py-2 fw-medium" onClick={() => { closeOffcanvas(); setShowCreateModal(true); }} type="button">Crear Producto</button>
                                    <button className="btn btn-outline-light rounded-pill py-2 fw-medium" onClick={() => handleNavClick('/pedidos')} type="button">Pedidos</button>
                                    <button className="btn btn-outline-light rounded-pill py-2 fw-medium" onClick={() => handleNavClick('/ventas')} type="button">Ventas</button>
                                </>
                            )}
                            <button className="btn btn-outline-light rounded-pill py-2 fw-medium d-flex align-items-center justify-content-center gap-2" onClick={() => handleNavClick('/mi-perfil')} type="button">
                                <FiUser size={18} /> Mi perfil
                            </button>
                            <button className="btn btn-outline-danger rounded-pill py-2 fw-medium d-flex align-items-center justify-content-center gap-2" onClick={logout} type="button">
                                <FiLogOut size={18} /> Cerrar sesión
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>

        {/* Modal de Advertencia de Login */}
        {showLoginModal && (
            <>
                <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
                <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }} aria-modal="true" role="dialog">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header border-bottom-0 pb-0">
                                <h5 className="modal-title fw-bold text-dark">Acceso restringido</h5>
                                <button type="button" className="btn-close" onClick={() => setShowLoginModal(false)} aria-label="Cerrar"></button>
                            </div>
                            <div className="modal-body text-dark">
                                <div className="p-2">
                                    <p className="mb-2 fs-5"><strong>No es necesario iniciar sesión para comprar.</strong></p>
                                    <p className="mb-0 text-secondary">
                                        Esta sección es exclusiva para la administración de la tienda. 
                                        No se permite la creación de nuevas cuentas.
                                    </p>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 pt-0 pb-3 px-4 d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-light rounded-pill px-4 fw-medium border" onClick={() => setShowLoginModal(false)}>Volver a la tienda</button>
                                <button type="button" className="btn btn-dark rounded-pill px-4 fw-medium shadow-sm" onClick={handleConfirmLogin}>Continuar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )}

        {/* Modal para Crear Producto */}
        {showCreateModal && typeof document !== 'undefined' && createPortal(
            <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1060 }}>
                <style>{`
                    @keyframes adminBackdropFadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes adminCardFlipEnlarge {
                        0% { transform: perspective(1200px) rotateY(-180deg) scale(0.6); opacity: 0; }
                        65% { transform: perspective(1200px) rotateY(6deg) scale(1.02); opacity: 1; }
                        100% { transform: perspective(1200px) rotateY(0deg) scale(1); opacity: 1; }
                    }
                    @keyframes adminCardMobileIn {
                        0% { transform: scale(0.9); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .admin-edit-backdrop {
                        background-color: rgba(15, 23, 42, 0.75);
                        animation: adminBackdropFadeIn 0.2s ease-out forwards;
                    }
                    @media (min-width: 768px) {
                        .admin-edit-backdrop { background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
                        .admin-edit-modal-card { animation: adminCardFlipEnlarge 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards !important; }
                    }
                    @media (max-width: 767.98px) {
                        .admin-edit-backdrop { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
                        .admin-edit-modal-card { animation: adminCardMobileIn 0.25s ease-out forwards !important; }
                    }
                `}</style>
                <div className="position-absolute top-0 start-0 w-100 h-100 admin-edit-backdrop" onClick={() => setShowCreateModal(false)} />
                <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center p-2 p-sm-3" style={{ pointerEvents: 'none' }}>
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden admin-edit-modal-card bg-white" style={{ pointerEvents: 'auto', maxWidth: '580px', width: '100%', maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', transformOrigin: 'center center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <div className="card-body p-2 p-sm-3 p-md-4">
                            <InlineProductEdit
                                id="new"
                                initialData={{}}
                                isCreate={true}
                                onCancel={() => setShowCreateModal(false)}
                                onSuccess={handleCreateSuccess}
                            />
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        )}
        </>
    );
}

export default NavBar;
