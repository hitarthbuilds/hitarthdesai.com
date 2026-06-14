import { Section, Reveal } from './Section';
import { ship, profileLinks } from '../data/content';

// 05 / Ship — contact + footer. rel="me" on every profile link.
export function Ship() {
  return (
    <Section id="ship" eyebrow={ship.eyebrow}>
      <Reveal as="h2" className="section-heading">
        {ship.heading}
      </Reveal>
      <Reveal as="p" className="lead">
        {ship.body}
      </Reveal>
      <Reveal as="nav" className="links" aria-label="Profiles">
        {profileLinks.map((l) => (
          <a key={l.label} rel="me" href={l.href} className="link">
            {l.label}
          </a>
        ))}
      </Reveal>
      <footer className="footer">
        <span>© 2026 Hitarth Desai</span>
        <span className="footer-dot">·</span>
        <span>hitarthdesai.com</span>
      </footer>
    </Section>
  );
}
