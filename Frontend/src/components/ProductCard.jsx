import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRotateCcw, FiMinus, FiPlus, FiCheck } from 'react-icons/fi';
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

function ProductCard({id, name, details, price, image, stock, category, active, badge, isCreate, onCreateSuccess}) {
    const navigate = useNavigate();
    const { cartItems, addToCart, removeFromCart, increaseQty, decreaseQty, updateQty } = useCart();
    const isAdmin = getRole() === 'admin';

    const cardRef = useRef(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isAdminSelectingStock, setIsAdminSelectingStock] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const initialQtyRef = useRef(0);
    const initialStockRef = useRef(0);

    const [localData, setLocalData] = useState({ name, details, price, image, stock, category, active, badge });

    useEffect(() => {
        setLocalData({ name, details, price, image, stock, category, active, badge });
    }, [name, details, price, image, stock, category, active, badge]);

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
            if (cardRef.current && !cardRef.current.contains(e.target)) {
                if (isSelecting) handleUndo();
                if (isEditing) setIsEditing(false);
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

    const handleStartSelecting = (e) => {
        e.stopPropagation();
        if (localData.stock !== undefined && localData.stock !== null && localData.stock <= 0) {
            toast.warning('Sin stock disponible');
            return;
        }

        window.dispatchEvent(new CustomEvent('product-card-activate', { detail: { id } }));

        const currentQtyInCart = cartItem ? cartItem.quantity : 0;
        initialQtyRef.current = currentQtyInCart;

        if (currentQtyInCart === 0) {
            addToCart({ _id: id, nombre: localData.name, precio: localData.price, imagen: localData.image, stock: localData.stock });
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
        setLocalData({ ...localData, ...updatedData });
        setIsEditing(false);
    };

    const handleToggleActive = (updatedData) => {
        setLocalData({ ...localData, active: updatedData.active });
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

    // ── SHOW/HIDE: Editing mode (replaces 3D flip) ──
    if (isEditing) {
        return (
            <article ref={cardRef} className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="card-body p-3">
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
            </article>
        );
    }

    // ── CREATE card ──
    if (isCreate) {
        return (
            <article ref={cardRef} className="card border-0 shadow-sm rounded-3 overflow-hidden" role="button" onClick={handleStartEditing}>
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
        );
    }

    // ── NORMAL card (front) ──
    const isInactive = localData.active === false;

    return (
        <article ref={cardRef} className={`card border-0 shadow-sm rounded-3 overflow-hidden h-100 ${isInactive && !isAdmin ? 'opacity-50' : ''}`}>
            <div onClick={isAdmin ? handleStartEditing : undefined} role={isAdmin ? 'button' : undefined} className="d-flex flex-column h-100" style={{ pointerEvents: (isInactive && !isAdmin) ? 'none' : 'auto' }}>
                {/* Image container */}
                <div className="position-relative bg-body-secondary overflow-hidden" style={{ height: '220px' }}>
                    {isAdmin ? (
                        <div className="position-absolute top-0 start-0 m-2 z-1 d-flex gap-1">
                            <span className="badge bg-dark bg-opacity-75 small fw-medium">Clic para editar</span>
                            {isInactive && <span className="badge bg-danger bg-opacity-75 small fw-medium">INACTIVO</span>}
                        </div>
                    ) : (
                        localData.badge && <span className="badge bg-danger position-absolute top-0 start-0 m-2 z-1 small">{localData.badge}</span>
                    )}
                    <img
                        src={localData.image || `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(localData.name || 'Producto')}`}
                        alt={localData.name}
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(localData.name || 'Producto')}`;
                        }}
                    />
                </div>

                {/* Info */}
                <div className="card-body p-3 d-flex flex-column">
                    <p className="text-muted small text-uppercase mb-1" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>{localData.category}</p>
                    <h3 className="fs-6 fw-medium mb-1">{localData.name}</h3>
                    <span className="fw-medium mb-2">${localData.price}</span>

                    {isAdmin ? (
                        /* Admin stock control */
                        !isAdminSelectingStock ? (
                            <button
                                type="button"
                                className="btn btn-outline-dark btn-sm w-100 mt-auto rounded-3 fw-medium"
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
                        !isSelecting ? (
                            <button
                                type="button"
                                className={`btn ${isInactive ? 'btn-secondary' : 'btn-dark'} btn-sm w-100 mt-auto rounded-3`}
                                onClick={isInactive ? undefined : handleStartSelecting}
                                disabled={isInactive}
                            >
                                {isInactive ? 'No disponible' : 'Agregar al Carrito'}
                            </button>
                        ) : (
                            /* Quantity control bar */
                            <div className="btn-group w-100 mt-auto" onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    className="btn btn-dark btn-sm"
                                    onClick={(e) => { e.stopPropagation(); handleUndo(); }}
                                    title="Deshacer"
                                    aria-label="Deshacer"
                                >
                                    <FiRotateCcw size={14} />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-dark btn-sm"
                                    onClick={handleDecrease}
                                    disabled={quantity <= 1}
                                    aria-label="Disminuir cantidad"
                                >
                                    <FiMinus size={14} />
                                </button>
                                <span className="btn btn-dark btn-sm disabled fw-bold">{quantity}</span>
                                <button
                                    type="button"
                                    className="btn btn-dark btn-sm"
                                    onClick={handleIncrease}
                                    aria-label="Aumentar cantidad"
                                >
                                    <FiPlus size={14} />
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success btn-sm"
                                    onClick={handleConfirm}
                                    aria-label="Confirmar"
                                >
                                    <FiCheck size={16} />
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </article>
    );
}

export default ProductCard;
