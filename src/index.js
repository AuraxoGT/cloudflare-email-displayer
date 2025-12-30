export default {
    async email(message, env, ctx) {
        const { from, to, headers } = message;
        const subject = headers.get("subject") || "(No Subject)";
        const rawContent = await new Response(message.raw).text();

        // AI-Powered Parsing Logic
        let aiResult = await extractWithAI(from, subject, rawContent, env);

        // Fallback to manual detection if AI fails or returns an error
        const displayBody = cleanBody(rawContent); // This prioritizes HTML and strips stubs
        if (!aiResult || aiResult.error || !aiResult.service) {
            const serviceInfo = detectService(from, subject, displayBody);
            const otpCode = extractOTP(from, subject, displayBody);

            // Merge AI error if it exists, but keep the legacy service/color
            aiResult = {
                ...(aiResult || {}),
                service: aiResult?.service && aiResult.service !== "Unknown" ? aiResult.service : serviceInfo.name,
                color: aiResult?.color || serviceInfo.color,
                otp: aiResult?.otp || otpCode,
                isOTP: !!(aiResult?.otp || aiResult?.link || otpCode)
            };
        }

        // --- VERIFICATION-ONLY FILTER ---
        // If no code or link was found by AI or fallback, ignore the email
        if (!aiResult.isOTP) {
            console.log("Ignored non-verification email:", subject);
            return;
        }

        const emailData = {
            from,
            to,
            subject,
            timestamp: new Date().toISOString(),
            raw: rawContent,
            body: displayBody, // Aligned with Proxy DB expectation
            ...aiResult,
            isAIResult: !!aiResult?.aiGenerated,
            aiError: aiResult?.error || null
        };

        // Send to Railway Proxy (Non-blocking)
        const proxyBase = (env.RAILWAY_URL || "").replace(/\/$/, "");
        if (proxyBase) {
            ctx.waitUntil((async () => {
                try {
                    const resp = await fetch(`${proxyBase}/api/emails`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${env.PROXY_KEY || ''}`
                        },
                        body: JSON.stringify(emailData)
                    });
                    if (!resp.ok) console.error("Proxy Rejection:", await resp.text());
                } catch (e) {
                    console.error("Proxy Network Error:", e);
                }
            })());
        }
    },

    async fetch(request, env, ctx) {
        return new Response(JSON.stringify({
            status: "ok",
            service: "AI Email Processing Service",
            message: "This worker processes emails headlessly. Visit your Cloudflare Pages dashboard to view emails."
        }), {
            headers: { "content-type": "application/json" }
        });
    },
};

async function extractWithAI(from, subject, body, env) {
    if (!env.GEMINI_API_KEY) return { error: "Missing Key" };

    try {
        // 1. RAW FEED (No cleaning, let AI handle the noise as requested)
        const targetContent = body;

        const prompt = `
          TASK: Extract the PRIMARY ACTION (Security Code or Verification Link) from this RAW email data.
          
          RULES:
          1. Look for a 6-digit numeric code OR a full verification/action URL.
          2. ACTION LINKS: Find links for "Verify", "Confirm", "Activate", or "Reset Password".
          3. IGNORE UTILITY LINKS: Completely ignore "View in Browser", "View Online", "Unsubscribe", or "Support" links.
          4. IGNORE all technical noise (DKIM, headers, boundaries).
          5. If NO action is found, return null. NEVER guess or invent data.
          
          RAW EMAIL DATA:
          From: ${from}
          Subject: ${subject}
          Content: ${targetContent}

          Return ONLY JSON:
          {
            "service": "Service Name",
            "otp": "code or null",
            "link": "https://full-action-link-or-null",
            "actionLabel": "Descriptive Label (e.g. Verify Email)",
            "color": "#hex",
            "isOTP": true
          }
        `;

        const configurations = [
            { api: "v1beta", model: "gemini-2.5-flash" },
            { api: "v1beta", model: "gemini-2.0-flash" },
            { api: "v1beta", model: "gemini-2.0-flash-exp" },
            { api: "v1beta", model: "gemini-1.5-flash-latest" },
            { api: "v1beta", model: "gemini-1.5-flash" }
        ];

        let lastError = "";

        for (const config of configurations) {
            try {
                const url = `https://generativelanguage.googleapis.com/${config.api}/models/${config.model}:generateContent?key=${env.GEMINI_API_KEY}`;
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.1 }
                    })
                });

                const data = await response.json();
                if (data.error) {
                    lastError = `${config.model} (${config.api}): ${data.error.message}`;
                    continue; // Try next configuration
                }

                if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    let text = data.candidates[0].content.parts[0].text;
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) text = jsonMatch[0];
                    const parsed = JSON.parse(text);

                    // VALIDATION
                    const otp = (parsed.otp || "").toString();
                    if (otp.length > 8 || /[a-zA-Z]{4,}/.test(otp) || otp.includes('=') || otp.includes('+')) {
                        parsed.otp = null; // Reject technical noise
                    }
                    if (parsed.link && (!parsed.link.startsWith('http') || parsed.link.includes(' '))) {
                        parsed.link = null;
                    }

                    parsed.isOTP = !!(parsed.otp || parsed.link);
                    return { ...parsed, aiGenerated: true, aiModel: config.model };
                }
            } catch (err) {
                lastError = err.message;
                continue;
            }
        }
        return { error: lastError || "Failed" };
    } catch (e) {
        return { error: e.message };
    }
}

function detectService(from, subject, body) {
    const fromLower = from.toLowerCase();
    const content = (subject + body).toLowerCase();
    const allContent = (fromLower + content);

    const services = [
        // --- Gaming ---
        { name: "Epic Games", keywords: ["epicgames", "epic games"], color: "#313131" },
        { name: "Steam", keywords: ["steam"], color: "#171a21" },
        { name: "Riot Games", keywords: ["riotgames", "riot games", "league of legends", "valorant"], color: "#d13639" },
        { name: "Ubisoft", keywords: ["ubisoft"], color: "#0070ff" },
        { name: "EA", keywords: ["ea.com", "electronic arts", "origin"], color: "#f53333" },
        { name: "Blizzard", keywords: ["blizzard", "battle.net"], color: "#00aeff" },
        { name: "PlayStation", keywords: ["playstation", "sony"], color: "#003087" },
        { name: "Xbox", keywords: ["xbox", "microsoft"], color: "#107c10" },
        { name: "Nintendo", keywords: ["nintendo"], color: "#e60012" },
        { name: "Rockstar", keywords: ["rockstargames", "rockstar games"], color: "#ffab00" },
        { name: "Twitch", keywords: ["twitch"], color: "#9146ff" },

        // --- AI Platforms ---
        { name: "OpenAI", keywords: ["openai", "chatgpt"], color: "#74aa9c" },
        { name: "Anthropic", keywords: ["anthropic", "claude"], color: "#cc9b7a" },
        { name: "Perplexity", keywords: ["perplexity"], color: "#20b2aa" },
        { name: "Midjourney", keywords: ["midjourney"], color: "#6366f1" },
        { name: "Mistral", keywords: ["mistral"], color: "#f5d142" },

        // --- Streaming ---
        { name: "Spotify", keywords: ["spotify"], color: "#1DB954" },
        { name: "Netflix", keywords: ["netflix"], color: "#E50914" },
        { name: "Disney+", keywords: ["disneyplus", "disney+"], color: "#113CCF" },
        { name: "Prime Video", keywords: ["prime video", "amazon video"], color: "#00A8E1" },
        { name: "Apple TV", keywords: ["apple tv"], color: "#000000" },
        { name: "SoundCloud", keywords: ["soundcloud"], color: "#ff5500" },

        // --- Tech & Social ---
        { name: "Discord", keywords: ["discord"], color: "#5865F2" },
        { name: "Google", keywords: ["google", "gmail", "youtube"], color: "#4285F4" },
        { name: "GitHub", keywords: ["github"], color: "#24292e" },
        { name: "Microsoft", keywords: ["microsoft", "outlook", "azure"], color: "#00a4ef" },
        { name: "Apple", keywords: ["apple", "icloud"], color: "#555555" },
        { name: "Twitter / X", keywords: ["twitter", " x "], color: "#1DA1F2" },
        { name: "Instagram", keywords: ["instagram"], color: "#E1306C" },
        { name: "Facebook", keywords: ["facebook", "meta"], color: "#1877F2" },
        { name: "LinkedIn", keywords: ["linkedin"], color: "#0077B5" }
    ];

    // Try checking the 'from' field first for high confidence
    for (const s of services) {
        if (s.keywords.some(k => fromLower.includes(k.replace(" ", "")))) return s;
    }

    // Fallback to searching the whole content
    for (const s of services) {
        if (s.keywords.some(k => allContent.includes(k))) return s;
    }

    return { name: "Email", color: "#333" };
}

function extractOTP(from, subject, body) {
    // Patterns to ignore (common false positives like years, ports, or non-code words)
    const ignorePatterns = [/\b202\d\b/, /\b8787\b/, /\b8080\b/, /\b595959\b/, /\b000000\b/, /\bPUBLIC\b/];
    const blacklist = ["FROM", "GMAIL", "EMAIL", "CODE", "SEND", "LOGIN", "USER", "INFO", "MAIL", "PUBLIC", "595959"];

    const patterns = [
        // 1. Explicitly labeled codes (High confidence)
        /verification code:?\s*([A-Z0-9]{4,8})/i,
        /security code:?\s*([A-Z0-9]{4,8})/i,
        /code:?\s*([A-Z0-9]{4,8})/i,
        /kod:?\s*(\d{4,8})/i,
        /is:\s*([A-Z0-9]{4,8})\b/i, // "Your code is: 12345"

        // 2. Likely 6-digit numeric codes (Very common)
        /\b\d{6}\b/,

        // 3. Fallback alphanumeric/numeric codes
        /\b\d{4,8}\b/,
        /\b[A-Z0-9]{5,6}\b/
    ];

    const findMatch = (text) => {
        // Special case: Epic Games is ALWAYS 6 digits numeric
        const isEpic = from.toLowerCase().includes('epicgames') || subject.toLowerCase().includes('epic');
        if (isEpic) {
            // Check subject first - extremely high confidence for Epic
            const subMatch = subject.match(/\b\d{6}\b/);
            if (subMatch && !blacklist.includes(subMatch[0])) return subMatch[0];

            const bodyMatches = text.match(/\b\d{6}\b/g);
            if (bodyMatches) {
                const realCode = bodyMatches.find(m => !blacklist.includes(m));
                if (realCode) return realCode;
            }
        }

        // First, try patterns that have an explicit label/capture group
        for (const p of patterns.slice(0, 5)) {
            const match = text.match(p);
            if (match && match[1]) {
                const potentialCode = match[1].trim();
                if (isValidCode(potentialCode)) return potentialCode;
            }
        }

        // Then try the general patterns
        for (const p of patterns.slice(5)) {
            const match = text.match(p);
            if (match) {
                const potentialCode = (match[1] || match[0]).trim();
                if (isValidCode(potentialCode)) return potentialCode;
            }
        }
        return null;
    };

    function isValidCode(code) {
        if (!code) return false;
        const upCode = code.toUpperCase();

        // Ignore if in blacklist
        if (blacklist.includes(upCode)) return false;

        // Ignore if matches specific noise patterns
        if (ignorePatterns.some(ip => ip.test(code))) return false;

        // Alphanumeric codes should usually have at least one number OR be longer than 4 chars
        // to avoid matching simple words like "TEST", "SEND"
        const hasNumber = /\d/.test(code);
        if (!hasNumber && code.length <= 4) return false;

        return true;
    }

    return findMatch(subject) || findMatch(body);
}

function cleanBody(body) {
    if (!body) return "";

    // 1. Identify best part for display (HTML prioritized)
    let target = body;
    const boundaryMatch = body.match(/boundary="?([^";\s]+)"?/i);
    if (boundaryMatch) {
        const boundary = boundaryMatch[1];
        const parts = body.split(`--${boundary}`);
        let best = null;
        for (const p of parts) {
            const lp = p.toLowerCase();
            if (lp.includes('text/html')) { best = p; break; }
            if (lp.includes('text/plain') && !lp.includes('html formatted email')) { best = p; }
        }
        if (best) {
            const idx = best.indexOf('\r\n\r\n');
            if (idx !== -1) target = best.substring(idx + 4);
        }
    }

    // 2. Decode & Strip
    let clean = target
        .replace(/=\r?\n/g, '') // Soft line breaks
        .replace(/=([0-9A-F]{2})/gi, (m, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/<[^>]+>/g, ' ') // Strip HTML tags
        .replace(/It looks like your email client.*?client\./gi, '')
        .replace(/Try opening this email in another email client\./gi, '')
        .replace(/Or, open the following link to vi\.\.\./gi, '')
        .replace(/View this email in a browser/gi, '')
        .replace(/--[a-zA-Z0-9'()+ ,./:?_=-]{10,}/g, '')
        .replace(/[^\x20-\x7E\n\r]/g, '')
        .replace(/^[a-zA-Z0-9-]+:[\s\S]*?(?=\r?\n\r?\n)/gm, '')
        .replace(/DKIM-Signature:[\s\S]*?(?=\r?\n)/gi, '')
        .replace(/b=[a-zA-Z0-9+/]{20,}/g, '')
        .replace(/[\n\r]{2,}/g, '\n')
        .trim();

    return clean.slice(0, 150) + "...";
}

function cleanName(from) {
    if (!from) return "";
    const nameMatch = from.match(/^"?(.*?)"?\s*<.*>$/);
    if (nameMatch && nameMatch[1]) return nameMatch[1];
    if (from.includes('epicgames.com')) return "Epic Games";
    if (from.includes('@')) return from.split('@')[0];
    return from;
}

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
