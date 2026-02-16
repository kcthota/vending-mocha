import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { siteConfig } from '../site.config';

export default function Profile() {
    return (
        <section className="profile-section">
            <div className="profile-info">
                <Markdown remarkPlugins={[remarkBreaks]}>{siteConfig.description}</Markdown>
            </div>
            <div className="profile-image-container">
                <img src={siteConfig.image} alt="Profile" className="profile-image" />
            </div>
        </section>
    );
}