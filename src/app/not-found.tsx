import { SubHeader } from "@/components/SubHeader";
import "@/styles/case.css";
import "@/styles/blog.css";

export default function NotFound() {
  return (
    <div className="case-body">
      <SubHeader back={{ href: "/", label: "Home" }} />
      <main id="main" className="blog-main">
        <section className="blog-intro" aria-labelledby="nf-title">
          <h1 id="nf-title">
            Not here<span>.</span>
          </h1>
          <p>
            That page doesn’t exist. Try <a href="/#work">selected work</a> or the <a href="/blog">field notes</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
