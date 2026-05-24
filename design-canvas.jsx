/* design-canvas.jsx — layout primitives for design explorations */

function DesignCanvas({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0eee9',
      padding: '48px 40px 80px',
      fontFamily: "'Manrope', system-ui, sans-serif",
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 72,
        maxWidth: 1400,
        margin: '0 auto',
      }}>
        {children}
      </div>
    </div>
  );
}

function DCSection({ id, title, subtitle, children }) {
  return (
    <section id={id}>
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#9b9488',
          marginBottom: 6,
        }}>
          {id}
        </div>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 30,
          color: '#1a1814',
          margin: '0 0 4px',
          lineHeight: 1.2,
        }}>{title}</h2>
        {subtitle && (
          <p style={{
            fontSize: 13,
            color: '#7a7469',
            margin: 0,
          }}>{subtitle}</p>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 24,
        alignItems: 'flex-start',
      }}>
        {children}
      </div>
    </section>
  );
}

function DCArtboard({ id, label, width, height, children }) {
  return (
    <div id={id} style={{ flexShrink: 0 }}>
      <div style={{
        fontFamily: "'Fragment Mono', monospace",
        fontSize: 10,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: '#9b9488',
        marginBottom: 8,
        paddingLeft: 2,
      }}>
        {label}
      </div>
      <div style={{
        width,
        height,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10), 0 12px 40px rgba(0,0,0,0.12)',
        outline: '1px solid rgba(0,0,0,0.07)',
      }}>
        {children}
      </div>
    </div>
  );
}

function DCPostIt({ children }) {
  return (
    <div style={{
      flexShrink: 0,
      width: 260,
      background: '#fdf8e4',
      border: '1px solid #e8e0b8',
      borderRadius: 8,
      padding: '18px 20px',
      fontSize: 13,
      lineHeight: 1.65,
      color: '#4a4535',
      alignSelf: 'flex-start',
      marginTop: 28,
      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        fontFamily: "'Fragment Mono', monospace",
        fontSize: 9,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#b0a87a',
        marginBottom: 10,
      }}>заметка</div>
      {children}
    </div>
  );
}
