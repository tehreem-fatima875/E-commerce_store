export default function Loading() {
  return (
    <div aria-label="Loading page" className="loading-page" role="status">
      <span className="eyebrow">Avenoir</span>
      <div className="loading-line" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
