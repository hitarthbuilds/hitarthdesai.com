import type { Social } from "@/content/profile";

type P = { className?: string };

const paths: Record<Social["id"], React.ReactNode> = {
  github: (
    <path
      fill="currentColor"
      d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
    />
  ),
  huggingface: (
    <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8 14.2c1 1.6 2.3 2.4 4 2.4s3-.8 4-2.4" />
      <circle cx="9" cy="10" r=".9" fill="currentColor" />
      <circle cx="15" cy="10" r=".9" fill="currentColor" />
    </g>
  ),
  linkedin: (
    <path
      fill="currentColor"
      d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-4.98c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.91 1.3-1.91 2.63V21h-4V9.75Z"
    />
  ),
  x: (
    <path
      fill="currentColor"
      d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z"
    />
  ),
  pypi: (
    <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7L12 2.5Z" />
      <path d="M3.5 7 12 11.5 20.5 7M12 11.5v10" />
    </g>
  ),
};

export function SocialIcon({ id, className = "h-[18px] w-[18px]" }: P & { id: Social["id"] }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {paths[id]}
    </svg>
  );
}

/** Anvil silhouette: horn on the left, heel on the right, waisted stand. */
export function Anvil({ className = "" }: P) {
  return (
    <svg viewBox="0 0 32 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M1 6.5c3.6 0 7.4-.2 10-.9V4.5h20v4.2h-3.2c-1.7 0-3 1.2-3 2.8 0 1.2.8 2.2 2 2.6l1.2.4V18h2v2.5H9V18h2v-3.4l1.2-.4c1.2-.4 2-1.4 2-2.6v-.2c-4.5-.6-9.8-2.4-13.2-4.9Z"
      />
    </svg>
  );
}

export function ArrowRight({ className = "h-4 w-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}
