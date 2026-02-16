import React from 'react';
import { siteConfig } from '../site.config';

const Footer: React.FC = () => {
    return (
        <footer className="container footer-container">
            <p className="footer-text">
                {`© ${new Date().getFullYear()} ${siteConfig.title}. ${siteConfig.footerText}`}
            </p>
        </footer>
    );
};

export default Footer;
