export default function NotFound() {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#111' }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: '#666', marginTop: '1rem' }}>
        Page not found
      </p>
      <a
        href="/"
        style={{
          display: 'inline-block',
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: '#fff',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Go Home
      </a>
    </div>
  )
}
