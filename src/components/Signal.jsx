import { Section, Reveal } from './Section';
import { signal } from '../data/content';

// 04 / Signal — off the clock. Entity-distinctiveness signal, kept deliberately.
export function Signal() {
  return (
    <Section id="signal" eyebrow={signal.eyebrow}>
      <Reveal as="h2" className="section-heading">
        {signal.heading}
      </Reveal>
      <Reveal as="p" className="lead">
        {signal.body}
      </Reveal>
    </Section>
  );
}
