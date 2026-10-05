import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton({ celular, isOpen = false, size = 'sm', className = '' }) {
    const [isHovered, setIsHovered] = useState(false);

    if (!celular) return null;

    const wsNumber = celular.replace(/[^0-9]/g, '');

    if (!wsNumber) {
        return (
            <span className="text-muted flex-shrink-0" style={{ fontSize: size === 'sm' ? '0.82rem' : '0.88rem' }}>
                {celular}
            </span>
        );
    }

    const showNotice = isHovered || isOpen;

    return (
        <a
            href={`https://wa.me/${wsNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`d-inline-flex align-items-center gap-1 px-2 py-0.5 rounded-pill text-decoration-none border shadow-none flex-shrink-0 ${className}`}
            style={{
                fontSize: size === 'sm' ? '0.8rem' : '0.85rem',
                backgroundColor: isHovered ? '#d1e7dd' : 'rgba(25, 135, 84, 0.08)',
                borderColor: isHovered ? '#198754' : 'rgba(25, 135, 84, 0.28)',
                color: '#0f5132',
                cursor: 'pointer',
                transition: 'all 0.18s ease-in-out',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => e.stopPropagation()}
            title="Enviar WhatsApp"
        >
            <MessageCircle size={size === 'sm' ? 13 : 15} className="text-success flex-shrink-0" />
            <span className="fw-medium text-dark">{celular}</span>
            {showNotice && (
                <span
                    className="badge bg-success text-white fw-normal rounded-pill ms-1 d-inline-flex align-items-center"
                    style={{
                        fontSize: '0.68rem',
                        padding: '0.18rem 0.45rem',
                        lineHeight: 1.2,
                        animation: 'fadeIn 0.15s ease-in',
                    }}
                >
                    Enviar WhatsApp
                </span>
            )}
        </a>
    );
}
