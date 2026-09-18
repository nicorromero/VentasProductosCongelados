import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Form from '../components/Form';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function FormProduct() {
    const navigate = useNavigate();
    
    //FALTABA ESTA LÍNEA: Buscar el dato en el disco duro
    const userString = localStorage.getItem('user'); 
    const user = userString ? JSON.parse(userString) : null;

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/'); 
        }
    }, [navigate, user]);
    
    const [product, setProduct] = useState({
        name: '', details: '', price: '', image: '',
        badge: '', stock: '', category: '', active: true
    });
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 2. FALTABA ESTO: Agarrar el token sellado
            const token = localStorage.getItem('token');

            // 3. FALTABA ESTO: Mandar el pasaporte (headers) a Axios
            await axios.post(
                `${API_URL}/products`, 
                product,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setProduct({
                name: '', details: '', price: '', image: '',
                badge: '', stock: '', category: '', active: true
            });
            toast.success('Producto guardado correctamente');
            setMensaje('Producto guardado correctamente');
            setError('');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Error al guardar el producto');
            setError('Error al guardar el producto');
            setMensaje('');
        }
    };

    return (
        <main>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 2rem' }}>
                <button className="app-btn" onClick={() => navigate('/productos/inactivos')}>
                    Ver productos dados de baja
                </button>
            </div>
            <Form title="Nuevo producto" onSubmit={handleSubmit} submitText="Crear" message={mensaje} error={error}>
                <input type="text" placeholder="Nombre" value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})} />
                <input type="number" placeholder="Precio" value={product.price} onChange={(e) => setProduct({...product, price: e.target.value})} />
                <input type="text" placeholder="Descripción" value={product.details} onChange={(e) => setProduct({...product, details: e.target.value})} />
                <input type="text" placeholder="Badge" value={product.badge} onChange={(e) => setProduct({...product, badge: e.target.value})} />
                <input type="text" placeholder="Categoría" value={product.category} onChange={(e) => setProduct({...product, category: e.target.value})} />
                <input type="number" placeholder="Stock" value={product.stock} onChange={(e) => setProduct({...product, stock: e.target.value})} />
                <input type="text" placeholder="Imagen (URL)" value={product.image} onChange={(e) => setProduct({...product, image: e.target.value})} />
                <label>
                    Activo
                    <input type="checkbox" checked={product.active} onChange={(e) => setProduct({...product, active: e.target.checked})} />
                </label>
            </Form>
        </main>
    );
}

export default FormProduct;