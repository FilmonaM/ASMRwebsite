// Audio Controls
const bgAudio = document.getElementById('bg-audio');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');

// Audio fade variables
let baseVolume = 0.3;
let audioScrollMultiplier = 1;
let audioWasPaused = false;

// Initialize audio
window.addEventListener('load', () => {
    // Set initial volume
    bgAudio.volume = baseVolume;
    volumeSlider.value = baseVolume * 100;
    
    // Try to play audio (may be blocked by browser)
    bgAudio.play().catch(e => {
        console.log('Auto-play prevented by browser');
        // Create a play prompt
        createPlayPrompt();
    });
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

// Audio fade on scroll
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const fadeStartPoint = windowHeight * 0.5; // Start fading after half viewport
    const fadeEndPoint = windowHeight * 2; // Completely fade out after 2 viewports
    const pausePoint = windowHeight * 2.5; // Pause audio after 2.5 viewports
    
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
        bgAudio.play().catch(e => console.log('Resume prevented by browser'));
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

// Expand/Collapse Artist Analysis
const expandBtns = document.querySelectorAll('.expand-btn');

expandBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const analysisText = document.getElementById(targetId);
        
        if (analysisText.classList.contains('expanded')) {
            analysisText.classList.remove('expanded');
            btn.textContent = 'READ ANALYSIS →';
        } else {
            analysisText.classList.add('expanded');
            btn.textContent = 'HIDE ANALYSIS ←';
        }
    });
});

// Reaction Buttons
const reactionBtns = document.querySelectorAll('.reaction-btn');
const reactionCount = document.querySelector('.reaction-count');
let reactions = {};

// Load saved reactions from localStorage
const savedReactions = localStorage.getItem('rockResistanceReactions');
if (savedReactions) {
    reactions = JSON.parse(savedReactions);
    updateReactionDisplay();
}

reactionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const reaction = btn.getAttribute('data-reaction');
        
        // Toggle selection
        if (btn.classList.contains('selected')) {
            btn.classList.remove('selected');
            reactions[reaction] = (reactions[reaction] || 1) - 1;
        } else {
            // Remove other selections
            reactionBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            reactions[reaction] = (reactions[reaction] || 0) + 1;
        }
        
        // Save to localStorage
        localStorage.setItem('rockResistanceReactions', JSON.stringify(reactions));
        updateReactionDisplay();
    });
});

function updateReactionDisplay() {
    const total = Object.values(reactions).reduce((sum, count) => sum + count, 0);
    if (total > 0) {
        reactionCount.textContent = `${total} revolutionary spirits have reacted`;
    }
}

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
document.querySelectorAll('.quote-card, .gallery-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Parallax effect for hero section
const heroSection = document.querySelector('.landing-section');
const heroImage = document.querySelector('.hero-image-placeholder');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxSpeed = 0.5;
    
    if (scrolled < window.innerHeight) {
        heroImage.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    }
});

// Add hover sound effects (optional)
const hoverElements = document.querySelectorAll('.expand-btn, .reaction-btn, .nav-link');

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

// Create audio directory reminder
console.log('%c🎵 Don\'t forget to add your audio file!', 'font-size: 16px; color: #ff0000;');
console.log('%cCreate an "audio" folder and add "revolution.mp3" (Gil Scott-Heron - The Revolution Will Not Be Televised)', 'font-size: 12px; color: #888;');

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