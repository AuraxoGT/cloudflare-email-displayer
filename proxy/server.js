const express = require('express');
const postgres = require('postgres');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Connect to Postgres using the INTERNAL URL
const sql = postgres(process.env.DATABASE_URL);

app.use(express.json({ limit: '10mb' }));

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const ALLOWED_ID = '959449311366766622';

// 🔐 Strict Security: Only allow your specific dashboard domain
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin === allowedOrigin || allowedOrigin === '*') {
            callback(null, true);
        } else {
            callback(new Error('CORS Lock: Access Denied'));
        }
    }
}));

// In-memory state store for CSRF protection
let oauthStates = new Set();

// SSE Clients for real-time push
let clients = [];

// Broadcast utility
const broadcast = (data) => {
    clients.forEach(c => c.res.write(`data: ${JSON.stringify(data)}\n\n`));
};

// Auth middleware (Optional but recommended)
const auth = (req, res, next) => {
    const key = req.headers.authorization?.replace('Bearer ', '');

    // 1. Check for Worker key (Admin Key)
    if (process.env.PROXY_KEY && key === process.env.PROXY_KEY) {
        return next();
    }

    // 2. Check for User JWT
    try {
        const decoded = jwt.verify(key, JWT_SECRET);
        if (decoded.id === ALLOWED_ID) {
            return next();
        }
    } catch (e) {
        // JWT verification failed, or no JWT provided
    }

    res.status(401).send('Unauthorized');
};

// 1. Receive Processed Email from Worker
app.post('/api/emails', auth, async (req, res) => {
    const e = req.body;
    try {
        await sql`
            INSERT INTO emails (
                sender, recipient, subject, body_raw, service_name, 
                brand_color, otp_code, action_link, action_label, 
                is_otp, is_ai_result, ai_model, ai_error
            ) VALUES (
                ${e.from}, ${e.to}, ${e.subject}, ${e.raw}, ${e.service || null}, 
                ${e.color || null}, ${e.otp || null}, ${e.link || null}, ${e.actionLabel || null}, 
                ${e.isOTP || false}, ${e.isAIResult || false}, ${e.aiModel || null}, ${e.aiError || null}
            )
        `;
        res.status(201).send('Stored');

        // --- INSTANT PUSH ---
        // Notify all dashboard clients to refresh
        broadcast({ type: 'new-email' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// 2. Fetch Emails for Dashboard
app.get('/api/emails', auth, async (req, res) => {
    const filterOTP = req.query.filter === 'otp';
    try {
        let emails;
        if (filterOTP) {
            emails = await sql`SELECT * FROM emails WHERE is_otp = true ORDER BY created_at DESC LIMIT 50`;
        } else {
            emails = await sql`SELECT * FROM emails ORDER BY created_at DESC LIMIT 50`;
        }
        res.json(emails);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// 4. Discord OAuth2 Routes
app.get('/api/auth/login', (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');
    oauthStates.add(state);

    // Cleanup state after 10 mins
    setTimeout(() => oauthStates.delete(state), 600000);

    const client_id = process.env.DISCORD_CLIENT_ID;
    const redirect_uri = encodeURIComponent(process.env.DISCORD_REDIRECT_URI);
    const url = `https://discord.com/api/oauth2/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=identify&state=${state}`;
    res.json({ url, state });
});

app.get('/api/auth/callback', async (req, res) => {
    const { code, state } = req.query;

    // 🛡️ CSRF Protection: Verify state
    if (!state || !oauthStates.has(state)) {
        return res.status(403).json({ error: 'Invalid OAuth State (Possible CSRF Attack)' });
    }
    oauthStates.delete(state);

    if (!code) return res.status(400).send('No code provided');

    try {
        // Exchange code for token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.DISCORD_REDIRECT_URI,
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) throw new Error('Failed to exchange code');

        // Get User Info
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const userData = await userResponse.json();
        const discord_id = userData.id;

        if (discord_id !== ALLOWED_ID) {
            return res.status(403).json({ error: 'EIK NAHUI GAIDY' });
        }

        // Generate JWT
        const token = jwt.sign({ id: discord_id, username: userData.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: userData });
    } catch (err) {
        console.error(err);
        res.status(500).send('Auth Error');
    }
});

// 3. Real-Time SSE Stream (Push to Frontend)
app.get('/api/emails/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const id = Date.now();
    clients.push({ id, res });

    req.on('close', () => {
        clients = clients.filter(c => c.id !== id);
    });
});

app.listen(port, () => {
    console.log(`Proxy running on port ${port}`);
});
