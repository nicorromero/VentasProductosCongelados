import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Catalogo from './pages/Catalogo';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Login from './pages/Login';

import Users from './pages/Users';
import MyProfile from './pages/MyProfile';
import EditUser from './pages/EditUser';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Ventas from './pages/Ventas';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import InactiveUsers from './pages/InactiveUsers';
import InactiveProducts from './pages/InactiveProducts';

function App() {
  const location = useLocation();
  const rutasFijasExactas = [
    '/admin-login',
    '/contacto',
    '/mi-perfil',
    '/forgot-password',
  ];
  const esLayoutFijo = rutasFijasExactas.includes(location.pathname);

  return (
    <div className={`d-flex flex-column ${esLayoutFijo ? 'vh-100 overflow-hidden' : 'min-vh-100'}`}>
      <NavBar />
      <main className={`flex-grow-1 ${esLayoutFijo ? 'overflow-auto' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/catalogo/:categoria" element={<Catalogo />} />
          <Route path="/productos" element={<Catalogo />} />
          <Route path="/admin-login" element={<Login />} />

          {/* <Route path="/usuarios" element={<Users />} /> */}
          <Route path="/mi-perfil" element={<MyProfile />} />
          {/* <Route path="/usuarios/editar/:id" element={<EditUser />} /> */}
          <Route path="/carrito" element={<Cart />} />
          <Route path="/pedidos" element={<Orders />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          {/* <Route path="/usuarios/inactivos" element={<InactiveUsers />} /> */}
          <Route path="/productos/inactivos" element={<InactiveProducts />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App
