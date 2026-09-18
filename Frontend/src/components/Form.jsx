import '../assets/css/Form.css';

function Form({ title, children, onSubmit, submitText = 'Enviar', message, error, className = '', submitDisabled = false }) {
  return (
    <div className={`form-card ${className}`}>
      {title && (
        <div className="form-title">
          <h1>{title}</h1>
        </div>
      )}

      <form className="form-wrapper" onSubmit={onSubmit}>
        {children}
        <button type="submit" className="app-btn" disabled={submitDisabled}>
          {submitText}
        </button>
        {message && <p className="form-message success">{message}</p>}
        {error && <p className="form-message error">{error}</p>}
      </form>
    </div>
  );
}

export default Form;
