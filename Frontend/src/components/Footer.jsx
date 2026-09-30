import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

function Footer() {
    return (
        <footer className="bg-dark text-center py-4 mt-auto" style={{ borderTop: '3px solid #dc3545' }}>
            <div className="d-flex justify-content-center gap-4 mb-3 fs-5">
                <a href="#" className="text-secondary text-decoration-none" style={{ transition: 'opacity 0.2s' }} aria-label="Instagram"><FaInstagram /></a>
                <a href="#" className="text-secondary text-decoration-none" style={{ transition: 'opacity 0.2s' }} aria-label="Facebook"><FaFacebook /></a>
                <a href="#" className="text-secondary text-decoration-none" style={{ transition: 'opacity 0.2s' }} aria-label="Twitter"><FaTwitter /></a>
                <a href="#" className="text-secondary text-decoration-none" style={{ transition: 'opacity 0.2s' }} aria-label="Email"><MdEmail /></a>
            </div>
            <p className="text-muted small mb-0">© {new Date().getFullYear()} KE · PERNIL — Todos los derechos reservados</p>
        </footer>
    );
}

export default Footer;
