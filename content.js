// Function to style header links and header background (rainbow glow, hide links, animated GIF)
function styleHeaderLinks() {
  // Select the header div
  const headerDiv = document.querySelector('div[style*="background-color:#a51c24"]');
  if (headerDiv) {
    // Remove the red background and set animated GIF
    headerDiv.style.backgroundColor = 'transparent';
    headerDiv.style.backgroundImage = `url('${chrome.runtime.getURL('runner.gif')}')`;
    headerDiv.style.backgroundSize = 'auto 40px'; // Slightly smaller to fit better
    headerDiv.style.backgroundPosition = '-100px center'; // Start off-screen left
    headerDiv.style.backgroundRepeat = 'no-repeat';
    headerDiv.style.position = 'relative';
    headerDiv.style.overflow = 'hidden'; // Hide overflow for clean animation
    
    // Add unique class for targeting
    headerDiv.classList.add('zoro-header');
    
    // Inject CSS for left-to-right animation and other styles
    const existingStyle = document.head.querySelector('#zoro-animation-styles');
    if (existingStyle) {
      existingStyle.remove(); // Remove old styles to prevent conflicts
    }
    
    const style = document.createElement('style');
    style.id = 'zoro-animation-styles';
    style.textContent = `
      .zoro-header {
        animation: zoroRun 8s linear infinite !important;
      }
      
      @keyframes zoroRun {
        0% { 
          background-position: -100px center; 
        }
        100% { 
          background-position: calc(100vw + 100px) center; 
        }
      }
      
      /* Rainbow glow animation for login link */
      .rainbow-glow {
        color: #fff !important;
        animation: rainbowGlow 3s linear infinite !important;
        font-weight: bold !important;
      }
      
      @keyframes rainbowGlow {
        0% { text-shadow: 0 0 8px #ff0000, 0 0 15px #ff0000, 0 0 20px #ff0000; }
        14% { text-shadow: 0 0 8px #ff9900, 0 0 15px #ff9900, 0 0 20px #ff9900; }
        28% { text-shadow: 0 0 8px #33cc33, 0 0 15px #33cc33, 0 0 20px #33cc33; }
        42% { text-shadow: 0 0 8px #00ccff, 0 0 15px #00ccff, 0 0 20px #00ccff; }
        57% { text-shadow: 0 0 8px #3366ff, 0 0 15px #3366ff, 0 0 20px #3366ff; }
        71% { text-shadow: 0 0 8px #cc33cc, 0 0 15px #cc33cc, 0 0 20px #cc33cc; }
        85% { text-shadow: 0 0 8px #ff3399, 0 0 15px #ff3399, 0 0 20px #ff3399; }
        100% { text-shadow: 0 0 8px #ff0000, 0 0 15px #ff0000, 0 0 20px #ff0000; }
      }
      
      /* Enhanced page styling */
      body {
        background-image: url('${chrome.runtime.getURL('back.png')}') !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
        background-attachment: fixed !important;
      }
      
      #circle_section .circular_nav {
        background: transparent !important;
      }
      
      /* Hide footer div */
      div[style*="bottom: 0"][style*="position: absolute"][style*="background-color: #a51c24"] {
        display: none !important;
      }
      
      /* Hide modal header logo div */
      .modal-header div[style*="margin-top:-35px"][style*="text-align:center"] {
        display: none !important;
      }
      
      /* Hide modal footer with copyright notice */
      .modal-footer {
        display: none !important;
      }
      
      /* Remove red border from modal */
      .modal-content, .modal-dialog {
        border: none !important;
        border-color: transparent !important;
      }
      
      /* Style for follow checkbox */
      .follow-checkbox-container {
        margin-bottom: 15px;
      }
      .follow-checkbox-container label {
        position: relative;
        display: inline-block;
        cursor: pointer;
      }
      .follow-checkbox-container input[type="checkbox"] {
        margin-right: 8px;
      }
      .follow-checkbox-container label:hover::after {
        content: "Only allowed to login if followed me in LinkedIn";
        position: absolute;
        top: 100%;
        left: 0;
        background: #333;
        color: #fff;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 10;
      }
      /* Disabled form elements */
      .form-disabled input:not(#follow-checkbox),
      .form-disabled button,
      .form-disabled a.btn {
        pointer-events: none !important;
        opacity: 0.5 !important;
      }
      .form-disabled input:not(#follow-checkbox) {
        background-color: #f0f0f0 !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Select the Login link for rainbow glow
  const loginLink = document.querySelector('a.btn.btn-link.tcrudjax[value="/index.php?r=site%2Flogin"]');
  if (loginLink) {
    loginLink.classList.add('rainbow-glow');
  }

  // Hide About Us and Contact Us links
  const aboutLink = document.querySelector('a.btn.btn-link.crudjax2[value="/index.php?r=site%2Fabout"]');
  const contactLink = document.querySelector('a.btn.btn-link.crudjax2[value="/index.php?r=site%2Fcontact"]');
  if (aboutLink) {
    aboutLink.style.display = 'none';
  }
  if (contactLink) {
    contactLink.style.display = 'none';
  }
}

// Function to customize modal headers (hide logo, hide footer, remove red border)
function customizeModal() {
  // Select all modal headers
  const modalHeaders = document.querySelectorAll('.modal-header');
  modalHeaders.forEach(header => {
    // Hide logo div (already handled by CSS, but ensure dynamic updates)
    const logoDiv = header.querySelector('div[style*="margin-top:-35px"][style*="text-align:center"]');
    if (logoDiv) {
      logoDiv.style.display = 'none';
    }
  });

  // Hide modal footers (already handled by CSS, but ensure dynamic updates)
  const modalFooters = document.querySelectorAll('.modal-footer');
  modalFooters.forEach(footer => {
    footer.style.display = 'none';
  });

  // Remove red border from modals (already handled by CSS, but ensure dynamic updates)
  const modalContents = document.querySelectorAll('.modal-content, .modal-dialog');
  modalContents.forEach(element => {
    element.style.border = 'none';
    element.style.borderColor = 'transparent';
  });
}

// Function to add follow checkbox and control form interactivity
function addFollowCheckbox() {
  const form = document.querySelector('#login-form');
  if (!form) return;

  // Check if checkbox already exists to avoid duplicates
  if (form.querySelector('#follow-checkbox')) return;

  // Create checkbox container
  const checkboxContainer = document.createElement('div');
  checkboxContainer.className = 'form-group follow-checkbox-container';
  checkboxContainer.innerHTML = `
    <label>
      <input type="checkbox" id="follow-checkbox"> Did u followed on <a href="https://www.linkedin.com/in/bejawada-sai-mahendra-b18289212/" style="text-decoration: none;color:black;" target="_blank">linkedin</a> ?
    </label>
  `;

  // Insert before username field
  const usernameField = form.querySelector('.field-loginFormUserNameID');
  if (usernameField) {
    form.insertBefore(checkboxContainer, usernameField);
  } else {
    form.prepend(checkboxContainer);
  }

  // Function to toggle form interactivity
  function toggleFormInteractivity() {
    const checkbox = document.querySelector('#follow-checkbox');
    const inputs = form.querySelectorAll('input:not(#follow-checkbox)');
    const buttons = form.querySelectorAll('button');
    const links = form.querySelectorAll('a.btn');

    if (checkbox.checked) {
      form.classList.remove('form-disabled');
      inputs.forEach(input => {
        input.removeAttribute('disabled');
        input.style.backgroundColor = '';
      });
      buttons.forEach(button => {
        button.style.pointerEvents = '';
        button.style.opacity = '';
      });
      links.forEach(link => {
        link.style.pointerEvents = '';
        link.style.opacity = '';
      });
    } else {
      form.classList.add('form-disabled');
      inputs.forEach(input => {
        input.setAttribute('disabled', 'disabled');
      });
      buttons.forEach(button => {
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.5';
      });
      links.forEach(link => {
        link.style.pointerEvents = 'none';
        link.style.opacity = '0.5';
      });
    }
  }

  // Initial state: disable form
  toggleFormInteractivity();

  // Add event listener for checkbox changes
  const checkbox = document.querySelector('#follow-checkbox');
  if (checkbox) {
    checkbox.addEventListener('change', toggleFormInteractivity);
  }
}

// Function to set full-page background, make circular_nav transparent, and remove row elements
function customizePageStyles() {
  // Set full-page background on body (now handled in CSS above for better performance)
  document.body.style.backgroundImage = `url('${chrome.runtime.getURL('back.png')}')`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.style.backgroundAttachment = 'fixed';

  // Make circular_nav background transparent
  const circularNav = document.querySelector('#circle_section .circular_nav');
  if (circularNav) {
    circularNav.style.setProperty('background', 'transparent', 'important');
  }

  // Remove all row elements inside container-fluid hidden-xs
  const container = document.querySelector('.container-fluid.hidden-xs');
  if (container) {
    const rows = container.querySelectorAll('.row');
    if (rows.length > 0) {
      rows.forEach(row => row.remove());
    }
  }
}

// Function to hide all li items in ul.nav except the Erp Login item
function hideNavItems() {
  const navItems = document.querySelectorAll('#circle_section ul.nav li');
  if (navItems.length > 0) {
    navItems.forEach(item => {
      const isErpLogin = item.classList.contains('center') && item.getAttribute('title') === 'Erp Login';
      if (!isErpLogin) {
        item.style.display = 'none';
      }
    });
  }
}

// Function to ensure animations are running
function ensureAnimations() {
  const headerDiv = document.querySelector('.zoro-header');
  if (headerDiv) {
    // Force animation restart if needed
    headerDiv.style.animation = 'none';
    setTimeout(() => {
      headerDiv.style.animation = 'zoroRun 8s linear infinite';
    }, 10);
  }
}

// Initialize all functions
function initializeExtension() {
  styleHeaderLinks();
  customizeModal();
  addFollowCheckbox();
  customizePageStyles();
  hideNavItems();
  
  // Ensure animations start after a brief delay
  setTimeout(ensureAnimations, 500);
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

// Observe for dynamic content changes with debouncing
let observerTimeout;
const observer = new MutationObserver(() => {
  clearTimeout(observerTimeout);
  observerTimeout = setTimeout(() => {
    styleHeaderLinks();
    customizeModal();
    addFollowCheckbox();
    customizePageStyles();
    hideNavItems();
  }, 100); // Debounce to prevent excessive calls
});

// Start observing after initial load
setTimeout(() => {
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });
}, 1000);