import React from 'react';

const APK_URL = '/app-release.apk';
const APK_VERSION = '1.0.2 (17)';
const APK_SHA256 = 'd999209d2756494fe87e9b5357a55617077d6e73ae22209e9b2c0c83e4b775b6';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: 'clamp(32px, 6vw, 60px) clamp(20px, 5vw, 40px)',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: 'clamp(300px, 50vw, 600px)',
        height: 'clamp(300px, 50vw, 600px)',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: 'clamp(250px, 40vw, 500px)',
        height: 'clamp(250px, 40vw, 500px)',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div style={{
        textAlign: 'center',
        maxWidth: '640px',
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        <img
          src="/mxcrypto-logo.png"
          alt="MxCrypto logo"
          style={{
            width: 'clamp(88px, 18vw, 120px)',
            height: 'auto',
            margin: '0 auto clamp(24px, 5vw, 40px)',
            display: 'block',
            borderRadius: 'clamp(16px, 4vw, 24px)',
            boxShadow: '0 18px 36px -14px rgba(15, 23, 42, 0.25)'
          }}
        />

        <h1 style={{
          fontSize: 'clamp(32px, 7vw, 52px)',
          fontWeight: '700',
          marginBottom: 'clamp(12px, 2.5vw, 16px)',
          letterSpacing: '-0.025em',
          color: '#0f172a',
          lineHeight: '1.15'
        }}>
          MxCrypto AI
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 3.5vw, 19px)',
          color: '#64748b',
          marginBottom: 'clamp(36px, 7vw, 56px)',
          lineHeight: '1.7',
          fontWeight: '400',
          maxWidth: '480px',
          margin: '0 auto clamp(36px, 7vw, 56px)'
        }}>
          Smart crypto insights powered by AI. Track markets, analyze trends, and make informed decisions.
        </p>

        <a
          href={APK_URL}
          download
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'clamp(12px, 2.5vw, 16px)',
            backgroundColor: '#0f172a',
            padding: 'clamp(14px, 3.5vw, 18px) clamp(28px, 5vw, 36px)',
            borderRadius: '14px',
            textDecoration: 'none',
            color: '#ffffff',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 14px -3px rgba(15, 23, 42, 0.25)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#1e293b';
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(15, 23, 42, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#0f172a';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 14px -3px rgba(15, 23, 42, 0.25)';
          }}
        >
          <svg viewBox="0 0 512 512" style={{ width: 'clamp(26px, 5vw, 32px)', height: 'clamp(26px, 5vw, 32px)', flexShrink: 0 }}>
            <path fill="#4DB6AC" d="M12 441.3c-.8-1.5-1.2-3.3-1.2-5.1V74.8c0-1.8.4-3.6 1.2-5.1l218.6 218.6L12 441.3z" />
            <path fill="#DCE775" d="M12 441.3L352 256 230.6 134.6 12 441.3z" />
            <path fill="#FF8A65" d="M444.2 245.8L352 256 12 74.8h432.2c8.2 0 15 6.8 15 15v141c0 8.2-6.8 15-15 15z" />
            <path fill="#BA68C8" d="M444.2 266.2v141c0 8.2-6.8 15-15 15H12l340-181 92.2 25z" />
          </svg>
          <div style={{ textAlign: 'left' }}>
            <div style={{ 
              fontSize: 'clamp(10px, 2.2vw, 12px)', 
              textTransform: 'uppercase', 
              opacity: 0.75, 
              letterSpacing: '0.8px',
              fontWeight: '500',
              marginBottom: '2px'
            }}>Download</div>
            <div style={{ 
              fontSize: 'clamp(17px, 3.8vw, 21px)', 
              fontWeight: '600',
              letterSpacing: '-0.01em'
            }}>Android APK</div>
            <div style={{
              marginTop: '6px',
              fontSize: '12px',
              opacity: 0.8
            }}>
              Version: {APK_VERSION}
            </div>
          </div>
        </a>

        <div style={{
          marginTop: '14px',
          fontSize: '12px',
          color: '#94a3b8',
          wordBreak: 'break-all',
          lineHeight: 1.5
        }}>
          SHA-256: <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace' }}>{APK_SHA256}</span>
        </div>

      </div>

      <div style={{
        position: 'absolute',
        bottom: 'clamp(20px, 4vw, 32px)',
        color: '#cbd5e1',
        fontSize: 'clamp(12px, 2.5vw, 13px)',
        textAlign: 'center',
        fontWeight: '500',
        letterSpacing: '0.01em'
      }}>
        © 2025 MxCrypto AI
      </div>
    </div>
  );
}

export default App;
