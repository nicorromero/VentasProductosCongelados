import { useState } from 'react';
import axios from 'axios';
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
    <section className="container py-4">
      <div className="row g-4 justify-content-center">

        {/* Contact Info */}
        <div className="col-12 col-md-5">
          <h2 className="fs-4 fw-semibold mb-4">Contactanos</h2>

          <div className="card bg-body-secondary border-0 rounded-3 p-3 mb-3">
            <span className="fw-medium small">contacto@storeshop.com</span>
            <small className="text-muted">Email</small>
          </div>

          <div className="card bg-body-secondary border-0 rounded-3 p-3 mb-3">
            <span className="fw-medium small">Concepción del Uruguay</span>
            <small className="text-muted">Ubicación</small>
          </div>

          <div className="card bg-body-secondary border-0 rounded-3 p-3 mb-3">
            <span className="fw-medium small">@storeshop</span>
            <small className="text-muted">Instagram</small>
          </div>
        </div>

        {/* Contact Form */}
        <div className="col-12 col-md-7" style={{ maxWidth: '500px' }}>
          <Form
            title="Enviar mensaje"
            onSubmit={handleSubmit}
            submitText={sending ? 'Enviando...' : 'Enviar'}
            submitDisabled={sending}
            message={status}
            error={error}
          >
            <input
              className="form-control rounded-3 py-2"
              type="text"
              placeholder="Nombre"
              value={contactData.name}
              onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
            />
            <input
              className="form-control rounded-3 py-2"
              type="email"
              placeholder="Email"
              value={contactData.email}
              onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
            />
            <textarea
              className="form-control rounded-3 py-2"
              placeholder="Mensaje..."
              rows="5"
              value={contactData.message}
              onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
            />
          </Form>
        </div>

      </div>
    </section>
  );
}

export default Contact;
