import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../assets/css/EditProduct.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function getRole() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1])).role;
    } catch { return null; }
}

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', price: '', details: '', category: '', stock: '', image: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (getRole() !== 'admin') { navigate('/'); return; }
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/products/${id}`);
                setForm({
                    name: data.name || '',
                    price: data.price || '',
                    details: data.details || '',
                    category: data.category || '',
                    stock: data.stock || '',
                    image: data.image || ''
                });
            } catch {
                toast.error('Error al cargar el producto');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/products/${id}`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Producto actualizado');
            navigate('/catalogo/hombres');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al actualizar');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Dar de baja este producto?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Producto dado de baja');
            navigate('/catalogo/hombres');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al dar de baja');
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="editproduct-page">
            <div className="editproduct-card">
                <h2 className="editproduct-title">Editar producto</h2>
                <form className="editproduct-form" onSubmit={handleSave}>
                    <input className="editproduct-input" type="text" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input className="editproduct-input" type="number" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                    <input className="editproduct-input" type="text" placeholder="Descripción" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
                    <input className="editproduct-input" type="text" placeholder="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                    <input className="editproduct-input" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                    <input className="editproduct-input" type="text" placeholder="Imagen (URL o ruta)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                    <button className="editproduct-btn" type="submit">Guardar cambios</button>
                    <button className="editproduct-btn-delete" type="button" onClick={handleDelete}>Dar de baja</button>
                    <button className="editproduct-btn-cancel" type="button" onClick={() => navigate(-1)}>Cancelar</button>
                </form>
            </div>
        </div>
    );
}

export default EditProduct;
