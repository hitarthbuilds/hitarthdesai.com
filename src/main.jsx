import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';
import './index.css';

// Router-mode static-site generation: every route (/, /blog, /blog/:slug) is
// prerendered to static HTML so content + per-page JSON-LD exist for crawlers and
// no-JS scrapers, then React Router hydrates for client navigation + motion.
export const createRoot = ViteReactSSG({ routes });
