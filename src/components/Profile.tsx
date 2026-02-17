import Markdown from 'react-markdown';
import { getBasePath } from '../utils/basePath';
import remarkBreaks from 'remark-breaks';
import { siteConfig } from '../site.config';
import remarkGfm from 'remark-gfm';
import { Github, Linkedin, Mail } from 'lucide-react';

export default function Profile() {
    return (
        <section className="profile-section">
            <div className="profile-info">
                <Markdown remarkPlugins={[remarkBreaks, remarkGfm]}>{siteConfig.description}</Markdown>
            </div>
            {siteConfig.image && (
                <div className="profile-image-container">
                    <img
                        src={siteConfig.image.startsWith('http') ? siteConfig.image : `${getBasePath()}${siteConfig.image.startsWith('/') ? siteConfig.image.slice(1) : siteConfig.image}`}
                        alt="Profile"
                        className="profile-image"
                    />
                    <div className="social-links">
                        {siteConfig.social?.github && (
                            <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                <Github size={20} />
                            </a>
                        )}
                        {siteConfig.social?.linkedin && (
                            <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                <Linkedin size={20} />
                            </a>
                        )}
                        {siteConfig.social?.email && (
                            <a href={`mailto:${siteConfig.social.email}`} aria-label="Email">
                                <Mail size={20} />
                            </a>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}