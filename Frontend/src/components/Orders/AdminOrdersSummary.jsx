import { ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminOrdersSummary({
    porViandaPendientes,
    expandedPendientes,
    setExpandedPendientes
}) {
    return (
        <div className="row g-3 mb-4">
            <div className="col-12">
                <div className="d-flex flex-column rounded-4 border overflow-hidden shadow-sm bg-white" style={{ borderColor: '#dc3545' }}>
                    <div 
                        className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom border-danger border-opacity-25 user-select-none" 
                        style={{ cursor: 'pointer', backgroundColor: 'rgba(220, 53, 69, 0.05)' }}
                        onClick={() => setExpandedPendientes(!expandedPendientes)}
                    >
                        <span className="fw-bold text-uppercase text-danger" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                            Productos que faltan entregar
                        </span>
                        <span className="text-danger">
                            {expandedPendientes ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </span>
                    </div>
                    {expandedPendientes && (
                        <ul className="list-unstyled m-0 overflow-auto px-3 py-2" style={{ maxHeight: '15rem' }}>
                            {Object.entries(porViandaPendientes).length === 0 ? (
                                <li className="text-danger opacity-75 fst-italic py-1" style={{ fontSize: '0.8rem' }}>No hay productos pendientes.</li>
                            ) : (
                                Object.entries(porViandaPendientes).map(([vianda, total]) => (
                                    <li key={vianda} className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                                        <span className="text-dark fw-medium text-truncate me-2" style={{ fontSize: '0.85rem' }}>{vianda}</span>
                                        <span className="badge bg-danger rounded-pill flex-shrink-0" style={{ fontSize: '0.8rem' }}>{total}</span>
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
