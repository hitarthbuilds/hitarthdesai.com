import { PROFILE } from "@/content/profile";
import { Clock } from "./Clock";
import { Pressure } from "./Pressure";
import { Words } from "./Words";

const PAGES = [
  { href: "#home", label: "Home" },
  { href: "#work", label: "Selected work" },
  { href: "#writing", label: "Field notes" },
  { href: "#personal", label: "After hours" },
];

const ELSEWHERE = [
  { href: PROFILE.linkedin, label: "LinkedIn" },
  { href: PROFILE.github, label: "GitHub" },
  { href: "https://x.com/hitarthbuilds", label: "X" },
  { href: "https://huggingface.co/hitarthbuilds", label: "Hugging Face" },
  { href: "https://pypi.org/user/hitarth_builds_10/", label: "PyPI" },
];

/**
 * Closing card: the big invitation, the LinkedIn button inside a turning ring of text, page and
 * profile links either side of the portrait, the bottom bar, and the name set across the full width.
 */
export function Contact() {
  return (
    <footer className="finale" id="contact" aria-labelledby="contact-heading">
      <div className="finale-card">
        <div className="finale-top">
          <p className="finale-kicker" data-reveal="up">Get in touch</p>
          <h2 id="contact-heading" data-reveal="words">
            <Words text={"Let’s build\nsomething reliable"} tail={<span className="dot">.</span>} />
          </h2>
          <div className="finale-cta">
            <p className="finale-lede" data-reveal="up">
              For AI systems roles, freelance projects, or a conversation about something I’ve built.
            </p>
            <a className="contact-round" href={PROFILE.linkedin} aria-label="Message Hitarth Desai on LinkedIn" data-reveal="up" data-cursor="Say hi">
              <svg className="contact-ring" viewBox="0 0 100 100" aria-hidden="true">
                <path id="contact-ring-path" d="M50 50m-39 0a39 39 0 1 1 78 0a39 39 0 1 1-78 0" fill="none" />
                <text>
                  <textPath href="#contact-ring-path" textLength="244" lengthAdjust="spacing">
                    Message on LinkedIn · Say hi ·
                  </textPath>
                </text>
              </svg>
              <span className="contact-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        </div>
        <div className="finale-cols">
          <nav aria-label="Pages" className="finale-col">
            <p>Pages</p>
            {PAGES.map((l) => (
              <a key={l.href} href={l.href}>
                <span className="roll">
                  <span>{l.label}</span>
                  <span aria-hidden="true">{l.label}</span>
                </span>
              </a>
            ))}
          </nav>
          <nav aria-label="Elsewhere" className="finale-col finale-col--end">
            <p>Elsewhere</p>
            {ELSEWHERE.map((l) => (
              <a key={l.href} href={l.href}>
                <span className="roll">
                  <span>{l.label}</span>
                  <span aria-hidden="true">{l.label}</span>
                </span>
              </a>
            ))}
          </nav>
        </div>
        <div className="finale-portrait" aria-hidden="true" data-reveal="up">
          <img src="/media/hero-portrait-mobile.webp" width={780} height={780} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="finale-bar">
          <span>© {new Date().getFullYear()} Hitarth Desai</span>
          <span>
            Surat, India · <Clock />
          </span>
          <a href="#home">Back to top ↑</a>
        </div>
        <Pressure text="Hitarth Desai" className="finale-name" />
      </div>
    </footer>
  );
}
