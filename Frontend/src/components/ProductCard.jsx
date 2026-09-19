import { useState, useEffect, useRef, useCallback } from 'react';
import '../assets/css/ProductCard.css';
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
    const [isEditing, setIsEditing] = useState(false);
    const initialQtyRef = useRef(0);

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

    useEffect(() => {
        if (!isSelecting && !isEditing) return;

        const handleClickOutside = (e) => {
            if (cardRef.current && !cardRef.current.contains(e.target)) {
                if (isSelecting) handleUndo();
                if (isEditing) setIsEditing(false);
            }
        };

        const handleOtherCardActivated = (e) => {
            if (e.detail?.id !== id) {
                if (isSelecting) handleUndo();
                if (isEditing) setIsEditing(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('product-card-activate', handleOtherCardActivated);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('product-card-activate', handleOtherCardActivated);
        };
    }, [isSelecting, isEditing, id, handleUndo]);

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

    const handleQuickStockChange = async (e, delta, overrideValue) => {
        if (e) e.stopPropagation();
        
        let newStock;
        if (delta !== undefined) {
            newStock = Number(localData.stock || 0) + delta;
        } else {
            newStock = Number(overrideValue || 0);
        }
        
        if (newStock < 0) newStock = 0;
        
        setLocalData(prev => ({ ...prev, stock: newStock }));

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`, 
                { ...localData, stock: newStock }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Producto actualizado');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al actualizar');
        }
    };

    return (
        <article ref={cardRef} className={`card ${isEditing ? 'is-flipped' : ''}`}>
            <div className="card-inner">
                <div className="card-front">
                    {isCreate ? (
                        <div
                            className="create-card-front"
                            onClick={handleStartEditing}
                            style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                            <div className="imageContainer">
                                <img
                                    src="https://placehold.co/300x300/f8fafc/cbd5e1?text=%2B"
                                    alt="Nuevo Producto"
                                    className="image"
                                    style={{ opacity: 0.7 }}
                                />
                            </div>
                            <div className="info" style={{ opacity: 0.8 }}>
                                <p className="category" style={{ color: '#94a3b8' }}>-</p>
                                <h3 className="name" style={{ color: '#64748b' }}>Nuevo Producto</h3>
                                <div className="priceRow">
                                    <span className="price" style={{ color: '#94a3b8' }}>$0</span>
                                </div>
                                <button
                                    type="button"
                                    className="app-btn app-btn--small"
                                    style={{ backgroundColor: '#f1f5f9', color: '#64748b', borderColor: '#cbd5e1', pointerEvents: 'none' }}
                                >
                                    <FiPlus style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                                    Crear Producto
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div onClick={isAdmin ? handleStartEditing : undefined} style={{ cursor: isAdmin ? 'pointer' : 'default', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div className="imageContainer">
                                {isAdmin ? (
                                    <span className="badge" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', color: 'white', fontWeight: '500', padding: '6px 12px' }}>
                                        Clic para editar
                                    </span>
                                ) : (
                                    localData.badge && <span className="badge">{localData.badge}</span>
                                )}
                                <img
                                    src={localData.image || `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(localData.name || 'Producto')}`}
                                    alt={localData.name}
                                    className="image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(localData.name || 'Producto')}`;
                                    }}
                                />
                            </div>
                            <div className="info">
                                <p className="category">{localData.category}</p>
                                <h3 className="name">{localData.name}</h3>
                                <div className="priceRow">
                                    <span className="price">${localData.price}</span>
                                </div>

                                {isAdmin ? (
                                    <div 
                                        onClick={(e) => e.stopPropagation()} 
                                        style={{ 
                                            marginTop: 'auto', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            background: 'rgba(241, 245, 249, 0.6)', 
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(226, 232, 240, 0.8)',
                                            borderRadius: '12px',
                                            padding: '4px',
                                            color: '#475569'
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={(e) => handleQuickStockChange(e, -1)}
                                            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(226, 232, 240, 0.8)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            title="Disminuir stock"
                                        >
                                            <FiMinus size={16} />
                                        </button>
                                        <input 
                                            type="number" 
                                            value={localData.stock || 0} 
                                            onChange={(e) => setLocalData(prev => ({ ...prev, stock: e.target.value }))}
                                            onBlur={(e) => handleQuickStockChange(e, undefined, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ 
                                                width: '60px', 
                                                textAlign: 'center', 
                                                border: 'none', 
                                                background: 'transparent', 
                                                fontSize: '1.05rem', 
                                                fontWeight: '600',
                                                color: '#334155',
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => handleQuickStockChange(e, 1)}
                                            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(226, 232, 240, 0.8)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            title="Aumentar stock"
                                        >
                                            <FiPlus size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    !isSelecting ? (
                                        <button
                                            type="button"
                                            className="app-btn app-btn--small app-btn--cart"
                                            onClick={handleStartSelecting}
                                        >
                                            Agregar al Carrito
                                        </button>
                                    ) : (
                                        <div className="card-qty-control" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                type="button"
                                                className="qty-control__btn qty-control__btn--undo"
                                                onClick={(e) => { e.stopPropagation(); handleUndo(); }}
                                                title="Deshacer"
                                                aria-label="Deshacer"
                                            >
                                                <FiRotateCcw size={14} />
                                            </button>
                                            <span className="qty-control__divider" />
                                            <div className="qty-control__stepper">
                                                <button
                                                    type="button"
                                                    className="qty-control__btn qty-control__btn--step"
                                                    onClick={handleDecrease}
                                                    disabled={quantity <= 1}
                                                    title="Disminuir cantidad"
                                                    aria-label="Disminuir cantidad"
                                                >
                                                    <FiMinus size={14} />
                                                </button>
                                                <span className="qty-control__value">{quantity}</span>
                                                <button
                                                    type="button"
                                                    className="qty-control__btn qty-control__btn--step"
                                                    onClick={handleIncrease}
                                                    title="Aumentar cantidad"
                                                    aria-label="Aumentar cantidad"
                                                >
                                                    <FiPlus size={14} />
                                                </button>
                                            </div>
                                            <span className="qty-control__divider" />
                                            <button
                                                type="button"
                                                className="qty-control__btn qty-control__btn--confirm"
                                                onClick={handleConfirm}
                                                title="Confirmar"
                                                aria-label="Confirmar"
                                            >
                                                <FiCheck size={16} />
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="card-back">
                    {isEditing && (
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
                        />
                    )}
                </div>
            </div>
        </article>
    );
}

export default ProductCard;

