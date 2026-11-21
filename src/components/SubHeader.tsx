/** The slim header used on case studies, the blog and 404: HD badge home, one return link. */
export function SubHeader({ back }: { back: { href: string; label: string } }) {
  return (
    <>
      <a className="case-skip" href="#main">
        Skip to content
      </a>
      <header className="case-header">
        <a className="case-mark" href="/" aria-label="Hitarth Desai, home" data-magnetic="">
          <img src="/media/maker-mark.svg" width={44} height={32} alt="" />
        </a>
        <a className="case-return" href={back.href} data-magnetic="">
          ← {back.label}
        </a>
      </header>
    </>
  );
}
