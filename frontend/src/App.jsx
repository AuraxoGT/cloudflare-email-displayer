import React, { useState, useEffect } from 'react';
import './index.css';

const PROXY_URL = import.meta.env.VITE_PROXY_URL;

function cleanBody(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function App() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const savedState = sessionStorage.getItem('oauth_state') || localStorage.getItem('oauth_state');

    if (code) {
      if (!state || state !== savedState) {
        console.error('State Mismatch:', { received: state, saved: savedState });
        setAuthError('Security verification failed. Please try logging in again.');
        return;
      }

      // Clear states
      sessionStorage.removeItem('oauth_state');
      localStorage.removeItem('oauth_state');

      const handleCallback = async () => {
        setLoading(true);
        try {
          const resp = await fetch(`${PROXY_URL.replace(/\/$/, '')}/api/auth/callback?code=${code}&state=${state}`);
          const data = await resp.json();

          if (data.token) {
            localStorage.setItem('auth_token', data.token);
            setToken(data.token);
            window.history.replaceState({}, document.title, window.location.pathname);
          } else if (data.error) {
            setAuthError(data.error);
          }
        } catch (err) {
          setAuthError('Could not verify identity. Check server status.');
        } finally {
          setLoading(false);
        }
      };
      handleCallback();
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const streamUrl = `${PROXY_URL.replace(/\/$/, '')}/api/emails/stream?token=${token}`;
    const es = new EventSource(streamUrl);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new-email') {
        setRefreshTrigger(prev => prev + 1);
      }
    };

    return () => es.close();
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let interval;
    const fetchEmails = async () => {
      try {
        const resp = await fetch(`${PROXY_URL.replace(/\/$/, '')}/api/emails`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resp.status === 401) {
          localStorage.removeItem('auth_token');
          setToken(null);
          return;
        }

        if (!resp.ok) throw new Error('Failed to fetch');
        const data = await resp.json();
        setEmails(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
    interval = setInterval(fetchEmails, 30000);
    return () => clearInterval(interval);
  }, [token, refreshTrigger]);

  const handleLogin = async () => {
    try {
      const resp = await fetch(`${PROXY_URL.replace(/\/$/, '')}/api/auth/login`);
      const { url, state } = await resp.json();
      // Store in both for reliability
      sessionStorage.setItem('oauth_state', state);
      localStorage.setItem('oauth_state', state);
      window.location.href = url;
    } catch (err) {
      setAuthError('Authentication server is offline.');
    }
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (authError) {
    return (
      <div className="auth-screen">
        <div className="glass-card login-card">
          <h1 className="rejection-text">{authError}</h1>
          <div className="middle-finger">🖕</div>
          <button className="verify-btn" style={{ marginTop: '40px', background: 'var(--glass-border)' }} onClick={() => window.location.href = '/'}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="auth-screen">
        <div className="glass-card login-card">
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔐</div>
          <h1 style={{ color: '#fff', marginBottom: '30px', fontWeight: '800' }}>Access Restricted</h1>
          <button className="verify-btn" onClick={handleLogin}>
            Sign in with Discord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {error && <div className="error-banner">⚠️ Connection Lost: {error}</div>}

      {loading && emails.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <div className="loading-spinner"></div>
        </div>
      ) : emails.length === 0 ? (
        <div className="no-emails">Waiting for incoming verification emails...</div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {emails.map((e) => (
            <div key={e.id} className="glass-card email-card">
              <span className="time">{formatDate(e.created_at)}</span>
              <div className="service-badge" style={{ background: e.brand_color || 'var(--accent)' }}>
                {e.service_name || 'Verification'}
              </div>

              {e.otp_code ? (
                <div className="otp-container">
                  <div className="otp-label">Security Code</div>
                  <div className="otp-code" onClick={() => copyToClipboard(e.id, e.otp_code)}>
                    {e.otp_code}
                    {copiedId === e.id && <div className="copied-badge">Copied</div>}
                  </div>
                  {e.action_link && (
                    <a href={e.action_link} target="_blank" rel="noopener noreferrer" className="verify-btn" style={{ marginTop: '20px' }}>
                      {e.action_label || 'Verify Now'}
                    </a>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: '10px' }}>
                  <div className="subject" style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>{e.subject}</div>
                  <div className="raw-content">{cleanBody(e.body_raw)}</div>
                  {e.action_link && (
                    <a href={e.action_link} target="_blank" rel="noopener noreferrer" className="verify-btn" style={{ marginTop: '20px' }}>
                      {e.action_label || 'Complete Verification'}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
