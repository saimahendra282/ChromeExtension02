(function(global) {
    // Wait for ENV to be available
    const getApiKey = () => {
        return new Promise((resolve) => {
            const checkEnv = () => {
                if (window.ENV?.GEMINI_API_KEY) {
                    resolve(window.ENV.GEMINI_API_KEY);
                } else {
                    setTimeout(checkEnv, 100);
                }
            };
            checkEnv();
        });
    };

    class GoogleGenerativeAI {
        constructor(apiKey) {
            this.apiKey = apiKey;
        }

        getGenerativeModel({ model }) {
            return {
                generateContent: async (params) => {
                    try {
                        const response = await fetch(
                            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ contents: params[0] })
                            }
                        );
                        const data = await response.json();
                        return {
                            response: {
                                text: () => data.candidates[0].content.parts[0].text
                            }
                        };
                    } catch (error) {
                        console.error('Gemini API Error:', error);
                        throw error;
                    }
                }
            };
        }
    }

    // Make class available after API key is loaded
    getApiKey().then(apiKey => {
        global.GoogleGenerativeAI = GoogleGenerativeAI;
        global.GEMINI_API_KEY = apiKey;
    });
})(window);
