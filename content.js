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
    
    // Inject CSS for left-to-right animation
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
    `;
    document.head.appendChild(style);
  } else {
    console.warn('Header div with red background not found.');
  }

  // Select the Login link for rainbow glow
  const loginLink = document.querySelector('a.btn.btn-link.tcrudjax[value="/index.php?r=site%2Flogin"]');
  if (loginLink) {
    loginLink.classList.add('rainbow-glow');
  } else {
    console.warn('Login link not found.');
  }

  // Hide About Us and Contact Us links
  const aboutLink = document.querySelector('a.btn.btn-link.crudjax2[value="/index.php?r=site%2Fabout"]');
  const contactLink = document.querySelector('a.btn.btn-link.crudjax2[value="/index.php?r=site%2Fcontact"]');
  
  if (aboutLink) {
    aboutLink.style.display = 'none';
  } else {
    console.warn('About Us link not found.');
  }
  
  if (contactLink) {
    contactLink.style.display = 'none';
  } else {
    console.warn('Contact Us link not found.');
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

  // Make circular_nav background transparent with blur effect
  const circularNav = document.querySelector('#circle_section .circular_nav');
  if (circularNav) {
    circularNav.style.setProperty('background', 'transparent', 'important'); // Override !important
  } else {
    console.warn('circular_nav element not found within #circle_section.');
  }
  // Remove all row elements inside container-fluid hidden-xs
  const container = document.querySelector('.container-fluid.hidden-xs');
  if (container) {
    const rows = container.querySelectorAll('.row');
    if (rows.length > 0) {
      rows.forEach(row => {
        row.remove();
      });
      console.log(`Removed ${rows.length} row elements.`);
    } else {
      console.warn('No row elements found inside container-fluid hidden-xs.');
    }
  } else {
    console.warn('container-fluid hidden-xs section not found on the page.');
  }
}

// Function to hide all li items in ul.nav except the Erp Login item
function hideNavItems() {
  const navItems = document.querySelectorAll('#circle_section ul.nav li');
  if (navItems.length > 0) {
    let hiddenCount = 0;
    navItems.forEach(item => {
      // Check if the item is NOT the Erp Login li
      const isErpLogin = item.classList.contains('center') && item.getAttribute('title') === 'Erp Login';
      if (!isErpLogin) {
        item.style.display = 'none';
        hiddenCount++;
      }
    });
    console.log(`Hidden ${hiddenCount} navigation items.`);
  } else {
    console.warn('No li items found in ul.nav within #circle_section.');
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
  console.log('Initializing Zoro extension...');
  styleHeaderLinks();
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