import { useState, useEffect } from 'react';
import './index.css';

const PROXY_URL = import.meta.env.VITE_PROXY_URL || '';
const PROXY_KEY = import.meta.env.VITE_PROXY_KEY || '';

function formatDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function cleanName(from) {
  return from.split('<')[0].trim().replace(/"/g, '');
}

function cleanBody(body) {
  if (!body) return '';
  return body
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function App() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  // Auth State
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Handle Callback from Discord
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const savedState = sessionStorage.getItem('oauth_state');

    if (code) {
      if (state !== savedState) {
        setAuthError('Security verification failed (State Mismatch)');
        return;
      }
      sessionStorage.removeItem('oauth_state');

      const handleCallback = async () => {
        setLoading(true);
        try {
          const resp = await fetch(`${PROXY_URL.replace(/\/$/, '')}/api/auth/callback?code=${code}&state=${state}`);
          const data = await resp.json();
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
            setToken(data.token);
            setUser(data.user);
            window.history.replaceState({}, document.title, window.location.pathname);
          } else if (data.error) {
            setAuthError(data.error);
          }
        } catch (err) {
          setAuthError('Connection Error');
        } finally {
          setLoading(false);
        }
      };
      handleCallback();
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    // 1. Real-time Push (SSE)
    const streamUrl = `${PROXY_URL.replace(/\/$/, '')}/api/emails/stream?token=${token}`;
    const es = new EventSource(streamUrl);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new-email') {
        setRefreshTrigger(prev => prev + 1);
      }
    };

    return () => es.close();
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let interval;
    const fetchEmails = async (isManual = false) => {
      if (!PROXY_URL) {
        setError('Missing VITE_PROXY_URL in .env');
        setLoading(false);
        return;
      }

      if (isManual) setLoading(true);
      try {
        const url = `${PROXY_URL.replace(/\/$/, '')}/api/emails`;
        const resp = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (resp.status === 401) {
          localStorage.removeItem('auth_token');
          setToken(null);
          return;
        }

        if (!resp.ok) throw new Error(`Proxy Error: ${resp.statusText}`);

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
    interval = setInterval(() => fetchEmails(false), 30000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const handleLogin = async () => {
    try {
      const resp = await fetch(`${PROXY_URL.replace(/\/$/, '')}/api/auth/login`);
      const { url, state } = await resp.json();
      sessionStorage.setItem('oauth_state', state);
      window.location.href = url;
    } catch (err) {
      setAuthError('OAuth Service Offline');
    }
  };

  if (authError) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <h1 style={{ color: 'red', fontSize: '3rem', fontWeight: '900' }}>{authError}</h1>
        {authError === 'EIK NAHUI GAIDY' && <div style={{ marginTop: '20px', fontSize: '10rem' }}>🖕</div>}
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <button className="verify-btn" onClick={handleLogin} style={{ width: 'auto', padding: '20px 40px' }}>
          Login with Discord
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '20px' }}>

      {error && (
        <div className="error-banner">
          <strong>Connection Error:</strong> {error}
          <br />
          <p style={{ marginTop: '8px', fontSize: '0.8rem', opacity: 0.8 }}>
            Make sure your Railway Proxy is running and VITE_PROXY_URL is correct.
          </p>
        </div>
      )}

      {loading && emails.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <div className="loading-spinner"></div>
        </div>
      ) : emails.length === 0 ? (
        <div className="no-emails">No verification emails found.</div>
      ) : (
        emails.map((e) => (
          <div key={e.id} className="email-card">
            <span className="time">{formatDate(e.created_at || e.timestamp)}</span>
            <div
              className="service-badge"
              style={{ background: e.brand_color || '#333', color: 'white' }}
            >
              {e.service_name || 'Verification'}
            </div>

            {(e.otp_code || e.action_link) ? (
              <div className="action-container">
                {e.otp_code && (
                  <div className="otp-container">
                    <div className="otp-label">Verification Code</div>
                    <div
                      className="otp-code"
                      onClick={() => {
                        navigator.clipboard.writeText(e.otp_code);
                        setCopiedId(e.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                    >
                      {e.otp_code}
                      {copiedId === e.id && <div className="copied-overlay">COPIED ✅</div>}
                    </div>
                  </div>
                )}
                {e.action_link && (
                  <a
                    href={e.action_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="verify-btn"
                  >
                    {e.action_label || 'Complete Verification'}
                  </a>
                )}
              </div>
            ) : (
              <>
                <div className="subject">{e.subject}</div>
                <div className="from">{cleanName(e.sender || e.from)}</div>
                <div className="raw-content">{cleanBody(e.body_raw || e.raw)}</div>
              </>
            )}

            <div
              className="ai-tag"
              style={{ opacity: 0.5, color: e.is_ai_result ? 'var(--accent)' : 'var(--text)' }}
            >
              {e.is_ai_result ? `AI Extracted (${e.ai_model || 'Gemini'})` : 'Smart Extraction'}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
