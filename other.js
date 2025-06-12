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

  // Create main card container
  const cardContainer = document.createElement('div');
  cardContainer.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    margin: 20px auto;
    max-width: 600px;
    height: 200px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.3);
    display: flex;
    overflow: hidden;
    position: relative;
  `;

  // Create left section (user info)
  const leftSection = document.createElement('div');
  leftSection.style.cssText = `
    flex: 2;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(255,255,255,0.1);
    border-right: 2px solid rgba(255,255,255,0.3);
  `;

  leftSection.innerHTML = `
    <div style="text-align: center;">
      <img src="${userImgSrc}" style="
        width: 80px; 
        height: 80px; 
        border-radius: 50%; 
        border: 3px solid white;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        margin-bottom: 15px;
      " alt="User Photo">
      <p style="
        color: rgba(255,255,255,0.9); 
        margin: 0; 
        font-size: 16px;
        font-weight: 600;
        background: rgba(0,0,0,0.2);
        padding: 8px 12px;
        border-radius: 10px;
        display: inline-block;
        letter-spacing: 1px;
      ">${userId}</p>
    </div>
  `;

  // Create right section (stats grid)
  const rightSection = document.createElement('div');
  rightSection.style.cssText = `
    flex: 1;
    padding: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 15px;
    align-items: center;
    justify-items: center;
  `;

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

  sections.forEach((section) => {
    const circleCard = document.createElement('div');
    circleCard.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);
      position: relative;
    `;

    circleCard.innerHTML = `
      <div style="
        font-size: 16px; 
        color: white; 
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        margin-bottom: 2px;
      ">${section.count}</div>
      <div style="
        font-size: 8px; 
        color: rgba(255,255,255,0.9); 
        text-align: center;
        line-height: 1;
        font-weight: 600;
      ">${section.title}</div>
    `;

    // Add hover and click effects
    circleCard.addEventListener('mouseenter', () => {
      circleCard.style.transform = 'scale(1.1)';
      circleCard.style.background = 'rgba(255,255,255,0.25)';
      circleCard.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    });

    circleCard.addEventListener('mouseleave', () => {
      circleCard.style.transform = 'scale(1)';
      circleCard.style.background = 'rgba(255,255,255,0.15)';
      circleCard.style.boxShadow = 'none';
    });

    circleCard.addEventListener('click', () => {
      circleCard.style.transform = 'scale(0.95)';
      setTimeout(() => {
        circleCard.style.transform = 'scale(1.1)';
      }, 100);
    });

    rightSection.appendChild(circleCard);
  });

  cardContainer.appendChild(leftSection);
  cardContainer.appendChild(rightSection);

  originalRow.style.display = 'none';
  originalRow.parentNode.insertBefore(cardContainer, originalRow.nextSibling);
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