// Audio Controls
const bgAudio = document.getElementById('bg-audio');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');

// Now Playing Elements
const nowPlaying = document.getElementById('now-playing');
const nowPlayingTitle = document.getElementById('now-playing-title');
const nowPlayingTime = document.getElementById('now-playing-time');
const nowPlayingBar = document.getElementById('now-playing-bar');
const nowPlayingControl = document.getElementById('now-playing-control');
const controlPlay = nowPlayingControl.querySelector('.control-play');
const controlPause = nowPlayingControl.querySelector('.control-pause');

// Audio fade variables
let baseVolume = 0.3;
let audioScrollMultiplier = 1;
let audioWasPaused = false;
let currentlyPlaying = null;

// Format time helper
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update now playing display
function updateNowPlaying() {
    if (currentlyPlaying) {
        const currentTime = currentlyPlaying.currentTime;
        const duration = currentlyPlaying.duration || 0;
        
        nowPlayingTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        nowPlayingBar.style.width = duration ? `${(currentTime / duration) * 100}%` : '0%';
        
        if (!currentlyPlaying.paused) {
            requestAnimationFrame(updateNowPlaying);
        }
    }
}

// Track audio playback
function trackAudio(audio, title) {
    // Pause any currently playing audio
    if (currentlyPlaying && currentlyPlaying !== audio) {
        currentlyPlaying.pause();
    }
    
    currentlyPlaying = audio;
    nowPlayingTitle.textContent = title;
    nowPlaying.classList.add('active');
    updateNowPlayingLabel();
    updateNowPlaying();
}

// Update now playing label based on play state
function updateNowPlayingLabel() {
    const label = document.querySelector('.now-playing-label');
    if (currentlyPlaying && !currentlyPlaying.paused) {
        label.textContent = 'Now Playing:';
        controlPlay.style.display = 'none';
        controlPause.style.display = 'inline';
    } else {
        label.textContent = 'Paused:';
        controlPlay.style.display = 'inline';
        controlPause.style.display = 'none';
    }
}

// Add click handler for now playing control button
nowPlayingControl.addEventListener('click', () => {
    if (currentlyPlaying) {
        if (currentlyPlaying.paused) {
            currentlyPlaying.play();
        } else {
            currentlyPlaying.pause();
        }
    }
});

// Initialize audio
window.addEventListener('load', () => {
    // Set initial volume
    bgAudio.volume = baseVolume;
    volumeSlider.value = baseVolume * 100;
    
    // Initialize now playing display
    nowPlayingTitle.textContent = 'The Revolution Will Not Be Televised';
    nowPlayingTime.textContent = '0:00 / 0:00';
    updateNowPlayingLabel(); // Set initial label state
    
    // Track background audio
    bgAudio.addEventListener('play', () => {
        trackAudio(bgAudio, 'The Revolution Will Not Be Televised');
        updateNowPlayingLabel();
    });
    
    bgAudio.addEventListener('pause', () => {
        if (currentlyPlaying === bgAudio) {
            // Just remove active state, keep display visible
            nowPlaying.classList.remove('active');
            updateNowPlayingLabel();
        }
    });
    
    bgAudio.addEventListener('timeupdate', () => {
        if (currentlyPlaying === bgAudio && bgAudio.paused) {
            updateNowPlaying();
        }
    });
    
    // Try to play audio (may be blocked by browser)
    bgAudio.play().catch(e => {
        // Create a play prompt
        createPlayPrompt();
    });
    
    // Handle artist audio players
    const artistAudios = document.querySelectorAll('.artist-audio');
    artistAudios.forEach(audio => {
        audio.addEventListener('error', (e) => {
            // Don't log errors for missing files
            e.preventDefault();
        });
        
        // Track artist audio
        audio.addEventListener('play', () => {
            const artistBlock = audio.closest('.artist-block');
            const songTitle = artistBlock.querySelector('.song-title').textContent.replace(/["""]/g, '');
            const artistName = artistBlock.querySelector('.artist-name').textContent;
            
            // Pause background audio when artist audio plays
            bgAudio.pause();
            trackAudio(audio, `${artistName} - ${songTitle}`);
            updateNowPlayingLabel();
            updatePlayerButton(audio.id, true);
        });
        
        audio.addEventListener('pause', () => {
            if (currentlyPlaying === audio) {
                // Just remove active state, keep display visible
                nowPlaying.classList.remove('active');
                updateNowPlayingLabel();
                updatePlayerButton(audio.id, false);
            }
        });
        
        audio.addEventListener('timeupdate', () => {
            if (currentlyPlaying === audio && audio.paused) {
                updateNowPlaying();
            }
        });
    });
    
    // Initialize custom audio players
    initializeCustomPlayers();
});

// Create play prompt if autoplay fails
function createPlayPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'play-prompt';
    prompt.innerHTML = `
        <div class="prompt-content">
            <p>🎵 Click to play "The Revolution Will Not Be Televised"</p>
            <button class="play-btn">PLAY AUDIO</button>
        </div>
    `;
    prompt.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #000;
        color: #fff;
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;
    
    document.body.appendChild(prompt);
    
    prompt.querySelector('.play-btn').addEventListener('click', () => {
        bgAudio.play();
        prompt.remove();
    });
    
    // Also try to play on any user interaction
    document.addEventListener('click', function playOnClick() {
        bgAudio.play();
        prompt.remove();
        document.removeEventListener('click', playOnClick);
    }, { once: true });
}

// Mute/Unmute toggle
muteBtn.addEventListener('click', () => {
    if (bgAudio.muted) {
        bgAudio.muted = false;
        bgAudio.volume = baseVolume * audioScrollMultiplier; // Apply current scroll multiplier
        muteBtn.textContent = '🔊';
        muteBtn.classList.remove('muted');
    } else {
        bgAudio.muted = true;
        muteBtn.textContent = '🔇';
        muteBtn.classList.add('muted');
    }
});

// Volume control
volumeSlider.addEventListener('input', (e) => {
    const sliderValue = e.target.value / 100;
    bgAudio.volume = sliderValue * audioScrollMultiplier; // Apply scroll multiplier
    baseVolume = sliderValue; // Store base volume
    if (e.target.value == 0) {
        muteBtn.textContent = '🔇';
        muteBtn.classList.add('muted');
    } else {
        muteBtn.textContent = '🔊';
        muteBtn.classList.remove('muted');
        bgAudio.muted = false;
    }
});

// Audio fade on scroll - now starts after timeline section
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const timelineSection = document.querySelector('.context-section');
    const timelineBottom = timelineSection ? timelineSection.offsetTop + timelineSection.offsetHeight : windowHeight;
    
    const fadeStartPoint = timelineBottom; // Start fading after timeline section
    const fadeEndPoint = fadeStartPoint + windowHeight * 1.5; // Fade over 1.5 viewport heights
    const pausePoint = fadeEndPoint + windowHeight * 0.5; // Pause half viewport after fade ends
    
    const audioControls = document.querySelector('.audio-controls');
    
    // Calculate volume multiplier based on scroll position
    if (scrollY <= fadeStartPoint) {
        audioScrollMultiplier = 1;
        audioControls.classList.remove('fading', 'paused');
    } else if (scrollY >= fadeEndPoint) {
        audioScrollMultiplier = 0;
        if (scrollY > pausePoint) {
            audioControls.classList.remove('fading');
            audioControls.classList.add('paused');
        } else {
            audioControls.classList.add('fading');
            audioControls.classList.remove('paused');
        }
    } else {
        // Linear fade between start and end points
        const fadeProgress = (scrollY - fadeStartPoint) / (fadeEndPoint - fadeStartPoint);
        audioScrollMultiplier = 1 - fadeProgress;
        audioControls.classList.add('fading');
        audioControls.classList.remove('paused');
    }
    
    // Apply volume change if audio is not muted
    if (!bgAudio.muted && !audioWasPaused) {
        bgAudio.volume = baseVolume * audioScrollMultiplier;
    }
    
    // Pause/resume based on scroll position
    if (scrollY > pausePoint && !bgAudio.paused && !audioWasPaused) {
        bgAudio.pause();
        audioWasPaused = true;
    } else if (scrollY <= pausePoint && audioWasPaused) {
        bgAudio.play().catch(e => {
            // Silently handle resume prevention
        });
        audioWasPaused = false;
    }
    
    // Update volume slider visual feedback
    if (audioScrollMultiplier < 0.1 && !bgAudio.muted) {
        muteBtn.style.opacity = '0.5';
    } else {
        muteBtn.style.opacity = '1';
    }
});

// Navigation Active State
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

// Update active nav on scroll
window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Smooth scroll for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        const targetSection = document.getElementById(targetId);
        
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

// Expand/Collapse Artist Analysis and Lyrics
const expandBtns = document.querySelectorAll('.expand-btn');

expandBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        const isLyricsBtn = btn.classList.contains('lyrics-btn');
        
        if (targetElement.classList.contains('expanded')) {
            targetElement.classList.remove('expanded');
            if (isLyricsBtn) {
                btn.textContent = 'VIEW LYRICS →';
            } else {
                btn.textContent = 'READ ANALYSIS →';
            }
        } else {
            targetElement.classList.add('expanded');
            if (isLyricsBtn) {
                btn.textContent = 'HIDE LYRICS ←';
            } else {
                btn.textContent = 'HIDE ANALYSIS ←';
            }
        }
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.gallery-item, .impact-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add hover sound effects (optional)
const hoverElements = document.querySelectorAll('.expand-btn, .nav-link');

hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        // You could add a subtle sound effect here
        // const hoverSound = new Audio('hover.mp3');
        // hoverSound.volume = 0.1;
        // hoverSound.play();
    });
});

// Glitch effect on scroll for main title
const mainTitle = document.querySelector('.main-title');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (Math.abs(currentScrollY - lastScrollY) > 50) {
        mainTitle.style.animation = 'glitch 0.3s ease-out';
        setTimeout(() => {
            mainTitle.style.animation = 'glitch 2s infinite';
        }, 300);
    }
    
    lastScrollY = currentScrollY;
});

// Performance optimization: Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll handlers
window.addEventListener('scroll', throttle(() => {
    // Update nav active state
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
}, 100));

// Initialize custom audio player controls
function initializeCustomPlayers() {
    const playPauseBtns = document.querySelectorAll('.play-pause-btn');
    
    playPauseBtns.forEach(btn => {
        const audioId = btn.getAttribute('data-audio');
        const audio = document.getElementById(audioId);
        const customPlayer = btn.closest('.custom-player');
        const progressBar = customPlayer.querySelector('.progress-bar');
        const progressFill = customPlayer.querySelector('.progress-fill');
        const progressHandle = customPlayer.querySelector('.progress-handle');
        const currentTimeEl = customPlayer.querySelector('.current-time');
        const durationEl = customPlayer.querySelector('.duration');
        const playIcon = btn.querySelector('.play-icon');
        const pauseIcon = btn.querySelector('.pause-icon');
        
        // Play/Pause functionality
        btn.addEventListener('click', () => {
            if (audio.paused) {
                // Pause all other audio
                document.querySelectorAll('.artist-audio').forEach(a => {
                    if (a !== audio && !a.paused) {
                        a.pause();
                        updatePlayerButton(a.id, false);
                    }
                });
                
                audio.play();
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            } else {
                audio.pause();
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            }
        });
        
        // Update progress bar
        audio.addEventListener('timeupdate', () => {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = progress + '%';
            progressHandle.style.left = progress + '%';
            currentTimeEl.textContent = formatTime(audio.currentTime);
        });
        
        // Update duration when metadata loads
        audio.addEventListener('loadedmetadata', () => {
            durationEl.textContent = formatTime(audio.duration);
        });
        
        // Click to seek
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            audio.currentTime = percentage * audio.duration;
        });
        
        // Drag handle to seek
        let isDragging = false;
        
        progressHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            progressHandle.classList.add('dragging');
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const rect = progressBar.getBoundingClientRect();
            let x = e.clientX - rect.left;
            x = Math.max(0, Math.min(x, rect.width));
            const percentage = x / rect.width;
            
            progressFill.style.width = percentage * 100 + '%';
            progressHandle.style.left = percentage * 100 + '%';
            audio.currentTime = percentage * audio.duration;
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                progressHandle.classList.remove('dragging');
            }
        });
        
        // Update button when audio ends
        audio.addEventListener('ended', () => {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        });
    });
}

// Update player button state
function updatePlayerButton(audioId, isPlaying) {
    const btn = document.querySelector(`[data-audio="${audioId}"]`);
    if (btn) {
        const playIcon = btn.querySelector('.play-icon');
        const pauseIcon = btn.querySelector('.pause-icon');
        
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }
} 