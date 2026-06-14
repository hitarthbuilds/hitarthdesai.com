import { ShaderBackground } from './components/ShaderBackground';
import { StatusBar } from './components/StatusBar';
import { PipelineRail } from './components/PipelineRail';
import { Hero } from './components/Hero';
import { Extract } from './components/Extract';
import { Structure } from './components/Structure';
import { Stack } from './components/Stack';
import { Experience } from './components/Experience';
import { Faq } from './components/Faq';
import { Signal } from './components/Signal';
import { Ship } from './components/Ship';
import { useLenis } from './hooks/useLenis';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

export default function App() {
  const reduced = usePrefersReducedMotion();
  // Lenis smooth scroll, disabled entirely under reduced-motion.
  useLenis(!reduced);

  return (
    <>
      <div className="vignette" aria-hidden="true" />
      <ShaderBackground />
      <StatusBar />
      <PipelineRail />
      <main className="content">
        <Hero />
        <Extract />
        <Structure />
        <Stack />
        <Experience />
        <Faq />
        <Signal />
        <Ship />
      </main>
    </>
  );
}
