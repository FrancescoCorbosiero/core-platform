'use client'

export default function AdminError({
  error,
}: {
  error: Error & { digest?: string; payloadInitError?: boolean }
}) {
  const isDbError =
    error.payloadInitError || error.message?.includes('cannot connect to Postgres')

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          margin: 0,
          backgroundColor: '#111',
          color: '#eee',
        }}
      >
        <div style={{ maxWidth: 600, padding: 40, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>
            {isDbError ? 'Database Connection Error' : 'Something went wrong'}
          </h1>
          {isDbError ? (
            <div style={{ textAlign: 'left', lineHeight: 1.7 }}>
              <p>Could not connect to PostgreSQL. Please check:</p>
              <ol style={{ paddingLeft: 20 }}>
                <li>
                  PostgreSQL is running (run <code>docker compose up -d</code>)
                </li>
                <li>
                  <code>DATABASE_URI</code> is set in your <code>.env</code> file
                </li>
                <li>
                  The connection string matches your database config (see{' '}
                  <code>.env.example</code>)
                </li>
              </ol>
            </div>
          ) : (
            <p>{error.message}</p>
          )}
        </div>
      </body>
    </html>
  )
}
