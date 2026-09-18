import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import "../assets/css/Footer.css";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-icons">
                <a href="#"><FaInstagram /></a>
                <a href="#"><FaFacebook /></a>
                <a href="#"><FaTwitter /></a>
                <a href="#"><MdEmail /></a>
            </div>
            <p className="footer-copy">© 2026 Store Shop — Todos los derechos reservados</p>
        </footer>
    );
}

export default Footer;
