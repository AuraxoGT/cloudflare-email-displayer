const express = require('express');
const postgres = require('postgres');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Connect to Postgres using the INTERNAL URL
const sql = postgres(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// SSE Clients for real-time push
let clients = [];

// Broadcast utility
const broadcast = (data) => {
    clients.forEach(c => c.res.write(`data: ${JSON.stringify(data)}\n\n`));
};

// Auth middleware (Optional but recommended)
const auth = (req, res, next) => {
    const key = req.headers.authorization?.replace('Bearer ', '');
    if (process.env.PROXY_KEY && key !== process.env.PROXY_KEY) {
        return res.status(401).send('Unauthorized');
    }
    next();
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
