class ChatbotExtension {
  constructor() {
    this.isInitialized = false;
    this.chatState = {
      isOpen: false,
      messages: [],
      hasWelcomed: false,
      isWaitingForCGPA: false,
      cgpaRetryCount: 0
    };
    this.userId = null;
    this.maxRetries = 3;

    this.init();
  }

  async init() {
    // Load state from chrome.storage
    const result = await chrome.storage.sync.get(['userId', 'chatState']);
    
    if (result.userId) {
      this.userId = result.userId;
    }
    if (result.chatState) {
      this.chatState = { ...this.chatState, ...result.chatState, isOpen: false };
    }

    // Get userId if not stored
    if (!this.userId) {
      this.userId = this.getUserIdFromDOM();
      if (this.userId) {
        chrome.storage.sync.set({ userId: this.userId });
      } else {
        this.userId = 'User';
      }
    }

    // Check if we just navigated to CGPA page
    if (this.chatState.isWaitingForCGPA) {
      // console.log('Detected navigation to CGPA page, attempting extraction...');
      setTimeout(() => this.handleCGPAPageLoad(), 2000);
    }

    this.createChatElements();
    this.setupEventListeners();
    this.setupMessageListener();
    this.setupLogoutListener(); // New: Setup logout button listener
    this.isInitialized = true;

    // Auto-open chat on page load (always open)
    setTimeout(() => this.openChat(), 1000);
  }

  // **New: Setup logout button listener**
  setupLogoutListener() {
    // Find the logout button and add event listener
    const logoutButton = document.querySelector('button.btn.btn-link.logout.pull-right');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        // console.log('Logout button clicked, resetting chat...');
        this.resetChat();
      });
    }

    // Also use MutationObserver to catch dynamically added logout buttons
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const logoutBtn = node.querySelector ? node.querySelector('button.btn.btn-link.logout.pull-right') : null;
            if (logoutBtn) {
              logoutBtn.addEventListener('click', () => {
                // console.log('Logout button clicked (dynamically added), resetting chat...');
                this.resetChat();
              });
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // **New: Reset chat function**
  async resetChat() {
    // console.log('Resetting chat state...');
    
    // Reset chat state
    this.chatState = {
      isOpen: false,
      messages: [],
      hasWelcomed: false,
      isWaitingForCGPA: false,
      cgpaRetryCount: 0
    };

    // Clear storage
    await chrome.storage.sync.remove(['chatState', 'userId']);
    this.userId = null;

    // Clear chat messages UI
    if (this.chatMessages) {
      this.chatMessages.innerHTML = '';
    }

    // Close chat if open
    if (this.chatWindow && this.chatWindow.style.display === 'flex') {
      this.closeChat();
    }

    // console.log('Chat reset completed');
  }

  // **Setup Background Script Communication**
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'extractCGPA') {
        this.extractCGPAFromCurrentPage().then(cgpa => {
          sendResponse({ cgpa: cgpa });
        });
        return true; // Keep message channel open for async response
      }
    });
  }

  getUserIdFromDOM() {
    const selectors = [
      '.text-center b',
      '.id-card b',
      '[data-testid="user-id"]',
      '.student-info .id',
      '.user-profile .id',
      '.header .user-id'
    ];
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element.textContent.trim();
    }
    return null;
  }

  createChatElements() {
    // Remove existing elements if they exist
    const existingButton = document.getElementById('chat-button');
    const existingWindow = document.getElementById('chat-window');
    if (existingButton) existingButton.remove();
    if (existingWindow) existingWindow.remove();

    // Chat button
    this.chatButton = document.createElement('div');
    this.chatButton.id = 'chat-button';
    this.chatButton.innerHTML = `<img src="${this.getIconUrl()}" alt="Chat Icon" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">`;
    this.chatButton.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px;
      border-radius: 50%; cursor: pointer; z-index: 10000; box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      transition: transform 0.2s ease;
    `;

    // Chat window
    this.chatWindow = document.createElement('div');
    this.chatWindow.id = 'chat-window';
    this.chatWindow.style.cssText = `
      display: none; position: fixed; bottom: 90px; right: 20px;
      width: 320px; height: 450px; background-color: white; border-radius: 15px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3); flex-direction: column; z-index: 10001; overflow: hidden;
    `;

    // Chat header
    const chatHeader = document.createElement('div');
    chatHeader.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; padding: 15px; display: flex; justify-content: space-between;
      align-items: center; font-weight: bold; font-size: 16px;
    `;
    chatHeader.innerHTML = `
      <div style="display: flex; align-items: center;">
        <div style="width: 8px; height: 8px; background-color: #4ade80; border-radius: 50%; margin-right: 8px;"></div>
        <span>ERP Guru</span>
      </div>
      <button id="chat-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">✖</button>
    `;

    // Chat messages area
    this.chatMessages = document.createElement('div');
    this.chatMessages.id = 'chat-messages';
    this.chatMessages.style.cssText = `
      flex-grow: 1; padding: 15px; overflow-y: auto; font-size: 14px; line-height: 1.4;
    `;

    // Chat input container
    const chatInputContainer = document.createElement('div');
    chatInputContainer.style.cssText = `
      display: flex; padding: 15px; border-top: 1px solid #e5e7eb; background-color: #f9fafb;
    `;
    chatInputContainer.innerHTML = `
      <input id="chat-input" type="text" placeholder="Ask about CGPA..." style="
        flex-grow: 1; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 20px;
        margin-right: 8px; font-size: 14px; outline: none;
      ">
      <button id="chat-send" style="
        padding: 10px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white; border: none; border-radius: 20px; cursor: pointer; font-size: 14px;
      ">Send</button>
    `;

    // Assemble chat window
    this.chatWindow.appendChild(chatHeader);
    this.chatWindow.appendChild(this.chatMessages);
    this.chatWindow.appendChild(chatInputContainer);

    // Add to page
    document.body.appendChild(this.chatButton);
    document.body.appendChild(this.chatWindow);

    // Restore messages
    this.restoreMessages();
  }

  getIconUrl() {
    return chrome.runtime?.getURL('chat-icon.png') || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIgZmlsbD0iIzY2N2VlYSIvPjxwYXRoIGQ9Ik0zMCAzN1Y0M00zMCAzN0MyNi40ODUzNiAzNyAyMy41IDMzLjUxNDY0IDIzLjUgMzBDMjMuNSAyNi40ODUzNiAyNi40ODUzNiAyMyAzMCAyM1MzNi41IDI2LjQ4NTM2IDM2LjUgMzBDMzYuNSAzMy41MTQ2NCAzMy41MTQ2NCAzNyAzMCAzN1oiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIvPjwvc3ZnPg==';
  }

  setupEventListeners() {
    this.chatButton.addEventListener('click', () => this.toggleChat());
    
    const chatClose = this.chatWindow.querySelector('#chat-close');
    chatClose.addEventListener('click', () => this.closeChat());
    
    const chatInput = this.chatWindow.querySelector('#chat-input');
    const chatSend = this.chatWindow.querySelector('#chat-send');
    
    chatSend.addEventListener('click', () => this.sendMessage());
    chatInput.addEventListener('keypress', (e) => { 
      if (e.key === 'Enter') this.sendMessage(); 
    });

    // Hover effects
    this.chatButton.addEventListener('mouseenter', () => {
      this.chatButton.style.transform = 'scale(1.1)';
    });
    this.chatButton.addEventListener('mouseleave', () => {
      this.chatButton.style.transform = 'scale(1)';
    });
  }

  toggleChat() {
    const isOpen = this.chatWindow.style.display === 'flex';
    isOpen ? this.closeChat() : this.openChat();
  }

  openChat() {
    this.chatWindow.style.display = 'flex';
    this.chatState.isOpen = true;
    
    if (!this.chatState.hasWelcomed) {
      setTimeout(() => {
        this.addBotMessage(`Namasthe ${this.userId} sishya! <br>want to know your CGPA? or anything<br>Just name it`);
        this.chatState.hasWelcomed = true;
        this.saveChatState();
      }, 300);
    }
    
    this.saveChatState();
    this.scrollToBottom();
  }

  closeChat() {
    this.chatWindow.style.display = 'none';
    this.chatState.isOpen = false;
    this.saveChatState();
  }

  sendMessage() {
    const chatInput = this.chatWindow.querySelector('#chat-input');
    const message = chatInput.value.trim();
    if (!message) return;
    
    this.addUserMessage(message);
    chatInput.value = '';
    setTimeout(() => this.processMessage(message), 500);
  }

  addUserMessage(message) {
    const userMessage = document.createElement('div');
    userMessage.textContent = message;
    userMessage.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; margin-left: 20%; border-radius: 18px 18px 5px 18px;
      padding: 10px 14px; margin-bottom: 8px; max-width: 75%; word-wrap: break-word;
      animation: slideIn 0.3s ease;
    `;
    this.chatMessages.appendChild(userMessage);
    this.chatState.messages.push({ type: 'user', content: message });
    this.saveChatState();
    this.scrollToBottom();
  }

  addBotMessage(message) {
    const botMessage = document.createElement('div');
    botMessage.innerHTML = message;
    botMessage.style.cssText = `
      background-color: #f3f4f6; color: #374151; margin-right: 20%;
      border-radius: 18px 18px 18px 5px; padding: 10px 14px; margin-bottom: 8px;
      max-width: 75%; word-wrap: break-word; animation: slideIn 0.3s ease;
    `;
    this.chatMessages.appendChild(botMessage);
    this.chatState.messages.push({ type: 'bot', content: message });
    this.saveChatState();
    this.scrollToBottom();
  }

  processMessage(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('cgpa') || lowerMessage.includes('gpa')) {
      this.handleCGPAQuery();
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      this.addBotMessage('Namaskaram sishya, i am a chatbot created to assist you ');
    } else {
      this.addBotMessage('Ask me anything related to this erp like calculating attendence when u bunked classes 😜, just name it');
    }
  }

  async handleCGPAQuery() {
    this.addBotMessage('Fetching your CGPA... 🔍');
    
    // First try current page
    let cgpa = await this.extractCGPAFromCurrentPage();
    if (cgpa) {
      this.displayCGPA(cgpa);
      return;
    }

    // Not found, need to navigate
    const cgpaLink = this.findCGPALink();
    if (!cgpaLink) {
      this.addBotMessage('❌ No "My CGPA" link found. Please make sure you\'re on the ERP main page.');
      return;
    }

    // Set up state for navigation
    this.chatState.isWaitingForCGPA = true;
    this.chatState.cgpaRetryCount = 0;
    this.saveChatState();

    this.addBotMessage('Navigating to CGPA page... ⏳<br><small>Please wait while the page loads...</small>');
    
    // Navigate (this will cause page refresh)
    setTimeout(() => {
      cgpaLink.click();
    }, 1000);
  }

  // **This runs when we detect we're on the CGPA page after navigation**
  async handleCGPAPageLoad() {
    // console.log('Handling CGPA page load...');
    
    // Try to extract CGPA
    const cgpa = await this.extractCGPAFromCurrentPage();
    
    if (cgpa) {
      // Success!
      // this.addBotMessage('✅ CGPA page loaded successfully!');
      this.displayCGPA(cgpa);
      this.chatState.isWaitingForCGPA = false;
      this.saveChatState();
    } else {
      // Retry logic
      this.chatState.cgpaRetryCount++;
      
      if (this.chatState.cgpaRetryCount < this.maxRetries) {
        this.addBotMessage(`🔄 CGPA not found yet. Retrying... (${this.chatState.cgpaRetryCount}/${this.maxRetries})`);
        this.saveChatState();
        
        // Try clicking CGPA link again
        setTimeout(() => {
          const cgpaLink = this.findCGPALink();
          if (cgpaLink) {
            cgpaLink.click();
          } else {
            this.handleCGPAFailure();
          }
        }, 2000);
      } else {
        this.handleCGPAFailure();
      }
    }
  }

  handleCGPAFailure() {
    this.addBotMessage('❌ Unable to fetch CGPA after multiple attempts.<br><br>Please check:<br>• Are you logged into ERP?<br>• Is the CGPA page accessible?<br>• Try refreshing and asking again.');
    this.chatState.isWaitingForCGPA = false;
    this.chatState.cgpaRetryCount = 0;
    this.saveChatState();
  }

  async extractCGPAFromCurrentPage() {
    // console.log('Extracting CGPA from current page...');
    
    // Wait for page to fully load
    await this.wait(3000);
    
    // Multiple extraction strategies
    let cgpa = null;
    
    // Strategy 1: CGPA sections
    cgpa = this.extractFromCGPASection();
    if (cgpa) return cgpa;
    
    // Strategy 2: Tables
    cgpa = this.extractFromTables();
    if (cgpa) return cgpa;
    
    // Strategy 3: Page text
    cgpa = this.extractFromPageText();
    if (cgpa) return cgpa;
    
    // Strategy 4: All elements with numbers
    cgpa = this.extractFromNumericElements();
    if (cgpa) return cgpa;
    
    return null;
  }

  extractFromCGPASection() {
    const selectors = [
      '.exam-student-course-external-total-consolidated-marks-info-index',
      '[class*="cgpa"]',
      '[class*="gpa"]',
      '[id*="cgpa"]',
      '[id*="gpa"]',
      '.cgpa-section',
      '.gpa-display'
    ];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const cgpa = this.findCGPAInText(element.textContent);
        if (cgpa) return cgpa;
      }
    }
    return null;
  }

  extractFromTables() {
    const tables = document.querySelectorAll('table');
    for (const table of tables) {
      const text = table.textContent.toLowerCase();
      if (text.includes('cgpa') || text.includes('gpa') || text.includes('grade point')) {
        const cgpa = this.findCGPAInText(table.textContent);
        if (cgpa) return cgpa;
      }
    }
    return null;
  }

  extractFromPageText() {
    const pageText = document.body.textContent;
    return this.findCGPAInText(pageText);
  }

  extractFromNumericElements() {
    const elements = document.querySelectorAll('*');
    for (const element of elements) {
      if (element.children.length === 0) {
        const text = element.textContent.trim();
        if (/\d+\.\d{1,2}/.test(text)) {
          const cgpa = this.findCGPAInText(element.parentElement.textContent);
          if (cgpa) return cgpa;
        }
      }
    }
    return null;
  }

  findCGPAInText(text) {
    const patterns = [
      /(?:cgpa|gpa)[\s:=]+(\d+\.?\d*)/i,
      /(\d+\.\d{1,2})(?=.*(?:cgpa|gpa|grade.*point))/i,
      /grade.*point.*average[\s:=]+(\d+\.?\d*)/i,
      /(?:cgpa|gpa|grade|point|average)[\s\S]{0,50}?(\d+\.\d{1,2})/i,
      /(\d+\.\d{1,2})[\s\S]{0,50}?(?:cgpa|gpa|grade.*point)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        if (value >= 0 && value <= 10) {
          return match[1];
        }
      }
    }
    
    // Fallback pattern matching
    const keywords = ['cgpa', 'gpa', 'grade', 'point', 'average'];
    const numberRegex = /\b\d+\.\d{1,2}\b/g;
    let match;
    
    while ((match = numberRegex.exec(text)) !== null) {
      const num = parseFloat(match[0]);
      if (num >= 0 && num <= 10) {
        const start = Math.max(0, match.index - 100);
        const end = Math.min(text.length, match.index + match[0].length + 100);
        const surrounding = text.slice(start, end).toLowerCase();
        
        if (keywords.some(keyword => surrounding.includes(keyword))) {
          return match[0];
        }
      }
    }
    
    return null;
  }

  findCGPALink() {
    const selectors = [
      '#mainlayout_sidenav a',
      '.sidebar a',
      '.navigation a',
      '.menu a',
      'nav a',
      'a[href*="cgpa"]',
      'a[href*="searchgetmycgpa"]'
    ];
    
    for (const selector of selectors) {
      const links = document.querySelectorAll(selector);
      for (const link of links) {
        const text = link.textContent.trim().toLowerCase();
        const href = link.getAttribute('href') || '';
        
        if (text.includes('my cgpa') || 
            text.includes('cgpa') || 
            href.includes('searchgetmycgpa') ||
            href.includes('cgpa')) {
          return link;
        }
      }
    }
    return null;
  }

  displayCGPA(cgpaValue) {
    const messages = [
      ` <strong>Your CGPA is ${cgpaValue}</strong><br><br>Excellent work! Keep it up! ✨`,
      ` <strong>CGPA: ${cgpaValue}</strong><br><br>Great achievement! 🌟`,
      ` <strong>Your CGPA: ${cgpaValue}</strong><br><br>Outstanding performance! 🏆`
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    this.addBotMessage(randomMessage);
  }

  restoreMessages() {
    this.chatMessages.innerHTML = '';
    this.chatState.messages.forEach(msg => {
      if (msg.type === 'user') {
        const userMessage = document.createElement('div');
        userMessage.textContent = msg.content;
        userMessage.style.cssText = `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; margin-left: 20%; border-radius: 18px 18px 5px 18px;
          padding: 10px 14px; margin-bottom: 8px; max-width: 75%; word-wrap: break-word;
        `;
        this.chatMessages.appendChild(userMessage);
      } else {
        const botMessage = document.createElement('div');
        botMessage.innerHTML = msg.content;
        botMessage.style.cssText = `
          background-color: #f3f4f6; color: #374151; margin-right: 20%;
          border-radius: 18px 18px 18px 5px; padding: 10px 14px; margin-bottom: 8px;
          max-width: 75%; word-wrap: break-word;
        `;
        this.chatMessages.appendChild(botMessage);
      }
    });
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  async saveChatState() {
    await chrome.storage.sync.set({ chatState: this.chatState });
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

// Initialize chatbot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ChatbotExtension());
} else {
  new ChatbotExtension();
}