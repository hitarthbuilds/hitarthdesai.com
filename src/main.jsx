import { ViteReactSSG } from 'vite-react-ssg/single-page';
import App from './App.jsx';
import './index.css';

// Single-page static-site generation: the body is prerendered to static HTML at
// build time so the bio/projects + JSON-LD exist for crawlers and no-JS scrapers,
// then React hydrates for motion.
export const createRoot = ViteReactSSG(<App />);
