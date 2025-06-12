const musicFiles = [
  'slava.mp3',
  'background_music.mp3'
];

let currentAudio = null;
let currentTrack = 0;
let playerContainer = null;

function createMusicPlayer() {
  if (document.querySelector('#music-player')) return;

  const firstDiv = document.querySelector('.col-sm-4.col-md-4.col-lg-3[style*="float:left"]');
  if (!firstDiv) return;

  const secondDiv = firstDiv.nextElementSibling;
  if (!secondDiv || !secondDiv.classList.contains('col-sm-6') || 
      !secondDiv.classList.contains('col-md-6') || 
      !secondDiv.classList.contains('col-lg-7')) return;

  const userDiv = document.querySelector('.col-sm-2.col-md-2.col-lg-2[style*="display: flex"]');
  
  const wrapperContainer = document.createElement('div');
  wrapperContainer.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 20px;
  `;

  playerContainer = document.createElement('div');
  playerContainer.id = 'music-player';
  
  updatePlayerSize(0);

  const uniqueMusicFiles = [...new Set(musicFiles)];
  let validSongsCount = 0;

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
    
    const baseWidth = 40;
    const buttonWidth = 32;
    const gapWidth = 6;
    const totalWidth = baseWidth + (buttonCount * buttonWidth) + ((buttonCount - 1) * gapWidth);
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

    button.addEventListener('click', () => playTrack(trackIndex));
    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(255,255,255,0.4)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(255,255,255,0.2)';
    });

    playerContainer.appendChild(button);
  }

  secondDiv.remove();
  wrapperContainer.appendChild(playerContainer);
  
  if (userDiv) {
    const userDivClone = userDiv.cloneNode(true);
    wrapperContainer.appendChild(userDivClone);
    userDiv.remove();
  }
  
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

function modifyLayout() {
  // Hide navbar
  const navbar = document.querySelector('.navbar-inverse.navbar');
  if (navbar) {
    navbar.style.setProperty('background-color', 'transparent', 'important');
    navbar.style.setProperty('border-color', 'transparent', 'important');
    navbar.style.display = 'none';
  }

  // Style logout button
  const logoutButton = document.querySelector('.btn.btn-link.logout');
  if (logoutButton) {
    logoutButton.style.color = 'black';
  }

  // Hide brand logo
  const brandLogo = document.querySelector('#brand_logo');
  if (brandLogo) {
    brandLogo.style.display = 'none';
  }

  // Hide target div
  const targetDiv = document.querySelector('.col-sm-2.col-md-2.col-lg-2[style*="display: flex"][style*="align-items: center"][style*="justify-content: end"]');
  if (targetDiv) {
    targetDiv.style.display = 'none';
  }

  // Hide navbar collapse
  const navbarCollapse = document.querySelector('#navbar-collapse.collapse.navbar-collapse');
  if (navbarCollapse) {
    navbarCollapse.style.display = 'none';
  }

  // Move logout to top-right corner
  try {
    const logoutUl = document.querySelector('#w0.navbar-nav.navbar-right.nav');
    
    if (logoutUl) {
      const clonedLogoutUl = logoutUl.cloneNode(true);
      logoutUl.style.display = 'none';
      
      clonedLogoutUl.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 9999;
        background-color: transparent;
        margin: 0;
        padding: 0;
        list-style: none;
      `;
      
      document.body.appendChild(clonedLogoutUl);
    }
    
    // Style header
    const mainLayoutHeader = document.querySelector('#mainlayout_header');
    if (mainLayoutHeader) {
      mainLayoutHeader.style.backgroundColor = 'white';
      mainLayoutHeader.style.height = '60px';
      mainLayoutHeader.style.minHeight = '60px';
      mainLayoutHeader.style.maxHeight = '60px';
      mainLayoutHeader.style.overflow = 'hidden';
    }
  } catch (error) {
    console.error('Error in logout element script:', error);
  }
}

function createCardLayout() {
  const originalRow = document.querySelector('.row[style*="margin-top:70px"]');
  if (!originalRow) return;

  // Hide welcome message
  const welcomeDiv = document.querySelector('.text-center[style*="font-size:20px"][style*="margin-top:30px"]');
  if (welcomeDiv) {
    welcomeDiv.style.display = 'none';
  }

  // Get user data
  const userImg = document.querySelector('.col-sm-2.col-md-2.col-lg-2 .mainlayout_user img');
  const userImgSrc = userImg ? userImg.src : '';
  const userIdElement = document.querySelector('.mainlayout_user #loggedIn');
  const userId = userIdElement ? userIdElement.textContent.trim() : '';

  // Determine tag color based on first 2 digits of ID
  const firstTwoDigits = userId.substring(0, 2);
  let tagColor = '#FFD700'; // default yellow
  
  switch(firstTwoDigits) {
    case '22':
      tagColor = '#ecec18'; // yellow
      break;
    case '23':
      tagColor = '#e7191f'; // red
      break;
    case '24':
      tagColor = '#0000ff'; // teal
      break;
    default:
      tagColor = '#ffff00'; // default yellow
      break;
  }

  // Create lanyard container
  const lanyardContainer = document.createElement('div');
  lanyardContainer.style.cssText = `
    position: relative;
    margin: 20px auto;
    max-width: 400px;
    padding-top: 60px;
  `;

  // Create realistic fabric lanyard
  const lanyard = document.createElement('div');
  lanyard.style.cssText = `
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 15px;
    height: 60px;
    background: repeating-linear-gradient(
      90deg,
      #2c3e50 0px,
      #2c3e50 2px,
      #34495e 2px,
      #34495e 4px,
      #2c3e50 4px,
      #2c3e50 6px,
      #34495e 6px,
      #34495e 8px
    );
    border: 1px solid #1a252f;
    border-radius: 2px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    z-index: 5;
  `;

  // Create lanyard clip/hook
  const lanyardClip = document.createElement('div');
  lanyardClip.style.cssText = `
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 10px;
    height: 6px;
    background: #555;
    border-radius: 2px 2px 0 0;
    border: 1px solid #333;
    z-index: 6;
  `;

  // Create metal ring
  const metalRing = document.createElement('div');
  metalRing.style.cssText = `
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 12px;
    height: 12px;
    border: 2px solid #666;
    border-radius: 50%;
    background: linear-gradient(45deg, #888, #aaa, #888);
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    z-index: 6;
  `;

  // Create main ID card container
  const cardContainer = document.createElement('div');
  cardContainer.style.cssText = `
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 12px;
    width: 100%;
    max-width: 300px;
    height: 450px;
    box-shadow: 
      0 8px 32px rgba(0,0,0,0.15),
      0 4px 16px rgba(0,0,0,0.1),
      inset 0 1px 0 rgba(255,255,255,0.8);
    border: 3px solid ${tagColor};
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    margin: 0 auto;
  `;

  // Create card hole for lanyard
  const cardHole = document.createElement('div');
  cardHole.style.cssText = `
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    background: #ddd;
    border-radius: 50%;
    border: 1px solid #bbb;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
    z-index: 10;
  `;

  // Create header section
  const headerSection = document.createElement('div');
  headerSection.style.cssText = `
    background: linear-gradient(135deg, ${tagColor} 0%, ${tagColor}dd 100%);
    padding: 20px 15px 10px 15px;
    text-align: center;
    color: white;
    font-weight: bold;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    border-bottom: 2px solid rgba(255,255,255,0.2);
  `;

  headerSection.innerHTML = `
    <div style="font-size: 12px; margin-bottom: 5px; opacity: 0.9;">STUDENT ID CARD</div>
  `;

  // Create main content area
  const mainContent = document.createElement('div');
  mainContent.style.cssText = `
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px 15px 15px 15px;
    gap: 15px;
    align-items: center;
    justify-content: flex-start;
  `;

  // Create photo and ID section
  const photoIdSection = document.createElement('div');
  photoIdSection.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    width: 100%;
  `;

  // Create realistic photo container with border
  const photoContainer = document.createElement('div');
  photoContainer.style.cssText = `
    width: 100px;
    height: 100px;
    border-radius: 8px;
    border: 3px solid #e0e0e0;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-shadow: 
      0 4px 12px rgba(0,0,0,0.15),
      inset 0 1px 0 rgba(255,255,255,0.5);
    position: relative;
  `;

  // Add photo corner effect
  const photoCorner = document.createElement('div');
  photoCorner.style.cssText = `
    position: absolute;
    top: 5px;
    right: 5px;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-top: 8px solid rgba(255,255,255,0.3);
    z-index: 2;
  `;

  const userPhoto = document.createElement('img');
  userPhoto.src = userImgSrc;
  userPhoto.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: cover;
  `;

  photoContainer.appendChild(userPhoto);
  photoContainer.appendChild(photoCorner);

  // Create ID number display
  const idContainer = document.createElement('div');
  idContainer.style.cssText = `
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 2px solid #dee2e6;
    border-radius: 25px;
    padding: 10px 20px;
    font-weight: bold;
    font-size: 16px;
    color: #333;
    text-align: center;
    letter-spacing: 2px;
    box-shadow: 
      0 3px 8px rgba(0,0,0,0.1),
      inset 0 1px 0 rgba(255,255,255,0.8);
    font-family: 'Courier New', monospace;
  `;
  idContainer.textContent = userId;

  photoIdSection.appendChild(photoContainer);
  photoIdSection.appendChild(idContainer);

  // Get counts from the original HTML elements
  const originalSections = originalRow.querySelectorAll('.col-lg-3');
  const sections = [
    { 
      title: 'Journals', 
      count: originalSections[0]?.querySelector('.count')?.textContent || '0' 
    },
    { 
      title: 'Awards', 
      count: originalSections[1]?.querySelector('.count')?.textContent || '0' 
    },
    { 
      title: 'Seminars', 
      count: originalSections[2]?.querySelector('.count')?.textContent || '0' 
    },
    { 
      title: 'Projects', 
      count: originalSections[3]?.querySelector('.count')?.textContent || '0' 
    }
  ];

  // Create enhanced stats container
  const statsContainer = document.createElement('div');
  statsContainer.style.cssText = `
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 12px;
    padding: 15px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 10px;
    box-shadow: 
      0 4px 12px rgba(0,0,0,0.08),
      inset 0 1px 0 rgba(255,255,255,0.8);
    width: 100%;
    max-width: 280px;
    border: 1px solid #e9ecef;
  `;

  sections.forEach((section, index) => {
    const statItem = document.createElement('div');
    statItem.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 10px 8px;
      border-radius: 10px;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border: 1.5px solid #e9ecef;
      box-shadow: 
        0 2px 8px rgba(0,0,0,0.06),
        inset 0 1px 0 rgba(255,255,255,0.8);
      position: relative;
      overflow: hidden;
    `;

    // Add subtle pattern overlay
    const pattern = document.createElement('div');
    pattern.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%);
      pointer-events: none;
    `;

    statItem.innerHTML = `
      <div style="
        font-size: 18px; 
        color: #2c3e50; 
        font-weight: bold;
        margin-bottom: 4px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      ">${section.count}</div>
      <div style="
        font-size: 8px; 
        color: #7f8c8d; 
        text-align: center;
        line-height: 1.2;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      ">${section.title}</div>
    `;

    statItem.appendChild(pattern);

    // Enhanced hover effects
    statItem.addEventListener('mouseenter', () => {
      statItem.style.transform = 'translateY(-2px) scale(1.02)';
      statItem.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
      statItem.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)';
    });

    statItem.addEventListener('mouseleave', () => {
      statItem.style.transform = 'translateY(0) scale(1)';
      statItem.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)';
      statItem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)';
    });

    statItem.addEventListener('click', () => {
      statItem.style.transform = 'translateY(1px) scale(0.98)';
      setTimeout(() => {
        statItem.style.transform = 'translateY(-2px) scale(1.02)';
      }, 100);
    });

    statsContainer.appendChild(statItem);
  });

  // Create footer with security features
  const footer = document.createElement('div');
  footer.style.cssText = `
    background: linear-gradient(135deg, ${tagColor}22 0%, ${tagColor}11 100%);
    padding: 10px 15px;
    text-align: center;
    border-top: 1px solid ${tagColor}44;
    font-size: 9px;
    color: #666;
    font-style: italic;
  `;

  // Assemble the card
  cardContainer.appendChild(cardHole);
  cardContainer.appendChild(headerSection);
  mainContent.appendChild(photoIdSection);
  mainContent.appendChild(statsContainer);
  cardContainer.appendChild(mainContent);
  cardContainer.appendChild(footer);

  // Assemble lanyard
  lanyard.appendChild(lanyardClip);
  lanyard.appendChild(metalRing);
  lanyardContainer.appendChild(lanyard);
  lanyardContainer.appendChild(cardContainer);

  // Replace original content
  originalRow.style.display = 'none';
  originalRow.parentNode.insertBefore(lanyardContainer, originalRow.nextSibling);
}
function initMusicPlayer() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(createMusicPlayer, 1000);
      setTimeout(() => playTrack(0), 1500);
    });
  } else {
    setTimeout(createMusicPlayer, 1000);
    setTimeout(() => playTrack(0), 1500);
  }
}

function initCardLayout() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(createCardLayout, 1000);
    });
  } else {
    setTimeout(createCardLayout, 1000);
  }
}

// Initialize everything
hideFooter();
modifyLayout();
document.addEventListener('DOMContentLoaded', modifyLayout);
initMusicPlayer();
initCardLayout();

// Set up observers for dynamic content
const observer = new MutationObserver(() => {
  if (!document.querySelector('#music-player')) {
    setTimeout(createMusicPlayer, 500);
  }
});

const cardObserver = new MutationObserver(() => {
  if (document.querySelector('.row[style*="margin-top:70px"]') && 
      document.querySelector('.row[style*="margin-top:70px"]').style.display !== 'none' &&
      !document.querySelector('[style*="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"]')) {
    setTimeout(createCardLayout, 500);
  }
});

setTimeout(() => {
  observer.observe(document.body, { childList: true, subtree: true });
  cardObserver.observe(document.body, { childList: true, subtree: true });
}, 2000);