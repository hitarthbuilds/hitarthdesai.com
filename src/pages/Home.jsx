import { Head } from 'vite-react-ssg';
import { PipelineRail } from '../components/PipelineRail';
import { Hero } from '../components/Hero';
import { Extract } from '../components/Extract';
import { Structure } from '../components/Structure';
import { Stack } from '../components/Stack';
import { Experience } from '../components/Experience';
import { Faq } from '../components/Faq';
import { Writing } from '../components/Writing';
import { Signal } from '../components/Signal';
import { Ship } from '../components/Ship';

// Homepage. Per-page <head> lives here (prerendered into the static HTML) so it
// no longer needs to be hardcoded in index.html. The Person JSON-LD stays global
// in index.html; the FAQPage JSON-LD is emitted by <Faq />.
export default function Home() {
  return (
    <>
      <Head>
        <title>Hitarth Desai AI Engineer | MLOps & LLM Pipelines</title>
        <meta
          name="description"
          content="Hitarth Desai, also known as hitarthbuilds on GitHub, is an AI Engineer building LLM data extraction pipelines, structured outputs, and MLOps infrastructure at InfraDock AI. Open-source author of confident-extract and 2× GDSC AI/ML Lead."
        />
        <link rel="canonical" href="https://hitarthdesai.com/" />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content="Hitarth Desai AI Engineer" />
        <meta property="og:description" content="LLM data extraction pipelines, structured outputs, MLOps infrastructure, and open-source tooling." />
        <meta property="og:url" content="https://hitarthdesai.com/" />
        <meta property="og:image" content="https://hitarthdesai.com/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@hitarthbuilds" />
      </Head>

      <PipelineRail />
      <main className="content">
        <Hero />
        <Extract />
        <Structure />
        <Stack />
        <Experience />
        <Faq />
        <Writing />
        <Signal />
        <Ship />
      </main>
    </>
  );
}
