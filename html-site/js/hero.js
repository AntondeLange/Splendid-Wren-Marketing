// Hero Section with Video, Audio, and Ripple Effects
(function() {
  'use strict';
  
  let audioElement = null;
  let audioUnlocked = false;
  let rippleId = 0;
  let lastRippleTime = 0;
  let ripples = [];
  
  function initHero() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    // Initialize audio
    const audioPath = encodeURI('images/Blue Wren Audio.mp3');
    audioElement = new Audio(audioPath);
    audioElement.volume = 0.6;
    audioElement.loop = false;
    audioElement.preload = 'auto';
    
    try {
      audioElement.load();
    } catch (error) {
      console.error('Error loading audio:', error);
    }
    
    // Unlock audio on first user interaction
    const unlockAudio = function() {
      if (audioElement && !audioUnlocked) {
        audioElement.play().then(function() {
          audioElement.pause();
          audioElement.currentTime = 0;
          audioUnlocked = true;
        }).catch(function(error) {
          // Audio not unlocked yet
        });
      }
      // Remove event listeners after first interaction
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
    
    // Create ripple container
    const rippleContainer = document.createElement('div');
    rippleContainer.className = 'ripple-container';
    heroSection.appendChild(rippleContainer);
    
    // Mouse enter handler
    heroSection.addEventListener('mouseenter', handleMouseEnter);
    
    // Mouse leave handler
    heroSection.addEventListener('mouseleave', handleMouseLeave);
    
    // Mouse move handler
    heroSection.addEventListener('mousemove', handleMouseMove);
  }
  
  function handleMouseEnter() {
    if (audioElement) {
      // Try to unlock audio if not already unlocked
      if (!audioUnlocked) {
        audioElement.play().then(function() {
          audioElement.pause();
          audioElement.currentTime = 0;
          audioUnlocked = true;
        }).catch(function(error) {
          // Audio still locked
          return;
        });
      }
      
      // Play audio if unlocked
      if (audioUnlocked) {
        audioElement.currentTime = 0;
        audioElement.play().catch(function(error) {
          if (error.name !== 'NotAllowedError') {
            console.error('Error playing audio:', error);
          }
        });
      }
    }
  }
  
  function handleMouseLeave() {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    // Clear ripples
    const rippleContainer = document.querySelector('.ripple-container');
    if (rippleContainer) {
      rippleContainer.innerHTML = '';
    }
    ripples = [];
  }
  
  function handleMouseMove(event) {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    // Throttle ripple creation (max 1 every 100ms)
    const now = Date.now();
    if (now - lastRippleTime < 100) return;
    lastRippleTime = now;
    
    const rect = heroSection.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Create ripple
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    const rippleContainer = document.querySelector('.ripple-container');
    if (rippleContainer) {
      rippleContainer.appendChild(ripple);
      
      // Remove ripple after animation completes
      setTimeout(function() {
        ripple.remove();
      }, 1000);
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHero);
  } else {
    initHero();
  }
})();
