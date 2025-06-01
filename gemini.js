// Wait for API key to be available
const initGemini = async () => {
    while (!window.GEMINI_API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const genAI = new window.GoogleGenerativeAI(window.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7
        },
systemInstruction: "Respond in the tone of a cheerful, kind, and expressive teacher. Keep replies concise yet engaging, using real-world examples when helpful. Do not mention being a chatbot; if the user questions this, simply reply: 'I am an ERP AI created to assist you.",

    });

    document.addEventListener('mouseup', () => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            showAskAIPopup(selectedText);
        }
    });

    function showAskAIPopup(selectedText) {
        const existingPopup = document.getElementById('ai-popup');
        if (existingPopup) existingPopup.remove();

        const popup = document.createElement('div');
        popup.id = 'ai-popup';
        popup.style.cssText = `
            position: fixed;
            background: white;
            padding: 12px;
            border-radius: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            gap: 8px;
            width: 300px;
            align-items: center;
        `;

        // Position popup near mouse
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        popup.style.left = `${mouseX}px`;
        popup.style.top = `${mouseY + 20}px`;

        // Create input field (instead of textarea)
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Ask AI about this...';
        input.style.cssText = `
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            outline: none;
            font-size: 14px;
        `;

        // Store selected text as data attribute
        input.dataset.selectedText = selectedText;

        // Create Ask AI button
        const askButton = document.createElement('button');
        askButton.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>`;
        askButton.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            flex-shrink: 0;
        `;

        askButton.addEventListener('click', async () => {
            const question = input.value.trim();
            const context = input.dataset.selectedText;
            popup.remove();

            try {
                // Show loading popup
                showResponsePopup('Thinking...');

                // Call Gemini API
                const result = await model.generateContent([
                    {
                        role: "user",
                        parts: [{ 
                            text: `Context: ${context}\nQuestion: ${question}` 
                        }],
                    },
                ]);

                const response = await result.response;
                showResponsePopup(response.text());
            } catch (error) {
                console.error('Error:', error);
                showResponsePopup('Sorry, I encountered an error. Please try again.');
            }
        });

        // Close popup when clicking outside
        document.addEventListener('mousedown', (e) => {
            if (!popup.contains(e.target)) {
                popup.remove();
            }
        });

        // Handle enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                askButton.click();
            }
        });

        popup.appendChild(input);
        popup.appendChild(askButton);
        document.body.appendChild(popup);
        
        // Focus input field
        input.focus();
    }

    function showResponsePopup(content) {
        const existingResponse = document.getElementById('ai-response');
        if (existingResponse) existingResponse.remove();

        const responsePopup = document.createElement('div');
        responsePopup.id = 'ai-response';
        responsePopup.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            font-size: 14px;
            line-height: 1.5;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 18px;
            color: #666;
        `;
        closeBtn.onclick = () => responsePopup.remove();

        const contentDiv = document.createElement('div');
        contentDiv.style.marginTop = '10px';
        
        // Simple markdown-like formatting
        const formattedContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
        
        contentDiv.innerHTML = formattedContent;
        
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            #ai-response strong { font-weight: bold; }
            #ai-response em { font-style: italic; }
            #ai-response code { 
                background: #f0f0f0; 
                padding: 2px 4px; 
                border-radius: 4px; 
                font-family: monospace;
            }
        `;
        responsePopup.appendChild(styleEl);

        responsePopup.appendChild(closeBtn);
        responsePopup.appendChild(contentDiv);
        document.body.appendChild(responsePopup);
    }
};

initGemini();
