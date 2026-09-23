import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiPlus, FiEyeOff, FiEye, FiTrash2 } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function InlineProductEdit({ id, initialData, onCancel, onSuccess, isCreate, onToggleActive, onDeleteProduct }) {
    const [form, setForm] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        axios.get(`${API_URL}/categories`)
            .then(res => setCategories(res.data))
            .catch(() => {});
    }, []);

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
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al crear categoría');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        try {
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                formData
            );
            setForm({ ...form, image: res.data.secure_url });
            toast.success('Imagen subida correctamente');
        } catch (err) {
            console.error(err);
            toast.error('Error al subir la imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (isCreate) {
                const { data } = await axios.post(`${API_URL}/products`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Producto creado');
                onSuccess(data);
                setForm(initialData);
            } else {
                await axios.put(`${API_URL}/products/${id}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Producto actualizado');
                onSuccess(form);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.patch(`${API_URL}/products/${id}/toggle-active`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(data.active ? 'Producto activado' : 'Producto desactivado');
            if (onToggleActive) onToggleActive(data);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al cambiar estado');
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
        <form className="d-flex flex-column gap-2" onSubmit={handleSave} onClick={(e) => e.stopPropagation()}>
            <h4 className="fs-6 fw-bold text-center mb-1">{isCreate ? 'Crear producto' : 'Editar producto'}</h4>

            <input required className="form-control form-control-sm" type="text" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required className="form-control form-control-sm" type="number" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input className="form-control form-control-sm" type="text" placeholder="Descripción" value={form.details || ''} onChange={(e) => setForm({ ...form, details: e.target.value })} />
            
            {/* Categoría: dropdown + nueva categoría */}
            {!creatingCategory ? (
                <select
                    required
                    className="form-select form-select-sm"
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
                        className="form-control form-control-sm"
                        type="text"
                        placeholder="Nombre de la categoría"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        autoFocus
                    />
                    <button type="button" className="btn btn-success btn-sm px-2" onClick={handleCreateCategory} title="Crear">
                        <FiCheck size={14} />
                    </button>
                    <button type="button" className="btn btn-outline-secondary btn-sm px-2" onClick={() => { setCreatingCategory(false); setNewCategoryName(''); }} title="Cancelar">
                        <FiX size={14} />
                    </button>
                </div>
            )}

            <input required className="form-control form-control-sm" type="number" placeholder="Stock" value={form.stock || 0} onChange={(e) => setForm({ ...form, stock: e.target.value })} />

            <div>
                <label className="form-label small text-muted mb-1">Imagen del Producto</label>
                <input className="form-control form-control-sm" type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading || loading} />
                {isUploading && <span className="text-muted small">Subiendo...</span>}
                {form.image && !isUploading && (
                    <img src={form.image} alt="Preview" className="rounded mt-1" style={{ maxWidth: '80px' }} />
                )}
            </div>

            <div className="d-flex gap-2 mt-2">
                <button type="button" className="btn btn-outline-secondary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1" onClick={(e) => { e.stopPropagation(); onCancel(); }} disabled={loading}>
                    <FiX size={16} /> Cancelar
                </button>
                <button type="submit" className="btn btn-dark btn-sm flex-fill d-flex align-items-center justify-content-center gap-1" disabled={loading}>
                    <FiCheck size={16} /> Guardar
                </button>
            </div>

            {/* Botones de estado y eliminación (solo al editar, no al crear) */}
            {!isCreate && (
                <div className="d-flex gap-2 mt-1">
                    <button
                        type="button"
                        className={`btn btn-sm flex-fill d-flex align-items-center justify-content-center gap-1 ${initialData.active === false ? 'btn-success' : 'btn-outline-warning'}`}
                        onClick={handleToggleActive}
                        disabled={loading}
                    >
                        {initialData.active === false ? <><FiEye size={14} /> Activar</> : <><FiEyeOff size={14} /> Desactivar</>}
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm d-flex align-items-center justify-content-center gap-1 ${confirmDelete ? 'btn-danger flex-fill' : 'btn-outline-danger'}`}
                        onClick={handleDeleteProduct}
                        onBlur={() => setConfirmDelete(false)}
                        disabled={loading}
                    >
                        <FiTrash2 size={14} />
                        {confirmDelete ? ' ¿Confirmar?' : ' Eliminar'}
                    </button>
                </div>
            )}
        </form>
    );
}

export default InlineProductEdit;
