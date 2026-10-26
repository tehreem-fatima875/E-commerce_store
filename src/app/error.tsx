"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="simple-page">
      <span className="eyebrow">Avenoir / Something went wrong</span>
      <h1>Let&apos;s try<br /><em>that again.</em></h1>
      <p>We couldn&apos;t load this page just now.</p>
      <button className="button button-dark" onClick={reset}>Try again</button>
    </section>
  );
}
