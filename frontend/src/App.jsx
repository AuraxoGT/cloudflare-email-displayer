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
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let interval;
    const fetchEmails = async (isManual = false) => {
      if (!PROXY_URL) {
        setError('Missing VITE_PROXY_URL in .env');
        setLoading(false);
        return;
      }

      if (isManual) setLoading(true);
      try {
        const url = `${PROXY_URL.replace(/\/$/, '')}/api/emails${filter === 'otp' ? '?filter=otp' : ''}`;
        const resp = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${PROXY_KEY}`
          }
        });

        if (!resp.ok) throw new Error(`Proxy Error: ${resp.statusText}`);

        const data = await resp.json();

        // Check for new emails to show a notification potentially (optional future extra)
        setEmails(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
    interval = setInterval(() => fetchEmails(false), 3000); // Super fast 3s polling
    return () => clearInterval(interval);
  }, [filter]);

  const handleManualRefresh = () => {
    // We already have a fast interval, but users love pushing buttons
    window.location.reload();
  };

  return (
    <div className="container">
      <div className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1>AI Email Hub</h1>
          <div className="live-indicator">
            <div className="pulse"></div>
            <span>LIVE</span>
          </div>
        </div>
        <div className="filters">
          <button
            className="filter-btn"
            style={{ marginRight: '8px', opacity: 0.5 }}
            onClick={handleManualRefresh}
          >
            Refresh
          </button>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'otp' ? 'active' : ''}`}
            onClick={() => setFilter('otp')}
          >
            Codes Only
          </button>
        </div>
      </div>

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
                        alert('Code Copied!');
                      }}
                    >
                      {e.otp_code}
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
