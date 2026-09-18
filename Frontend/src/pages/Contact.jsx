import { useState } from 'react';
import axios from 'axios';
import '../assets/css/Contact.css';
import Form from '../components/Form';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Contact() {
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');
    setSending(true);
    try {
      await axios.post(`${API_URL}/api/contact`, contactData);
      setStatus('¡Mensaje enviado! Nos comunicaremos contigo pronto.');
      setContactData({ name: '', email: '', message: '' });
    } catch (err) {
      setError('No se pudo enviar el mensaje. Intentá nuevamente más tarde.');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">

        <div className="contact-info">
          <h2 className="page-heading">Contactanos</h2>
          <div className="contact-item">
            <div className="contact-text">
              <span>contacto@storeshop.com</span>
              <small>Email</small>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-text">
              <span>Concepción del Uruguay</span>
              <small>Ubicación</small>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-text">
              <span>@storeshop</span>
              <small>Instagram</small>
            </div>
          </div>
        </div>

        <Form
          title="Enviar mensaje"
          onSubmit={handleSubmit}
          submitText={sending ? 'Enviando...' : 'Enviar'}
          submitDisabled={sending}
          message={status}
          error={error}
        >
          <input
            type="text"
            placeholder="Nombre"
            value={contactData.name}
            onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={contactData.email}
            onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
          />
          <textarea
            placeholder="Mensaje..."
            value={contactData.message}
            onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
          />
        </Form>

      </div>
    </div>
  );
}

export default Contact;
