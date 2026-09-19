import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

function Footer() {
    return (
        <footer className="bg-dark text-center py-4 mt-auto">
            <div className="d-flex justify-content-center gap-3 mb-2 fs-5">
                <a href="#" className="text-secondary text-decoration-none"><FaInstagram /></a>
                <a href="#" className="text-secondary text-decoration-none"><FaFacebook /></a>
                <a href="#" className="text-secondary text-decoration-none"><FaTwitter /></a>
                <a href="#" className="text-secondary text-decoration-none"><MdEmail /></a>
            </div>
            <p className="text-muted small mb-0">© 2026 Store Shop — Todos los derechos reservados</p>
        </footer>
    );
}

export default Footer;
