import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiCheck, FiX } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function InlineProductEdit({ id, initialData, onCancel, onSuccess, isCreate }) {
    const [form, setForm] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

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

    return (
        <form className="d-flex flex-column gap-2" onSubmit={handleSave} onClick={(e) => e.stopPropagation()}>
            <h4 className="fs-6 fw-bold text-center mb-1">{isCreate ? 'Crear producto' : 'Editar producto'}</h4>

            <input required className="form-control form-control-sm" type="text" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required className="form-control form-control-sm" type="number" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input className="form-control form-control-sm" type="text" placeholder="Descripción" value={form.details || ''} onChange={(e) => setForm({ ...form, details: e.target.value })} />
            <input required className="form-control form-control-sm" type="text" placeholder="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
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
        </form>
    );
}

export default InlineProductEdit;
