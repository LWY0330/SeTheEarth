// SEE EARTH V1 · Phase 2 · alpha-api · Root page
// ------------------------------------------------
// API-first backend — visiting / returns a simple status page that links to /api/health.
// No marketing / no UI design (this is a service, not a product).

export default function HomePage() {
  return (
    <main style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '560px',
      margin: '4rem auto',
      padding: '0 1.5rem',
      color: '#1a1a1a',
    }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        SEE EARTH · alpha-api
      </h1>
      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#555' }}>
        Phase 2 backend service. All API endpoints live under <code>/api/*</code>.
      </p>
      <ul style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>
        <li>
          <a href="/api/health">/api/health</a> — liveness check
        </li>
      </ul>
      <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '2rem' }}>
        This is an internal alpha deployment · not for public use.
      </p>
    </main>
  );
}