import Link from "next/link";

export default function NotFound() {
  return (
    <section className="simple-page not-found-page">
      <span className="eyebrow">Avenoir / 404</span>
      <h1>This page took<br /><em>another turn.</em></h1>
      <p>The page you&apos;re looking for isn&apos;t here.</p>
      <Link className="button button-dark" href="/">Return home</Link>
    </section>
  );
}
