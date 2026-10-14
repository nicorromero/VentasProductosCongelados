import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiRotateCcw, FiMinus, FiPlus, FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import useCart from '../hooks/useCart';

import InlineProductEdit from './InlineProductEdit';

function getRole() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1])).role;
    } catch { return null; }
}

function normalizeImages(data) {
    if (Array.isArray(data?.images) && data.images.length > 0) {
        return data.images.slice(0, 5);
    }
    if (data?.image) {
        return [data.image];
    }
    return [];
}

function ProductCard({id, name, details, price, image, images = [], stock, category, active, badge, suggestedPrice = null, suggestedPriceDate = null, isCreate, onCreateSuccess}) {
    const { cartItems, addToCart, removeFromCart, increaseQty, decreaseQty, updateQty } = useCart();
    const isAdmin = getRole() === 'admin';

    const cardRef = useRef(null);
    const modalCardRef = useRef(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isAdminSelectingStock, setIsAdminSelectingStock] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewingDetail, setIsViewingDetail] = useState(false);
    const initialQtyRef = useRef(0);
    const initialStockRef = useRef(0);

    const handleStartViewDetail = (e) => {
        if (e) e.stopPropagation();
        setIsViewingDetail(true);
    };

    const initialImages = normalizeImages({ images, image });
    const [localData, setLocalData] = useState({
        name,
        details,
        price,
        image: initialImages[0] || image || '',
        images: initialImages,
        stock,
        category,
        active,
        badge,
        suggestedPrice,
        suggestedPriceDate
    });
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const norm = normalizeImages({ images, image });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalData({
            name,
            details,
            price,
            image: norm[0] || image || '',
            images: norm,
            stock,
            category,
            active,
            badge,
            suggestedPrice,
            suggestedPriceDate
        });
    }, [name, details, price, image, images, stock, category, active, badge, suggestedPrice, suggestedPriceDate]);

    const cartItem = cartItems?.find((item) => item._id === id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleUndo = useCallback(() => {
        const initialQty = initialQtyRef.current;
        if (initialQty === 0) {
            removeFromCart(id);
        } else {
            updateQty(id, initialQty);
        }
        setIsSelecting(false);
    }, [id, removeFromCart, updateQty]);

    const handleUndoAdminStock = useCallback(() => {
        setLocalData(prev => ({ ...prev, stock: initialStockRef.current }));
        setIsAdminSelectingStock(false);
    }, []);

    useEffect(() => {
        if (!isSelecting && !isEditing && !isAdminSelectingStock) return;

        const handleClickOutside = (e) => {
            if (isEditing) {
                if (modalCardRef.current && !modalCardRef.current.contains(e.target)) {
                    setIsEditing(false);
                }
                return;
            }
            if (cardRef.current && !cardRef.current.contains(e.target)) {
                if (isSelecting) handleUndo();
                if (isAdminSelectingStock) handleUndoAdminStock();
            }
        };

        const handleOtherCardActivated = (e) => {
            if (e.detail?.id !== id) {
                if (isSelecting) handleUndo();
                if (isEditing) setIsEditing(false);
                if (isAdminSelectingStock) handleUndoAdminStock();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('product-card-activate', handleOtherCardActivated);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('product-card-activate', handleOtherCardActivated);
        };
    }, [isSelecting, isEditing, isAdminSelectingStock, id, handleUndo, handleUndoAdminStock]);

    useEffect(() => {
        if (!isEditing) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsEditing(false);
            }
        };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isEditing]);

    const handleStartSelecting = (e) => {
        e.stopPropagation();
        if (localData.stock !== undefined && localData.stock !== null && localData.stock <= 0) {
            toast.warning('Sin stock disponible');
            return;
        }

        window.dispatchEvent(new CustomEvent('product-card-activate', { detail: { id } }));

        const currentQtyInCart = cartItem ? cartItem.quantity : 0;
        initialQtyRef.current = currentQtyInCart;

        const displayImages = normalizeImages(localData);
        if (currentQtyInCart === 0) {
            addToCart({ _id: id, nombre: localData.name, precio: localData.price, imagen: displayImages[0] || localData.image, stock: localData.stock });
        }
        setIsSelecting(true);
    };

    const handleStartEditing = (e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('product-card-activate', { detail: { id } }));
        setIsEditing(true);
    };

    const handleConfirm = (e) => {
        e.stopPropagation();
        setIsSelecting(false);
        toast.success('Producto agregado al carrito');
    };

    const handleIncrease = (e) => {
        e.stopPropagation();
        if (localData.stock !== undefined && localData.stock !== null && quantity >= localData.stock) {
            toast.warning('No hay más stock disponible');
            return;
        }
        increaseQty(id);
    };

    const handleDecrease = (e) => {
        e.stopPropagation();
        if (quantity > 1) {
            decreaseQty(id);
        }
    };

    const handleEditSuccess = (updatedData) => {
        const norm = normalizeImages(updatedData);
        setLocalData({
            ...localData,
            ...updatedData,
            images: norm,
            image: norm[0] || updatedData.image || ''
        });
        window.dispatchEvent(new CustomEvent('product-updated', { detail: updatedData }));
        setCurrentImageIndex(0);
        setIsEditing(false);
    };

    const displayImages = normalizeImages(localData);
    const safeImageIndex = currentImageIndex < displayImages.length ? currentImageIndex : 0;

    const handlePrevImage = (e) => {
        e.stopPropagation();
        if (displayImages.length <= 1) return;
        setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        if (displayImages.length <= 1) return;
        setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
    };

    const handleToggleActive = (updatedData) => {
        setLocalData(prev => ({ ...prev, active: updatedData.active }));
        window.dispatchEvent(new CustomEvent('product-updated', { detail: updatedData }));
    };

    const handleDeleteProduct = () => {
        // Al eliminar, simplemente refrescamos la pagina o forzamos re-render
        window.location.reload();
    };

    const handleStartAdminStock = (e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('product-card-activate', { detail: { id } }));
        initialStockRef.current = Number(localData.stock || 0);
        setIsAdminSelectingStock(true);
    };

    const handleAdminStockChange = (e, delta, overrideValue) => {
        if (e) e.stopPropagation();
        
        let newStock;
        if (delta !== undefined) {
            newStock = Number(localData.stock || 0) + delta;
        } else {
            newStock = Number(overrideValue || 0);
        }
        
        if (newStock < 0) newStock = 0;
        
        setLocalData(prev => ({ ...prev, stock: newStock }));
    };

    const handleConfirmAdminStock = async (e) => {
        if (e) e.stopPropagation();
        const newStock = Number(localData.stock || 0);
        setIsAdminSelectingStock(false);

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`, 
                { ...localData, stock: newStock }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Stock actualizado');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al actualizar');
            setLocalData(prev => ({ ...prev, stock: initialStockRef.current }));
        }
    };

    const editModal = isEditing && typeof document !== 'undefined' ? createPortal(
        <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1060 }}
        >
            <style>{`
                @keyframes adminBackdropFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes adminCardFlipEnlarge {
                    0% {
                        transform: perspective(1200px) rotateY(-180deg) scale(0.6);
                        opacity: 0;
                    }
                    65% {
                        transform: perspective(1200px) rotateY(6deg) scale(1.02);
                        opacity: 1;
                    }
                    100% {
                        transform: perspective(1200px) rotateY(0deg) scale(1);
                        opacity: 1;
                    }
                }
                @keyframes adminCardMobileIn {
                    0% {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .admin-edit-backdrop {
                    background-color: rgba(15, 23, 42, 0.75);
                    animation: adminBackdropFadeIn 0.2s ease-out forwards;
                }

                /* En desktop y tablet: blur elegante de fondo */
                @media (min-width: 768px) {
                    .admin-edit-backdrop {
                        background-color: rgba(15, 23, 42, 0.6);
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                    }
                    .admin-edit-modal-card {
                        animation: adminCardFlipEnlarge 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
                    }
                }

                /* En celulares: sin blur para máxima nitidez y rendimiento */
                @media (max-width: 767.98px) {
                    .admin-edit-backdrop {
                        backdrop-filter: none !important;
                        -webkit-backdrop-filter: none !important;
                    }
                    .admin-edit-modal-card {
                        animation: adminCardMobileIn 0.25s ease-out forwards !important;
                    }
                }
            `}</style>

            {/* Telón de fondo independiente (al hacer clic descarta cambios) */}
            <div
                className="position-absolute top-0 start-0 w-100 h-100 admin-edit-backdrop"
                onClick={() => setIsEditing(false)}
            />

            {/* Contenedor centrado */}
            <div
                className="position-relative w-100 h-100 d-flex align-items-center justify-content-center p-2 p-sm-3"
                style={{ pointerEvents: 'none' }}
                onClick={() => setIsEditing(false)}
            >
                <div
                    ref={modalCardRef}
                    className="card border-0 shadow-lg rounded-4 overflow-hidden admin-edit-modal-card"
                    style={{
                        pointerEvents: 'auto',
                        maxWidth: '580px',
                        width: '100%',
                        maxHeight: '92vh',
                        overflowY: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        transformOrigin: 'center center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                <div className="card-body p-2 p-sm-3 p-md-4">
                    <InlineProductEdit
                        id={id}
                        initialData={localData}
                        isCreate={isCreate}
                        onCancel={() => setIsEditing(false)}
                        onSuccess={(data) => {
                            if (isCreate) {
                                setIsEditing(false);
                                if (onCreateSuccess) onCreateSuccess(data);
                            } else {
                                handleEditSuccess(data);
                            }
                        }}
                        onToggleActive={handleToggleActive}
                        onDeleteProduct={handleDeleteProduct}
                    />
                </div>
            </div>
            </div>
        </div>,
        document.body
    ) : null;

    // ── CREATE card ──
    if (isCreate) {
        return (
            <>
                <article ref={cardRef} className="card rounded-3 overflow-hidden" style={{ border: '2px dashed #dee2e6' }} role="button" onClick={handleStartEditing}>
                    <div className="bg-body-secondary d-flex align-items-center justify-content-center" style={{ height: '220px' }}>
                        <img
                            src="https://placehold.co/300x300/f8fafc/cbd5e1?text=%2B"
                            alt="Nuevo Producto"
                            className="w-100 h-100 object-fit-cover opacity-50"
                        />
                    </div>
                    <div className="card-body p-3 opacity-75">
                        <p className="text-muted small text-uppercase mb-1">-</p>
                        <h3 className="fs-6 fw-medium text-secondary mb-1">Nuevo Producto</h3>
                        <span className="text-muted">$0</span>
                        <button type="button" className="btn btn-light btn-sm w-100 mt-2 border d-flex align-items-center justify-content-center gap-1" style={{ pointerEvents: 'none' }}>
                            <FiPlus /> Crear Producto
                        </button>
                    </div>
                </article>
                {editModal}
            </>
        );
    }

    // ── NORMAL card (front) ──
    const isInactive = localData.active === false;

    const isInCart = quantity > 0;
    const [isCartBtnHovered, setIsCartBtnHovered] = useState(false);

    const handleToggleCart = (e) => {
        e.stopPropagation();
        if (isInactive) return;

        if (isInCart) {
            removeFromCart(id);
            toast.info('Producto quitado del carrito');
            setIsCartBtnHovered(false);
            return;
        }

        if (localData.stock !== undefined && localData.stock !== null && localData.stock <= 0) {
            toast.warning('Sin stock disponible');
            return;
        }

        const displayImgs = normalizeImages(localData);
        addToCart({ _id: id, nombre: localData.name, precio: localData.price, imagen: displayImgs[0] || localData.image, stock: localData.stock });
        toast.success('Producto agregado al carrito');
    };

    const cartControlUI = (
        <button
            type="button"
            className={`btn ${
                isInactive 
                    ? 'btn-secondary opacity-50' 
                    : isInCart 
                        ? (isCartBtnHovered ? 'btn-outline-danger' : 'btn-success') 
                        : 'btn-dark'
            } rounded-pill fw-medium btn-sm w-100 mt-auto d-flex align-items-center justify-content-center gap-1 transition-all`}
            onClick={handleToggleCart}
            onMouseEnter={() => isInCart && setIsCartBtnHovered(true)}
            onMouseLeave={() => setIsCartBtnHovered(false)}
            disabled={isInactive}
            title={isInCart ? 'Clic para quitar del carrito' : 'Agregar 1 unidad al carrito'}
            style={{ transition: 'all 0.2s ease-in-out' }}
        >
            {isInactive ? (
                'No disponible'
            ) : isInCart ? (
                isCartBtnHovered ? (
                    <>
                        <FiRotateCcw size={14} /> Quitar del carrito
                    </>
                ) : (
                    <>
                        <FiCheck size={14} /> Agregado al carrito
                    </>
                )
            ) : (
                'Agregar al Carrito'
            )}
        </button>
    );

    const viewModal = isViewingDetail && !isAdmin && typeof document !== 'undefined' ? createPortal(
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1060 }}>
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75" onClick={() => setIsViewingDetail(false)} style={{ backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }} />
            
            <div className="card border-0 shadow-lg overflow-hidden position-relative d-flex flex-column bg-white" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', zIndex: 1061, animation: 'adminCardMobileIn 0.25s ease-out forwards' }}>
                {/* Botón Cerrar */}
                <button 
                    className="btn btn-light rounded-circle position-absolute top-0 end-0 m-2 z-3 d-flex align-items-center justify-content-center p-0 shadow-sm"
                    style={{ width: '32px', height: '32px', opacity: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); setIsViewingDetail(false); }}
                >
                    <span className="fs-5 fw-bold" style={{ lineHeight: 1 }}>&times;</span>
                </button>

                {/* Contenedor de Imagen (Grande) */}
                <div className="position-relative bg-body-secondary overflow-hidden flex-shrink-0" style={{ height: '350px' }}>
                    {/* Carousel controls */}
                    {displayImages.length > 1 && (
                        <>
                            <button className="btn btn-dark btn-sm rounded-circle position-absolute start-0 top-50 translate-middle-y ms-2 z-3 d-flex align-items-center justify-content-center p-0 opacity-75 border-0 text-white shadow-sm" style={{ width: '32px', height: '32px' }} onClick={handlePrevImage}>
                                <FiChevronLeft size={20} />
                            </button>
                            <button className="btn btn-dark btn-sm rounded-circle position-absolute end-0 top-50 translate-middle-y me-2 z-3 d-flex align-items-center justify-content-center p-0 opacity-75 border-0 text-white shadow-sm" style={{ width: '32px', height: '32px' }} onClick={handleNextImage}>
                                <FiChevronRight size={20} />
                            </button>
                            {/* Dots */}
                            <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 z-3 d-flex gap-1 align-items-center bg-dark bg-opacity-50 px-2 py-1 rounded-pill">
                                {displayImages.map((_, idx) => (
                                    <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }} className="border-0 p-0 rounded-pill" style={{ width: idx === safeImageIndex ? '14px' : '6px', height: '6px', backgroundColor: idx === safeImageIndex ? '#ffffff' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s ease' }} />
                                ))}
                            </div>
                        </>
                    )}
                    <img
                        src={displayImages[safeImageIndex] || `https://placehold.co/500x500/e2e8f0/64748b?text=${encodeURIComponent(localData.name || 'Producto')}`}
                        alt={localData.name}
                        className="w-100 h-100 object-fit-contain bg-white"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/500x500/e2e8f0/64748b?text=${encodeURIComponent(localData.name || 'Producto')}`; }}
                    />
                </div>

                {/* Info y Controles */}
                <div className="card-body p-4 d-flex flex-column overflow-auto">
                    <h2 className="fs-4 fw-bold mb-2">{localData.name}</h2>
                    <span className="fw-bold fs-3 text-success mb-4">${localData.price}</span>

                    <div className="mt-auto pt-2">
                        {cartControlUI}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <article ref={cardRef} className={`card border-0 shadow-sm rounded-3 overflow-hidden h-100 ${isInactive && !isAdmin ? 'opacity-50' : ''}`}>
            <div onClick={isAdmin ? handleStartEditing : handleStartViewDetail} role="button" className="d-flex flex-column h-100" style={{ pointerEvents: (isInactive && !isAdmin) ? 'none' : 'auto' }}>
                {/* Image container */}
                <div className="position-relative bg-body-secondary overflow-hidden" style={{ height: '220px' }}>
                    <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 40%)', pointerEvents: 'none', zIndex: 1 }}></div>
                    {isAdmin ? (
                        <div className="position-absolute top-0 start-0 m-2 z-2 d-flex gap-1">
                            <span className="badge bg-dark bg-opacity-50 rounded-pill small fw-medium">Clic para editar</span>
                            {isInactive && <span className="badge bg-danger rounded-pill small fw-medium">INACTIVO</span>}
                        </div>
                    ) : (
                        localData.badge && <span className="badge bg-danger position-absolute top-0 start-0 m-2 z-1 small">{localData.badge}</span>
                    )}

                    {/* Counter badge when multiple images */}
                    {displayImages.length > 1 && (
                        <span
                            className="badge bg-dark bg-opacity-75 rounded-pill position-absolute top-0 end-0 m-2 z-2 small px-2 py-1"
                            style={{ fontSize: '0.7rem' }}
                        >
                            {safeImageIndex + 1}/{displayImages.length}
                        </span>
                    )}

                    <img
                        src={displayImages[safeImageIndex] || `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(localData.name || 'Producto')}`}
                        alt={localData.name}
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(localData.name || 'Producto')}`;
                        }}
                    />

                    {/* Carousel controls if > 1 image */}
                    {displayImages.length > 1 && (
                        <>
                            <button
                                type="button"
                                className="btn btn-dark btn-sm rounded-circle position-absolute start-0 top-50 translate-middle-y ms-2 z-3 d-flex align-items-center justify-content-center p-0 opacity-75 shadow-sm border-0 text-white"
                                style={{ width: '28px', height: '28px' }}
                                onClick={handlePrevImage}
                                aria-label="Foto anterior"
                            >
                                <FiChevronLeft size={16} />
                            </button>
                            <button
                                type="button"
                                className="btn btn-dark btn-sm rounded-circle position-absolute end-0 top-50 translate-middle-y me-2 z-3 d-flex align-items-center justify-content-center p-0 opacity-75 shadow-sm border-0 text-white"
                                style={{ width: '28px', height: '28px' }}
                                onClick={handleNextImage}
                                aria-label="Siguiente foto"
                            >
                                <FiChevronRight size={16} />
                            </button>

                            {/* Dots */}
                            <div
                                className="position-absolute bottom-0 start-50 translate-middle-x mb-2 z-3 d-flex gap-1 align-items-center bg-dark bg-opacity-50 px-2 py-1 rounded-pill"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {displayImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(idx);
                                        }}
                                        className="border-0 p-0 rounded-pill"
                                        style={{
                                            width: idx === safeImageIndex ? '14px' : '6px',
                                            height: '6px',
                                            backgroundColor: idx === safeImageIndex ? '#ffffff' : 'rgba(255,255,255,0.5)',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                        aria-label={`Foto ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Info */}
                <div className="card-body p-3 d-flex flex-column">
                    <p className="text-muted small text-uppercase mb-1" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>{localData.category}</p>
                    <h3 className="fs-6 fw-medium mb-1">{localData.name}</h3>
                    <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                        <span className="fw-medium fs-5">${localData.price}</span>
                        {isAdmin && localData.suggestedPrice != null && Number(localData.suggestedPrice) !== Number(localData.price) && (
                            <span
                                className="badge bg-warning text-dark border border-warning-subtle fw-semibold"
                                style={{ fontSize: '0.72rem' }}
                                title="Precio sugerido por la planilla de costos de Excel"
                            >
                                Según Excel: ${localData.suggestedPrice}
                            </span>
                        )}
                    </div>

                    {isAdmin ? (
                        /* Admin stock control */
                        !isAdminSelectingStock ? (
                            <button
                                type="button"
                                className="btn btn-outline-dark btn-sm w-100 mt-auto rounded-pill fw-medium"
                                onClick={handleStartAdminStock}
                            >
                                Stock: {localData.stock || 0}
                            </button>
                        ) : (
                            <div className="btn-group w-100 mt-auto" onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    className="btn btn-dark btn-sm"
                                    onClick={(e) => { e.stopPropagation(); handleUndoAdminStock(); }}
                                    title="Deshacer"
                                >
                                    <FiRotateCcw size={14} />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-dark btn-sm"
                                    onClick={(e) => handleAdminStockChange(e, -1)}
                                >
                                    <FiMinus size={14} />
                                </button>
                                <input
                                    type="number"
                                    className="btn btn-dark btn-sm fw-bold border-0 text-center"
                                    style={{ width: '40px', padding: '0.25rem', MozAppearance: 'textfield' }}
                                    value={localData.stock || 0}
                                    onChange={(e) => handleAdminStockChange(e, undefined, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                    type="button"
                                    className="btn btn-dark btn-sm"
                                    onClick={(e) => handleAdminStockChange(e, 1)}
                                >
                                    <FiPlus size={14} />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success btn-sm"
                                    onClick={handleConfirmAdminStock}
                                    title="Confirmar"
                                >
                                    <FiCheck size={16} />
                                </button>
                            </div>
                        )
                    ) : (
                        cartControlUI
                    )}
                </div>
            </div>
        </article>
        {editModal}
        {viewModal}
        </>
    );
}

export default ProductCard;
