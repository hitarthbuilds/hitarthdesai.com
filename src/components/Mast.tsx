"use client";

import { useEffect, useRef, useState } from "react";
import { scrollToTarget } from "./Motion";
import { Clock } from "./Clock";

const LINKS = [
  { hash: "#home", label: "Home", image: "/media/portraits/stairwell.webp" },
  { hash: "#work", label: "Selected work", image: "/work/live/seerflow.webp" },
  { hash: "#practice", label: "Practice", image: "/media/split/embossed-h.webp" },
  { hash: "#writing", label: "Field notes", image: "/media/lower/dead-letter.webp" },
  { hash: "#personal", label: "After hours", image: "/media/portraits/lifting-chalk.webp" },
  { hash: "#contact", label: "Contact", image: "/media/portraits/soundcheck.webp" },
];

function Roll({ children }: { children: string }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

/**
 * Fixed header with the HD badge, contact pill and a full-screen menu in a native dialog.
 * The menu marks the section in view, previews a photograph per link and staggers in.
 */
export function Mast() {
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<Element | null>(null);
  const navigating = useRef(false);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(0);
  const [current, setCurrent] = useState("#home");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onClose = () => {
      setOpen(false);
      document.body.classList.remove("menu-open");
      window.__lenis?.start();
      if (!navigating.current && previousFocus.current instanceof HTMLElement && previousFocus.current.isConnected) {
        previousFocus.current.focus({ preventScroll: true });
      }
    };
    d.addEventListener("close", onClose);

    // Track the section in view for the menu's "you are here" mark.
    const sections = LINKS.map((l) => document.querySelector<HTMLElement>(l.hash)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(`#${e.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));

    // Tuck the header away while reading downwards; bring it back on any upward scroll.
    let last = scrollY;
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const y = scrollY;
        const entrance = document.querySelector<HTMLElement>(".entrance");
        const pinned = entrance ? y < entrance.offsetHeight - innerHeight : false;
        if (Math.abs(y - last) > 6) setHidden(!pinned && y > last && y > 200);
        last = y;
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      d.removeEventListener("close", onClose);
      io.disconnect();
      removeEventListener("scroll", onScroll);
    };
  }, []);

  const openMenu = () => {
    const d = dialog.current;
    if (!d || typeof d.showModal !== "function") {
      document.getElementById("paths")?.scrollIntoView();
      return;
    }
    previousFocus.current = document.activeElement;
    setPreview(Math.max(0, LINKS.findIndex((l) => l.hash === current)));
    d.showModal();
    window.__lenis?.stop();
    document.body.classList.add("menu-open");
    setOpen(true);
    d.querySelector<HTMLButtonElement>(".menu-close")?.focus();
  };

  const go = (event: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    const target = document.querySelector<HTMLElement>(hash);
    if (!target) return;
    event.preventDefault();
    navigating.current = true;
    dialog.current?.close();
    history.pushState(null, "", hash);
    scrollToTarget(target, true);
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      navigating.current = false;
      window.dispatchEvent(new Event("scroll"));
    });
  };

  return (
    <>
      <a className="skip-main" href="#work">
        Skip to selected work
      </a>
      <header className={`mast${hidden && !open ? " mast--away" : ""}`} aria-label="Portfolio navigation">
        <a className="brand" href="#home" aria-label="Hitarth Desai, home">
          <img src="/media/maker-mark.svg" width={57} height={42} alt="" />
        </a>
        <div className="mast-actions">
          <a className="contact-pill" href="#contact">
            <Roll>Get in touch</Roll>
          </a>
          <button className="menu-button" type="button" aria-controls="site-menu" aria-expanded={open} aria-haspopup="dialog" onClick={openMenu}>
            <Roll>Menu</Roll>
            <i aria-hidden="true" />
          </button>
        </div>
        <noscript>
          <nav className="basic-nav">
            <a href="#work">Work</a>
            <a href="#writing">Writing</a>
            <a href="#personal">Personal</a>
          </nav>
        </noscript>
      </header>
      <dialog id="site-menu" ref={dialog} aria-labelledby="menu-name" data-lenis-prevent="">
        <div className="menu-head">
          <strong id="menu-name">Navigation</strong>
          <button type="button" className="menu-close" onClick={() => dialog.current?.close()}>
            <Roll>Close</Roll> <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="menu-main">
          <nav aria-label="Main menu">
            {LINKS.map((l, i) => (
              <a
                key={l.hash}
                href={l.hash}
                style={{ "--i": i } as React.CSSProperties}
                aria-current={current === l.hash ? "location" : undefined}
                onPointerEnter={() => setPreview(i)}
                onFocus={() => setPreview(i)}
                onClick={(e) => go(e, l.hash)}
              >
                <span className="menu-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="menu-label">{l.label}</span>
              </a>
            ))}
          </nav>
          <div className="menu-image">
            {LINKS.map((l, i) => (
              <img key={l.hash} src={l.image} alt="" width={1024} height={1280} className={i === preview ? "is-active" : undefined} loading="lazy" decoding="async" />
            ))}
          </div>
        </div>
        <div className="menu-foot">
          <span>
            Surat, India · <Clock />
          </span>
          <span className="menu-social">
            <a href="https://www.linkedin.com/in/hitarth-desai10/">LinkedIn</a>
            <a href="https://github.com/hitarthbuilds">GitHub</a>
            <a href="https://x.com/hitarthbuilds">X</a>
          </span>
        </div>
      </dialog>
    </>
  );
}
