import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import * as ReactHelmetAsync from 'react-helmet-async'
import App from './App'
export { siteConfig } from './site.config'

const { HelmetProvider } = (ReactHelmetAsync as any).default || ReactHelmetAsync;

export function render(url: string) {
    const helmetContext: any = {};
    const html = renderToString(
        <StrictMode>
            <HelmetProvider context={helmetContext}>
                <StaticRouter location={url}>
                    <App />
                </StaticRouter>
            </HelmetProvider>
        </StrictMode>
    );

    return { html, helmet: helmetContext.helmet };
}
