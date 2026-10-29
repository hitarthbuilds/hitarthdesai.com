import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-center px-5 pt-24 sm:px-8 lg:px-12">
      <p className="eyebrow text-forge">Track 404 / Hidden track</p>
      <h1 className="display mt-6 text-[clamp(3.4rem,11vw,11rem)] text-chrome">
        This track was <span className="blackletter molten">never recorded.</span>
      </h1>
      <p className="mt-8 max-w-xl text-[18px] leading-relaxed text-mute">The page you were after isn&apos;t on the record. The rest of the album is.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-forge">
          Back to the A-side
        </Link>
        <Link href="/blog" className="btn btn-steel">
          <span className="btn-fill" />
          Liner notes
        </Link>
      </div>
    </section>
  );
}
