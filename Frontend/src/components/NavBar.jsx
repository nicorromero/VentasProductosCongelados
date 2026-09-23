import { useRef, useCallback, useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi';
import axios from 'axios';
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
    const offcanvasRef = useRef(null);
    const [categoryList, setCategoryList] = useState([]);

    const tokenData = getTokenData();
    const isLoggedIn = !!tokenData;
    const isAdmin = tokenData?.role === 'admin';

    useEffect(() => {
        axios.get(`${API_URL}/categories`)
            .then(res => setCategoryList(res.data))
            .catch(() => {});
    }, []);

    const categorias = [
        { href: '/productos', text: 'Productos' },
        ...categoryList.map(cat => ({
            href: `/catalogo/${cat.name}`,
            text: cat.name
        }))
    ];

    // Cierra el offcanvas programáticamente
    const closeOffcanvas = useCallback(() => {
        const offcanvasEl = document.getElementById('navOffcanvas');
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

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
            <div className="container-fluid px-3 px-lg-4">

                {/* Brand */}
                <NavLink to="/" className="navbar-brand fw-medium me-0" onClick={closeOffcanvas}>
                    KE <span className="text-danger">·</span> PERNIL
                </NavLink>

                {/* Cart button visible on mobile (outside offcanvas) */}
                {!isAdmin && (
                    <button
                        className="btn btn-danger rounded-pill d-lg-none position-relative ms-auto me-2 d-flex align-items-center gap-1 py-1 px-3 small"
                        onClick={() => navigate('/carrito')}
                        type="button"
                    >
                        <FiShoppingCart size={16} />
                        {cartQuantity > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-white text-danger" style={{ fontSize: '0.65rem' }}>
                                {cartQuantity}
                            </span>
                        )}
                    </button>
                )}

                {/* Toggler for offcanvas */}
                <button
                    className={`navbar-toggler border-0 shadow-none ${isAdmin ? 'ms-auto' : ''}`}
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#navOffcanvas"
                    aria-controls="navOffcanvas"
                    aria-label="Abrir menú"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Offcanvas (mobile) / Inline (desktop via offcanvas-lg) */}
                <div
                    className="offcanvas-lg offcanvas-start bg-dark text-white"
                    tabIndex="-1"
                    id="navOffcanvas"
                    ref={offcanvasRef}
                >
                    <div className="offcanvas-header border-bottom border-secondary">
                        <h5 className="offcanvas-title text-white">Menú</h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            data-bs-dismiss="offcanvas"
                            data-bs-target="#navOffcanvas"
                            aria-label="Cerrar"
                        ></button>
                    </div>

                    <div className="offcanvas-body d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2 gap-lg-3">

                        {/* Categorías */}
                        <ul className="navbar-nav flex-column flex-lg-row mx-lg-auto gap-1 w-100 w-lg-auto">
                            {categorias.map((cat) => (
                                <li key={cat.href} className="nav-item">
                                    <NavLink
                                        to={cat.href}
                                        onClick={closeOffcanvas}
                                        className={({ isActive }) =>
                                            `nav-link rounded-pill px-3 py-2 ${isActive ? 'active bg-secondary bg-opacity-50 fw-medium' : 'text-secondary'}`
                                        }
                                    >
                                        {cat.text}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>

                        {/* Separator */}
                        <div className="vr d-none d-lg-block mx-2 bg-secondary opacity-50" style={{ height: '24px' }}></div>
                        <hr className="d-lg-none w-100 border-secondary my-1" />

                        {/* Acciones */}
                        <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2 w-100 w-lg-auto">

                            {/* Cart - inside offcanvas for mobile with text */}
                            {!isAdmin && (
                                <button
                                    className="btn btn-danger rounded-pill position-relative d-lg-none d-flex align-items-center justify-content-center gap-2 py-2 px-3 fw-medium"
                                    onClick={() => handleNavClick('/carrito')}
                                    type="button"
                                >
                                    <FiShoppingCart size={16} />
                                    Carrito
                                    {cartQuantity > 0 && (
                                        <span className="badge rounded-pill bg-white text-danger ms-1" style={{ fontSize: '0.7rem' }}>
                                            {cartQuantity}
                                        </span>
                                    )}
                                </button>
                            )}

                            {/* Cart (desktop only) */}
                            {!isAdmin && (
                                <button
                                    className="btn btn-danger rounded-pill position-relative d-none d-lg-inline-flex align-items-center gap-2 py-1 px-3 small fw-medium"
                                    onClick={() => navigate('/carrito')}
                                    type="button"
                                >
                                    <FiShoppingCart size={14} />
                                    Carrito
                                    {cartQuantity > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-white text-danger" style={{ fontSize: '0.65rem' }}>
                                            {cartQuantity}
                                        </span>
                                    )}
                                </button>
                            )}

                            {isAdmin && (
                                <button className="btn btn-outline-secondary rounded-pill py-2 py-lg-1 px-3 small" onClick={() => handleNavClick('/usuarios')} type="button">
                                    Usuarios
                                </button>
                            )}
                            {isAdmin && (
                                <button className="btn btn-outline-secondary rounded-pill py-2 py-lg-1 px-3 small" onClick={() => handleNavClick('/pedidos')} type="button">
                                    Pedidos
                                </button>
                            )}
                            {isLoggedIn && (
                                <button 
                                    className="btn btn-outline-secondary rounded-pill py-2 py-lg-1 px-3 d-flex align-items-center justify-content-center" 
                                    onClick={() => handleNavClick('/mi-perfil')} 
                                    type="button"
                                    title="Mi perfil"
                                    aria-label="Mi perfil"
                                >
                                    <FiUser size={16} />
                                </button>
                            )}

                            {isLoggedIn && (
                                <button 
                                    className="btn btn-outline-secondary rounded-pill py-2 py-lg-1 px-3 d-flex align-items-center justify-content-center" 
                                    onClick={logout} 
                                    type="button"
                                    title="Cerrar sesión"
                                    aria-label="Cerrar sesión"
                                >
                                    <FiLogOut size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
