import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiPlus, FiEyeOff, FiEye, FiTrash2, FiStar, FiImage, FiChevronLeft } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function normalizeImages(data) {
    if (Array.isArray(data?.images) && data.images.length > 0) {
        return data.images.slice(0, 5);
    }
    if (data?.image) {
        return [data.image];
    }
    return [];
}

function InlineProductEdit({ id, initialData, onCancel, onSuccess, isCreate, onToggleActive, onDeleteProduct }) {
    const [form, setForm] = useState(() => {
        const imgs = normalizeImages(initialData);
        return {
            ...initialData,
            active: initialData?.active !== false,
            images: imgs,
            image: imgs[0] || initialData?.image || ''
        };
    });
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [showPhotoManager, setShowPhotoManager] = useState(false);

    useEffect(() => {
        axios.get(`${API_URL}/categories`)
            .then(res => setCategories(res.data))
            .catch(() => {});
    }, []);

    useEffect(() => {
        const imgs = normalizeImages(initialData);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm({
            ...initialData,
            active: initialData?.active !== false,
            images: imgs,
            image: imgs[0] || initialData?.image || ''
        });
    }, [initialData]);

    const handleCategorySelect = (e) => {
        const value = e.target.value;
        if (value === '__new__') {
            setCreatingCategory(true);
        } else {
            setForm({ ...form, category: value });
            setCreatingCategory(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API_URL}/categories`, 
                { name: newCategoryName.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
            setForm({ ...form, category: data.name });
            setCreatingCategory(false);
            setNewCategoryName('');
            toast.success('Categoría creada');
            // Notificar a otros componentes que se creó una categoría
            window.dispatchEvent(new CustomEvent('category-created'));
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al crear categoría');
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const currentImages = form.images || [];
        const availableSlots = 5 - currentImages.length;

        if (availableSlots <= 0) {
            toast.warning('Ya has alcanzado el límite máximo de 5 fotos');
            e.target.value = '';
            return;
        }

        let filesToUpload = files;
        if (files.length > availableSlots) {
            toast.info(`Solo se subirán ${availableSlots} foto${availableSlots > 1 ? 's' : ''} más (máximo 5)`);
            filesToUpload = files.slice(0, availableSlots);
        }

        setIsUploading(true);
        const uploadedUrls = [];

        try {
            for (const file of filesToUpload) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

                const res = await axios.post(
                    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    formData
                );
                if (res.data?.secure_url) {
                    uploadedUrls.push(res.data.secure_url);
                }
            }

            setForm(prev => {
                const currentImgs = prev.images || [];
                const newImages = [...currentImgs, ...uploadedUrls].slice(0, 5);
                return {
                    ...prev,
                    images: newImages,
                    image: newImages[0] || ''
                };
            });
            toast.success(uploadedUrls.length > 1 ? `${uploadedUrls.length} fotos subidas correctamente` : 'Foto subida correctamente');
        } catch (err) {
            console.error(err);
            toast.error('Error al subir una o más fotos');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        const updated = (form.images || []).filter((_, i) => i !== indexToRemove);
        setForm(prev => ({
            ...prev,
            images: updated,
            image: updated[0] || ''
        }));
    };

    const handleSetPrimaryImage = (indexToPrimary) => {
        if (indexToPrimary === 0) return;
        const current = [...(form.images || [])];
        const [selected] = current.splice(indexToPrimary, 1);
        current.unshift(selected);
        setForm(prev => ({
            ...prev,
            images: current,
            image: current[0] || ''
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...form,
                active: form.active !== false,
                images: form.images || [],
                image: form.images?.[0] || form.image || ''
            };
            if (isCreate) {
                const { data } = await axios.post(`${API_URL}/products`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Producto creado');
                onSuccess(data);
                const defaultImgs = normalizeImages(initialData);
                setForm({
                    ...initialData,
                    active: initialData?.active !== false,
                    images: defaultImgs,
                    image: defaultImgs[0] || ''
                });
            } else {
                const { data } = await axios.put(`${API_URL}/products/${id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Producto actualizado');
                onSuccess(data || payload);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (e) => {
        e.stopPropagation();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.patch(`${API_URL}/products/${id}/toggle-active`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newActive = data.active !== false;
            setForm(prev => ({ ...prev, active: newActive }));
            toast.success(newActive ? 'Producto activado' : 'Producto desactivado');
            if (onToggleActive) onToggleActive(data);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al cambiar estado');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (e) => {
        e.stopPropagation();
        if (!confirmDelete) { setConfirmDelete(true); return; }
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Producto eliminado permanentemente');
            if (onDeleteProduct) onDeleteProduct(id);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al eliminar');
        }
    };

    return (
        <form className="d-flex flex-column gap-1 position-relative h-100" onSubmit={handleSave} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom">
                <h4 className="fs-5 fw-bold mb-0 text-dark">{isCreate ? 'Crear Producto' : 'Editar Producto'}</h4>
                <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={(e) => { e.stopPropagation(); onCancel(); }}
                    disabled={loading}
                />
            </div>

            {/* — Datos del producto — */}
            <div className="row g-2">
                <div className="col-12">
                    <label className="form-label small text-muted mb-1 fw-medium">Nombre</label>
                    <input required className="form-control form-control-sm rounded-3" type="text" placeholder="Nombre del producto" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>

                <div className="col-6">
                    <label className="form-label small text-muted mb-1 fw-medium">Precio ($)</label>
                    <input required className="form-control form-control-sm rounded-3" type="number" placeholder="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>

                <div className="col-6">
                    <label className="form-label small text-muted mb-1 fw-medium">Stock</label>
                    <input required className="form-control form-control-sm rounded-3" type="number" placeholder="0" value={form.stock || 0} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>

                <div className="col-md-6">
                    <label className="form-label small text-muted mb-1 fw-medium">Categoría</label>
                    {!creatingCategory ? (
                        <select
                            required
                            className="form-select form-select-sm rounded-3"
                            value={form.category || ''}
                            onChange={handleCategorySelect}
                        >
                            <option value="" disabled>Seleccionar categoría</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                            <option value="__new__">+ Nueva categoría</option>
                        </select>
                    ) : (
                        <div className="d-flex gap-1">
                            <input
                                className="form-control form-control-sm rounded-3"
                                type="text"
                                placeholder="Nombre de categoría"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                autoFocus
                            />
                            <button type="button" className="btn btn-success btn-sm px-2 rounded-3" onClick={handleCreateCategory} title="Crear">
                                <FiCheck size={14} />
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm px-2 rounded-3" onClick={() => { setCreatingCategory(false); setNewCategoryName(''); }} title="Cancelar">
                                <FiX size={14} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="col-md-6">
                    <label className="form-label small text-muted mb-1 fw-medium">Insignia (opcional)</label>
                    <input className="form-control form-control-sm rounded-3" type="text" placeholder="Ej: OFERTA, NUEVO" value={form.badge || ''} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
                </div>
            </div>

            {/* — Botón para ir a vista de fotos — */}
            <div className="mt-1">
                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm w-100 rounded-3 d-flex justify-content-between align-items-center"
                    onClick={() => setShowPhotoManager(true)}
                    disabled={loading}
                >
                    <span className="fw-medium">Fotos del producto ({form.images?.length || 0}/5)</span>
                    <FiImage />
                </button>
            </div>

            {/* — Acciones — */}
            <div className="d-flex flex-column gap-1 mt-auto pt-2 border-top">
                {/* Botones Cancelar y Guardar (achicados para dar espacio a Desactivar y Eliminar) */}
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm py-1 flex-fill rounded-3 fw-medium d-flex align-items-center justify-content-center gap-1"
                        onClick={(e) => { e.stopPropagation(); onCancel(); }}
                        disabled={loading}
                    >
                        <FiX size={14} /> Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn btn-dark btn-sm py-1 flex-fill rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-1 shadow-sm"
                        disabled={loading}
                    >
                        <FiCheck size={14} /> Guardar
                    </button>
                </div>

                {/* Botones Activar / Desactivar y Eliminar */}
                {!isCreate && (
                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className={`btn btn-sm py-1 flex-fill rounded-3 d-flex align-items-center justify-content-center gap-1 ${form.active === false ? 'btn-success' : 'btn-outline-warning'}`}
                            onClick={handleToggleActive}
                            disabled={loading}
                        >
                            {form.active === false ? <><FiEye size={13} /> Activar</> : <><FiEyeOff size={13} /> Desactivar</>}
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm py-1 flex-fill rounded-3 d-flex align-items-center justify-content-center gap-1 ${confirmDelete ? 'btn-danger fw-semibold' : 'btn-outline-danger'}`}
                            onClick={handleDeleteProduct}
                            onBlur={() => setConfirmDelete(false)}
                            disabled={loading}
                        >
                            <FiTrash2 size={13} />
                            {confirmDelete ? '¿Confirmar?' : 'Eliminar'}
                        </button>
                    </div>
                )}
            </div>

            {/* — Sub-vista Gestor de Fotos — */}
            {showPhotoManager && (
                <div 
                    className="position-absolute top-0 start-0 w-100 h-100 z-3 p-2 d-flex flex-column justify-content-center"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(3px)' }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowPhotoManager(false);
                    }}
                >
                    <div 
                        className="bg-white border shadow-sm rounded-3 p-2 position-relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
                            <h5 className="fs-6 fw-bold mb-0 text-dark d-flex align-items-center gap-1">
                                <FiImage /> Fotos
                            </h5>
                            <button 
                                type="button" 
                                className="btn-close" 
                                style={{ fontSize: '0.65rem' }}
                                onClick={() => setShowPhotoManager(false)}
                                title="Volver"
                            />
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="form-label small text-muted mb-0 fw-semibold">
                                Subidas ({form.images?.length || 0}/5)
                            </label>
                            {form.images?.length > 1 && (
                                <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                                    1ª foto es portada (★)
                                </span>
                            )}
                        </div>

                        {/* Previews de imágenes cargadas */}
                        {Array.isArray(form.images) && form.images.length > 0 && (
                            <div className="d-flex flex-wrap gap-2 my-1">
                                {form.images.map((imgUrl, index) => (
                                    <div
                                        key={index}
                                        className="position-relative border rounded-3 overflow-hidden bg-white shadow-sm"
                                        style={{ width: '45px', height: '45px' }}
                                    >
                                        <img
                                            src={imgUrl}
                                            alt={`Foto ${index + 1}`}
                                            className="w-100 h-100 object-fit-cover"
                                        />

                                        {index === 0 ? (
                                            <span
                                                className="badge bg-primary position-absolute top-0 start-0 m-1 p-0 small d-flex align-items-center justify-content-center"
                                                style={{ width: '14px', height: '14px', fontSize: '0.55rem' }}
                                                title="Foto principal"
                                            >
                                                ★
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn btn-dark btn-sm position-absolute top-0 start-0 m-1 p-0 rounded-circle d-flex align-items-center justify-content-center opacity-75"
                                                style={{ width: '14px', height: '14px' }}
                                                title="Establecer como principal"
                                                onClick={() => handleSetPrimaryImage(index)}
                                            >
                                                <FiStar size={8} />
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-0 rounded-circle d-flex align-items-center justify-content-center opacity-75"
                                            style={{ width: '14px', height: '14px' }}
                                            title="Eliminar foto"
                                            onClick={() => handleRemoveImage(index)}
                                        >
                                            <FiTrash2 size={8} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Input para agregar fotos (máximo 5) */}
                        <div className="mt-2">
                            {(form.images?.length || 0) < 5 ? (
                                <div>
                                    <input
                                        className="form-control form-control-sm rounded-3 bg-white"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        disabled={isUploading || loading}
                                        style={{ fontSize: '0.8rem' }}
                                    />
                                    <div className="text-muted mt-1 d-flex flex-column" style={{ fontSize: '0.7rem' }}>
                                        <span>{isUploading ? 'Subiendo fotos...' : `Puedes seleccionar hasta ${5 - (form.images?.length || 0)} foto(s) más`}</span>
                                        <span className="text-secondary opacity-75 mt-1">Sug: formato 4:3 o 3:4 para mejor encuadre.</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="alert alert-secondary py-1 px-2 mb-0 small text-center rounded-3" style={{ fontSize: '0.75rem' }}>
                                    Límite de 5 fotos alcanzado
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}

export default InlineProductEdit;
