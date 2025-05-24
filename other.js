const musicFiles = [
  'background_music.mp3'
];

let currentAudio = null;
let currentTrack = 0;
let playerContainer = null;

function createMusicPlayer() {
  if (document.querySelector('#music-player')) return;

  // Select the first div
  const firstDiv = document.querySelector('.col-sm-4.col-md-4.col-lg-3[style*="float:left"]');
  if (!firstDiv) return;

  // Select the second div and verify it's the next sibling
  const secondDiv = firstDiv.nextElementSibling;
  if (!secondDiv || !secondDiv.classList.contains('col-sm-6') || 
      !secondDiv.classList.contains('col-md-6') || 
      !secondDiv.classList.contains('col-lg-7')) return;

  // Find the user info div (third div)
  const userDiv = document.querySelector('.col-sm-2.col-md-2.col-lg-2[style*="display: flex"]');
  
  // Create a wrapper container to hold both music player and user info
  const wrapperContainer = document.createElement('div');
  wrapperContainer.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 20px;
  `;

  // Create the player container with initial size
  playerContainer = document.createElement('div');
  playerContainer.id = 'music-player';
  
  // Initial styling - will be updated dynamically
  updatePlayerSize(0); // Start with 0 buttons

  // Remove duplicates from musicFiles array
  const uniqueMusicFiles = [...new Set(musicFiles)];
  let validSongsCount = 0;

  // Create buttons for each unique track
  uniqueMusicFiles.forEach((file, index) => {
    const testAudio = new Audio(chrome.runtime.getURL(file));
    testAudio.addEventListener('canplaythrough', () => {
      validSongsCount++;
      createButton(validSongsCount, index);
      updatePlayerSize(validSongsCount);
    }, { once: true });
    testAudio.addEventListener('error', () => {
      console.log(`Music file ${file} not found, skipping button ${index + 1}`);
    }, { once: true });
    testAudio.load();
  });

  function updatePlayerSize(buttonCount) {
    if (!playerContainer) return;
    
    // Calculate dynamic width based on number of buttons
    const baseWidth = 40;
    const buttonWidth = 32;
    const gapWidth = 6;
    const totalWidth = baseWidth + (buttonCount * buttonWidth) + ((buttonCount - 1) * gapWidth);
    
    // Minimum width of 60px, maximum reasonable width
    const finalWidth = Math.max(60, Math.min(totalWidth, 400));
    
    playerContainer.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      width: ${finalWidth}px;
      height: 60px;
      max-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin: 0;
      overflow: hidden;
      box-sizing: border-box;
      transition: width 0.3s ease;
    `;
  }

  function createButton(buttonNumber, trackIndex) {
    const button = document.createElement('button');
    button.innerHTML = buttonNumber;
    button.style.cssText = `
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid white;
      background: rgba(255,255,255,0.2);
      color: white;
      font-weight: bold;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    `;

    button.addEventListener('click', () => {
      playTrack(trackIndex);
    });

    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(255,255,255,0.4)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(255,255,255,0.2)';
    });

    playerContainer.appendChild(button);
  }

  // Remove the second div and replace the first div with wrapper containing both player and user info
  secondDiv.remove();
  
  // Add music player to wrapper
  wrapperContainer.appendChild(playerContainer);
  
  // Add user info to wrapper (if it exists)
  if (userDiv) {
    const userDivClone = userDiv.cloneNode(true);
    wrapperContainer.appendChild(userDivClone);
    userDiv.remove();
  }
  
  // Replace first div with wrapper
  firstDiv.parentNode.replaceChild(wrapperContainer, firstDiv);
}

function playTrack(trackIndex) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.remove();
  }

  const uniqueMusicFiles = [...new Set(musicFiles)];
  if (trackIndex >= uniqueMusicFiles.length) return;

  currentTrack = trackIndex;
  
  currentAudio = document.createElement('audio');
  currentAudio.src = chrome.runtime.getURL(uniqueMusicFiles[trackIndex]);
  currentAudio.loop = true;
  currentAudio.volume = 0.3;
  currentAudio.style.display = 'none';
  
  document.body.appendChild(currentAudio);
  
  currentAudio.play().catch(() => {
    document.addEventListener('click', () => {
      currentAudio.play();
    }, { once: true });
  });
}
function hideFooter() {
  const footer = document.querySelector('#mainlayout_footer');
  if (footer) {
    footer.style.display = 'none';
  }
}
hideFooter();
function modifyLayout() {
  // Add image to text-center div
  const textCenterDiv = document.querySelector('.text-center[style*="font-size:20px;margin-top:30px;"]');
  const userImg = document.querySelector('.col-sm-2.col-md-2.col-lg-2 .mainlayout_user img');
  if (textCenterDiv && userImg) {
    const clonedImg = userImg.cloneNode(true);
    clonedImg.style.width = '30px';
    clonedImg.style.height = '30px';
    clonedImg.style.borderRadius = '50%';
    clonedImg.style.marginRight = '10px';
    textCenterDiv.insertBefore(clonedImg, textCenterDiv.firstChild);
  }

  // Make navbar transparent and hide it
  const navbar = document.querySelector('.navbar-inverse.navbar');
  if (navbar) {
    navbar.style.setProperty('background-color', 'transparent', 'important');
    navbar.style.setProperty('border-color', 'transparent', 'important');
    navbar.style.display = 'none';
  }

  // Change logout button color to black
  const logoutButton = document.querySelector('.btn.btn-link.logout');
  if (logoutButton) {
    logoutButton.style.color = 'black';
  }

  // Hide brand_logo
  const brandLogo = document.querySelector('#brand_logo');
  if (brandLogo) {
    brandLogo.style.display = 'none';
  }

  // Hide the specific div with col-sm-2 col-md-2 col-lg-2 classes and flex styles
  const targetDiv = document.querySelector('.col-sm-2.col-md-2.col-lg-2[style*="display: flex"][style*="align-items: center"][style*="justify-content: end"]');
  if (targetDiv) {
    targetDiv.style.display = 'none';
  }

  // Hide navbar-collapse and move logout to header
  const navbarCollapse = document.querySelector('#navbar-collapse.collapse.navbar-collapse');
  if (navbarCollapse) {
    navbarCollapse.style.display = 'none';
  }

  // Copy logout ul and place it in the header
  const logoutUl = document.querySelector('#w0.navbar-nav.navbar-right.nav');
  const mainLayoutHeader = document.querySelector('#mainlayout_header');
  
  if (logoutUl && mainLayoutHeader) {
    // Clone the logout ul
    const clonedLogoutUl = logoutUl.cloneNode(true);
    
    // Style the cloned logout for header placement
    clonedLogoutUl.style.cssText = `
      background-color: transparent;
      position: absolute;
      top: 50%;
      right: 20px;
      transform: translateY(-50%);
      margin: 0;
      padding: 0;
      list-style: none;
    `;
    
    // Make sure the header has relative positioning
    mainLayoutHeader.style.position = 'relative';
    
    // Add the cloned logout to the header
    mainLayoutHeader.appendChild(clonedLogoutUl);
  }

  // Change mainlayout_header background color to white and reduce height
  if (mainLayoutHeader) {
    mainLayoutHeader.style.backgroundColor = 'white';
    mainLayoutHeader.style.height = '60px';
    mainLayoutHeader.style.minHeight = '60px';
    mainLayoutHeader.style.maxHeight = '60px';
    mainLayoutHeader.style.overflow = 'hidden';
  }
}

modifyLayout();
// Run the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', modifyLayout);

function initMusicPlayer() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(createMusicPlayer, 1000);
      setTimeout(() => {
        playTrack(0);
      }, 1500);
    });
  } else {
    setTimeout(createMusicPlayer, 1000);
    setTimeout(() => {
      playTrack(0);
    }, 1500);
  }
}

initMusicPlayer();

const observer = new MutationObserver(() => {
  if (!document.querySelector('#music-player')) {
    setTimeout(createMusicPlayer, 500);
  }
});

setTimeout(() => {
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
}, 2000);