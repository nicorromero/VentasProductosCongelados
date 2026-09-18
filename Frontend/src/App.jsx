import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Catalogo from './pages/Catalogo';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import './App.css';
import FormProduct from './pages/FormProduct';
import DetailProduct from './pages/DetailProduct';
import Login from './pages/Login';
import Register from './pages/Register';
import Users from './pages/Users';
import MyProfile from './pages/MyProfile';
import EditProduct from './pages/EditProduct';
import EditUser from './pages/EditUser';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import InactiveUsers from './pages/InactiveUsers';
import InactiveProducts from './pages/InactiveProducts';

function App() {
  const links = [
    { href: "/", text: "Inicio" },
    { href: "/catalogo/hombres", text: "Hombre" },
    { href: "/catalogo/ninos", text: "Niños" },
    { href: "/catalogo/mujer", text: "Mujer" },
    { href: "/contacto", text: "Contacto" },
    { href: "/crear-producto", text: "Crear Producto" },
    { href: "/producto/:id", text: "Detalle Producto" }
  ];
  
  const location = useLocation();
  const rutasFijasExactas = [
    '/',
    '/login',
    '/register',
    '/contacto',
    '/mi-perfil',
    '/forgot-password',
  ];
  const esLayoutFijo = 
    rutasFijasExactas.includes(location.pathname) || 
    location.pathname.startsWith('/producto/');

  return (
    <div className={`app-container ${esLayoutFijo ? 'layout-fijo' : 'layout-normal'}`}>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/catalogo/:categoria" element={<Catalogo />} />
          <Route path="/productos" element={<Catalogo />} />
          <Route path="/crear-producto" element={<FormProduct />} />
          <Route path="/producto/:id" element={<DetailProduct />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/usuarios" element={<Users />} />
          <Route path="/mi-perfil" element={<MyProfile />} />
          <Route path="/productos/editar/:id" element={<EditProduct />} />
          <Route path="/usuarios/editar/:id" element={<EditUser />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/pedidos" element={<Orders />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/usuarios/inactivos" element={<InactiveUsers />} />
          <Route path="/productos/inactivos" element={<InactiveProducts />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App
