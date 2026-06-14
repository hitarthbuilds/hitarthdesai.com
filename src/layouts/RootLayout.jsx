import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ShaderBackground } from '../components/ShaderBackground';
import { StatusBar } from '../components/StatusBar';
import { useLenis, scrollToTop } from '../hooks/useLenis';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

// Shared chrome across every route: atmosphere (vignette + WebGL shader), the
// status HUD, smooth scroll, and scroll-reset on navigation. Page-specific
// content (incl. the homepage pipeline rail) renders into <Outlet />.
export default function RootLayout() {
  const reduced = usePrefersReducedMotion();
  useLenis(!reduced);

  const { pathname } = useLocation();
  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  return (
    <>
      <div className="vignette" aria-hidden="true" />
      <ShaderBackground />
      <StatusBar />
      <Outlet />
    </>
  );
}
