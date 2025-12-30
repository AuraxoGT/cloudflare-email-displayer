
const apiKey = process.argv[2];
if (!apiKey) {
    console.error("Please provide an API key as an argument.");
    process.exit(1);
}

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.error) {
            console.error("API Error:", data.error.message);
            return;
        }
        console.log("Available Models:");
        data.models.forEach(m => {
            console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
        });
    } catch (e) {
        console.error("Fetch Error:", e.message);
    }
}

listModels();
