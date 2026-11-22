import { Pressure } from "@/components/Pressure";
import { SubHeader } from "@/components/SubHeader";
import "@/styles/case.css";
import "@/styles/blog.css";

export default function NotFound() {
  return (
    <div className="case-body">
      <SubHeader back={{ href: "/", label: "Home" }} />
      <main id="main" className="blog-main">
        <div className="nf">
          <Pressure text="404" className="nf-code pz--fill" />
          <section className="blog-intro" aria-labelledby="nf-title">
            <Pressure tag="h1" id="nf-title" text="Not here." />
            <p data-reveal="up" style={{ "--delay": "200ms" } as React.CSSProperties}>
              That page doesn’t exist. Try <a href="/#work">selected work</a> or the <a href="/blog">field notes</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
