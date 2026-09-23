import { useRef, useCallback, useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi';

import useCart from '../hooks/useCart';

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
                        <button className="btn btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center" onClick={handleLoginClick} type="button" title="Iniciar sesión (Solo Admin)">
                            <FiUser size={18} />
                        </button>
                    )}
                </div>

                {/* Brand */}
                <NavLink 
                    to="/productos" 
                    className="navbar-brand position-absolute top-50 start-50 translate-middle m-0 fw-bold" 
                    style={{ fontSize: '1.75rem', letterSpacing: '2px', textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}
                    onClick={closeOffcanvas}
                >
                    KE <span className="text-danger">·</span> PERNIL
                </NavLink>

                {/* Right Actions */}
                <div className="d-flex align-items-center gap-2">
                    
                    {/* PC Admin Options */}
                    {isAdmin && (
                        <div className="d-none d-lg-flex gap-2">
                            <button className="btn btn-outline-secondary rounded-pill py-1 px-3 small" onClick={() => navigate('/productos')} type="button">Productos</button>
                            <button className="btn btn-outline-secondary rounded-pill py-1 px-3 small" onClick={() => navigate('/pedidos')} type="button">Pedidos</button>
                        </div>
                    )}
                    
                    {/* PC Profile & Logout */}
                    {isLoggedIn && (
                        <div className="d-none d-lg-flex gap-2">
                            <button className="btn btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center" onClick={() => navigate('/mi-perfil')} type="button" title="Mi perfil">
                                <FiUser size={18} />
                            </button>
                            <button className="btn btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center" onClick={logout} type="button" title="Cerrar sesión">
                                <FiLogOut size={18} />
                            </button>
                        </div>
                    )}

                    {!isAdmin && (
                        <button
                            className="btn btn-danger rounded-pill position-relative d-flex align-items-center gap-1 gap-lg-2 py-1 px-3 small fw-medium"
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
                    <div className="offcanvas offcanvas-end bg-dark text-white d-lg-none" tabIndex="-1" id="userOffcanvas">
                        <div className="offcanvas-header border-bottom border-secondary">
                            <h5 className="offcanvas-title text-white fw-bold">Menú</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
                        </div>
                        <div className="offcanvas-body d-flex flex-column gap-3 p-4">
                            <button className="btn btn-outline-light rounded-pill py-2 fw-medium" onClick={() => handleNavClick('/productos')} type="button">Productos</button>
                            {isAdmin && (
                                <>
                                    <button className="btn btn-outline-light rounded-pill py-2 fw-medium" onClick={() => handleNavClick('/pedidos')} type="button">Pedidos</button>
                                </>
                            )}
                            <button className="btn btn-outline-light rounded-pill py-2 fw-medium d-flex align-items-center justify-content-center gap-2" onClick={() => handleNavClick('/mi-perfil')} type="button">
                                <FiUser size={18} /> Mi perfil
                            </button>
                            <button className="btn btn-danger rounded-pill py-2 fw-medium d-flex align-items-center justify-content-center gap-2" onClick={logout} type="button">
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
                                <button type="button" className="btn btn-dark rounded-pill px-4 fw-medium" onClick={handleConfirmLogin}>Continuar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )}
        </>
    );
}

export default NavBar;
