import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { siteConfig } from '../site.config';
import remarkGfm from 'remark-gfm';

export default function Profile() {
    return (
        <section className="profile-section">
            <div className="profile-info">
                <Markdown remarkPlugins={[remarkBreaks, remarkGfm]}>{siteConfig.description}</Markdown>
            </div>
            {siteConfig.image && (
                <div className="profile-image-container">
                    <img src={siteConfig.image} alt="Profile" className="profile-image" />
                </div>
            )}
        </section>
    );
}