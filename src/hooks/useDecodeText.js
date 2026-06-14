import { useEffect, useRef, useState } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>{}[]=+*·';

// Resolves `text` from scrambled glyphs into the real string on mount — an
// "extraction / decode" effect that fits the theme. SSR and the no-JS path
// render the FINAL text (initial state = text), so content is never hidden;
// the scramble is a client-only enhancement, skipped under reduced motion.
export function useDecodeText(text, { enabled = true, charsPerFrame = 0.5 } = {}) {
  const [out, setOut] = useState(text);
  const started = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setOut(text);
      return;
    }
    if (started.current) return;
    started.current = true;

    let revealed = 0;
    let raf;
    const tick = () => {
      const r = Math.floor(revealed);
      let s = '';
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === ' ' || c === '\n') s += c;
        else if (i < r) s += c;
        else s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(s);
      revealed += charsPerFrame;
      if (r <= text.length) raf = requestAnimationFrame(tick);
      else setOut(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, enabled, charsPerFrame]);

  return out;
}
