"use client";

import { useEffect, useRef } from "react";

const MAGNETIC = "[data-magnetic], .contact-pill, .menu-button, .menu-close, .contact-round, .brand";
const INTERACTIVE = "a, button, summary, [role='tab'], [role='radio'], label, input, textarea";

/**
 * A trailing dot that swells over links and turns into a labelled disc over [data-cursor]
 * targets (covers, cards, notes). Buttons and pills lean toward the pointer. Fine pointers only,
 * and never when reduced motion is preferred; the system cursor always stays available.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = matchMedia("(hover:hover) and (pointer:fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const root = document.documentElement;
    const el = ref.current!;
    const label = el.querySelector<HTMLElement>(".cursor-label")!;
    root.classList.add("has-cursor");

    let x = -100,
      y = -100,
      cx = -100,
      cy = -100,
      frame = 0,
      visible = false;
    let magnet: HTMLElement | null = null;

    const tick = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      el.style.transform = `translate3d(${cx.toFixed(2)}px,${cy.toFixed(2)}px,0)`;
      frame = Math.abs(x - cx) + Math.abs(y - cy) > 0.1 ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const release = () => {
      if (!magnet) return;
      magnet.style.translate = "";
      magnet.classList.remove("is-magnet");
      magnet = null;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        cx = x;
        cy = y;
        el.classList.add("is-visible");
      }
      wake();
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const dx = x - (r.left + r.width / 2);
        const dy = y - (r.top + r.height / 2);
        magnet.style.translate = `${(dx * 0.28).toFixed(1)}px ${(dy * 0.34).toFixed(1)}px`;
      }
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest) return;
      const labelled = target.closest<HTMLElement>("[data-cursor]");
      const text = labelled?.dataset.cursor ?? "";
      if (label.textContent !== text) label.textContent = text;
      el.classList.toggle("is-label", !!labelled);
      el.classList.toggle("is-link", !labelled && !!target.closest(INTERACTIVE));
      el.classList.toggle("is-dark", !!target.closest(".sc-index, .lower-notes, .finale, .field.is-light, .case-body"));
      const next = target.closest<HTMLElement>(MAGNETIC);
      if (next !== magnet) {
        release();
        if (next) {
          magnet = next;
          magnet.classList.add("is-magnet");
        }
      }
    };

    const onLeave = () => {
      visible = false;
      el.classList.remove("is-visible");
      release();
    };
    const onDown = () => el.classList.add("is-down");
    const onUp = () => el.classList.remove("is-down");

    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerover", onOver, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      release();
      root.classList.remove("has-cursor");
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerover", onOver);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <span className="cursor-disc">
        <span className="cursor-label" />
      </span>
    </div>
  );
}
