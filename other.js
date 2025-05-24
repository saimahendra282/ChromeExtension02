// Simple direct audio play attempt
function playBackgroundMusic() {
  // Check if audio already exists
  if (document.querySelector('#background-music')) return;

  // Create and play audio directly
  const audio = document.createElement('audio');
  audio.id = 'background-music';
  audio.src = chrome.runtime.getURL('background_music.mp3');
  audio.loop = true;
  audio.volume = 0.3;
  audio.style.display = 'none';
  
  document.body.appendChild(audio);
  
  // Just try to play it directly
  audio.play().catch(() => {
    // If it fails, wait for ANY user click and then play
    document.addEventListener('click', () => {
      audio.play();
    }, { once: true });
  });
}

// Run immediately
playBackgroundMusic();