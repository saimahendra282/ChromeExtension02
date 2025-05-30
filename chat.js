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
    this.logoutObserver = null;

    this.init();
  }

  async init() {
    const result = await chrome.storage.sync.get(['userId', 'chatState']);
    
    if (result.userId) {
      this.userId = result.userId;
    }
    if (result.chatState) {
      this.chatState = { ...this.chatState, ...result.chatState, isOpen: false };
    }

    if (!this.userId) {
      this.userId = this.getUserIdFromDOM();
      if (this.userId) {
        chrome.storage.sync.set({ userId: this.userId });
      } else {
        this.userId = 'User';
      }
    }

    this.determineStudentYear(); // Call the new method here

    if (this.chatState.isWaitingForCGPA) {
      setTimeout(() => this.handleCGPAPageLoad(), 2000);
    }

    this.createChatElements();
    this.setupEventListeners();
    this.setupMessageListener();
    this.setupLogoutListener();
    this.isInitialized = true;

    setTimeout(() => this.openChat(), 1000);
  }

  determineStudentYear() {
    // Check if userId is valid
    if (this.userId === 'User' || isNaN(this.userId)) {
      console.log('Invalid user ID for year calculation');
      return;
    }

    // Extract starting year from userId (e.g., "22" -> 2022)
    const idPrefix = this.userId.substring(0, 2);
    const startingYear = 2000 + parseInt(idPrefix);

    // Get current date and determine the academic year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const academicYearStartMonth = 9; // Assume academic year starts in September

    // Determine the start year of the current academic year
    let academicYearStart;
    if (currentMonth >= academicYearStartMonth) {
      academicYearStart = currentYear;
    } else {
      academicYearStart = currentYear - 1;
    }

    // Calculate the student's year
    const studentYear = (academicYearStart - startingYear) + 1;

    // Handle edge cases and log the result
    if (studentYear < 1) {
      console.log('You have not started college yet');
    } else if (studentYear > 4) {
      console.log('You have graduated or are beyond 4th year');
    } else {
      console.log(`You are a ${studentYear} year student`);
    }
  }

  // Rest of the class remains unchanged
  setupLogoutListener() {
    const logoutSelectors = [
      'button[type="submit"].btn.btn-link.logout.pull-right',
      'button.btn.btn-link.logout.pull-right',
      'button.logout',
      '#w0.navbar-nav.navbar-right.nav button[type="submit"].btn.btn-link.logout.pull-right',
      '#w0 button.logout',
      '[style*="position: fixed"][style*="top: 10px"][style*="right: 10px"] button.logout',
      '[style*="position: fixed"] button[type="submit"].logout',
      '.logout',
      'button[type="submit"]',
      'a[href*="logout"]',
      'a.logout',
      '[onclick*="logout"]',
      'form[action*="logout"] button',
      'form[action*="logout"] input[type="submit"]'
    ];

    const attachListener = (element, selector) => {
      if (element && !element.hasAttribute('data-chat-logout-listener')) {
        element.setAttribute('data-chat-logout-listener', 'true');
        element.addEventListener('click', this.handleLogoutClick.bind(this));
        if (element.tagName.toLowerCase() === 'form') {
          element.addEventListener('submit', this.handleLogoutClick.bind(this));
        }
        const parentForm = element.closest('form');
        if (parentForm && !parentForm.hasAttribute('data-chat-logout-listener')) {
          parentForm.setAttribute('data-chat-logout-listener', 'true');
          parentForm.addEventListener('submit', this.handleLogoutClick.bind(this));
        }
        return true;
      }
      return false;
    };

    const isLogoutElement = (element) => {
      const text = element.textContent.toLowerCase();
      const className = element.className.toLowerCase();
      const id = element.id.toLowerCase();
      const href = element.getAttribute('href') || '';
      const onclick = element.getAttribute('onclick') || '';
      const action = element.getAttribute('action') || '';
      return (
        className.includes('logout') ||
        id.includes('logout') ||
        text.includes('logout') ||
        text.includes('log out') ||
        text.includes('sign out') ||
        href.includes('logout') ||
        onclick.includes('logout') ||
        action.includes('logout') ||
        element.querySelector('.fa-user-lock') ||
        element.querySelector('[class*="logout"]')
      );
    };

    const scanForLogoutButtons = () => {
      let found = false;
      logoutSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            if (isLogoutElement(element)) {
              if (attachListener(element, selector)) {
                found = true;
              }
            }
          });
        } catch (e) {}
      });
      const allButtons = document.querySelectorAll('button, a, input[type="submit"], form');
      allButtons.forEach(element => {
        if (isLogoutElement(element)) {
          if (attachListener(element, 'text-based detection')) {
            found = true;
          }
        }
      });
      return found;
    };

    scanForLogoutButtons();
    setTimeout(() => scanForLogoutButtons(), 2000);
    setTimeout(() => scanForLogoutButtons(), 5000);

    if (this.logoutObserver) {
      this.logoutObserver.disconnect();
    }
    this.logoutObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (isLogoutElement(node)) {
              attachListener(node, 'mutation observer - direct');
            }
            if (node.querySelectorAll) {
              logoutSelectors.forEach(selector => {
                try {
                  const elements = node.querySelectorAll(selector);
                  elements.forEach(element => {
                    if (isLogoutElement(element)) {
                      attachListener(element, `mutation observer - ${selector}`);
                    }
                  });
                } catch (e) {}
              });
              const allInteractiveElements = node.querySelectorAll('button, a, input[type="submit"], form');
              allInteractiveElements.forEach(element => {
                if (isLogoutElement(element)) {
                  attachListener(element, 'mutation observer - interactive');
                }
              });
            }
          }
        });
      });
    });

    this.logoutObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'onclick', 'href']
    });
  }

  handleLogoutClick(event) {
    this.resetChat();
    setTimeout(() => {}, 100);
  }

  async resetChat() {
    try {
      this.chatState = {
        isOpen: false,
        messages: [],
        hasWelcomed: false,
        isWaitingForCGPA: false,
        cgpaRetryCount: 0
      };
      await chrome.storage.sync.remove(['chatState', 'userId']);
      this.userId = null;
      if (this.chatMessages) {
        this.chatMessages.innerHTML = '';
      }
      if (this.chatWindow && this.chatWindow.style.display === 'flex') {
        this.closeChat();
      }
      if (this.logoutObserver) {
        this.logoutObserver.disconnect();
        this.logoutObserver = null;
      }
    } catch (error) {}
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'extractCGPA') {
        extractCGPAFromCurrentPage().then(cgpa => {
          sendResponse({ cgpa: cgpa });
        });
        return true;
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
    const existingButton = document.getElementById('chat-button');
    const existingWindow = document.getElementById('chat-window');
    if (existingButton) existingButton.remove();
    if (existingWindow) existingWindow.remove();

    this.chatButton = document.createElement('div');
    this.chatButton.id = 'chat-button';
    this.chatButton.innerHTML = `<img src="${this.getIconUrl()}" alt="Chat Icon" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">`;
    this.chatButton.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px;
      border-radius: 50%; cursor: pointer; z-index: 10000; box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      transition: transform 0.2s ease;
    `;

    this.chatWindow = document.createElement('div');
    this.chatWindow.id = 'chat-window';
    this.chatWindow.style.cssText = `
      display: none; position: fixed; bottom: 90px; right: 20px;
      width: 320px; height: 450px; background-color: white; border-radius: 15px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3); flex-direction: column; z-index: 10001; overflow: hidden;
    `;

    const chatHeader = document.createElement('div');
    chatHeader.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; padding: 15px; display: flex; justify-content: space-between;
      align-items: center; font-weight: bold; font-size: 16px;
    `;
    chatHeader.innerHTML = `
      <div style="display: flex; align-items: center;">
        <div style="width: 8px; height: 8px; background-color: #4ade80; border-radius: 50%; margin-right: 8px;"></div>
        <span>ERP AI</span>
      </div>
      <button id="chat-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">✖</button>
    `;

    this.chatMessages = document.createElement('div');
    this.chatMessages.id = 'chat-messages';
    this.chatMessages.style.cssText = `
      flex-grow: 1; padding: 15px; overflow-y: auto; font-size: 14px; line-height: 1.4;
    `;

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
        color: white; borderKalamata olivesborder: none; border-radius: 20px; cursor: pointer; font-size: 14px;
      ">Send</button>
    `;

    this.chatWindow.appendChild(chatHeader);
    this.chatWindow.appendChild(this.chatMessages);
    this.chatWindow.appendChild(chatInputContainer);

    document.body.appendChild(this.chatButton);
    document.body.appendChild(this.chatWindow);

    this.restoreMessages();
  }

  getIconUrl() {
    return chrome.runtime?.getURL('chat-icon.png');
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
    if (lowerMessage.includes('cgpa')) {
      this.handleCGPAQuery();
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      this.addBotMessage('Namaskaram sishya, i am a chatbot created to assist you ');
    } else {
      this.addBotMessage('Ask me anything related to this erp like calculating attendence when u bunked classes 😜, just name it');
    }
  }

  async handleCGPAQuery() {
    this.addBotMessage('Fetching your CGPA... 🔍');
    let cgpa = await extractCGPAFromCurrentPage();
    if (cgpa) {
      this.displayCGPA(cgpa);
      return;
    }
    const cgpaLink = findCGPALink();
    if (!cgpaLink) {
      this.addBotMessage('❌ No "My CGPA" link found. Please make sure you\'re on the ERP main page.');
      return;
    }
    this.chatState.isWaitingForCGPA = true;
    this.chatState.cgpaRetryCount = 0;
    this.saveChatState();
    this.addBotMessage('Navigating to CGPA page... ⏳<br><small>Please wait while the page loads...</small>');
    setTimeout(() => {
      cgpaLink.click();
    }, 1000);
  }

  async handleCGPAPageLoad() {
    const cgpa = await extractCGPAFromCurrentPage();
    if (cgpa) {
      this.displayCGPA(cgpa);
      this.chatState.isWaitingForCGPA = false;
      this.saveChatState();
    } else {
      this.chatState.cgpaRetryCount++;
      if (this.chatState.cgpaRetryCount < this.maxRetries) {
        this.addBotMessage(`🔄 CGPA not found yet. Retrying... (${this.chatState.cgpaRetryCount}/${this.maxRetries})`);
        this.saveChatState();
        setTimeout(() => {
          const cgpaLink = findCGPALink();
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
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ChatbotExtension());
} else {
  new ChatbotExtension();
}