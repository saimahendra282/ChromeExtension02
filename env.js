async function loadEnvVars() {
    try {
        const response = await fetch(chrome.runtime.getURL('.env'));
        const text = await response.text();
        
        const env = {};
        text.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                env[key.trim()] = value.trim();
            }
        });
        
        window.ENV = env;
    } catch (error) {
        console.error('Error loading .env file:', error);
        window.ENV = {
            GEMINI_API_KEY: '' // Fallback empty key
        };
    }
}

loadEnvVars();
