function Form({ title, children, onSubmit, submitText = 'Enviar', message, error, className = '', submitDisabled = false }) {
  return (
    <div className={`card border-0 shadow-sm rounded-4 p-4 ${className}`}>
      {title && (
        <h2 className="card-title fs-5 fw-semibold mb-3">{title}</h2>
      )}

      <form className="d-flex flex-column gap-3" onSubmit={onSubmit}>
        {children}
        <button type="submit" className="btn btn-dark w-100 rounded-3 py-2 fw-semibold" disabled={submitDisabled}>
          {submitText}
        </button>
        {message && <div className="alert alert-success py-2 mb-0 small">{message}</div>}
        {error && <div className="alert alert-danger py-2 mb-0 small">{error}</div>}
      </form>
    </div>
  );
}

export default Form;
