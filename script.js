document.addEventListener('DOMContentLoaded', () => {
    // --- Splash Cursor Effect ---
    // Initialize the WebGL fluid splash cursor
    // --- Splash Cursor Effect ---
    // Initialize the WebGL fluid splash cursor
    new SplashCursor({
        SPLAT_RADIUS: 0.1,
        COLOR_UPDATE_SPEED: 0, // Stop random color rotation (fixed color set in PointerPrototype)
        SPLAT_FORCE: 4000
    });

    // Remove old cursor elements if they exist (optional, or just hide in CSS)
    const oldCursorDot = document.querySelector('[data-cursor-dot]');
    const oldCursorOutline = document.querySelector('[data-cursor-outline]');
    const oldSpotlight = document.querySelector('[data-spotlight]');

    if (oldCursorDot) oldCursorDot.style.display = 'none';
    if (oldCursorOutline) oldCursorOutline.style.display = 'none';
    if (oldSpotlight) oldSpotlight.style.display = 'none';

    // --- Magnetic Effect ---
    const magneticElements = document.querySelectorAll('[data-magnetic]');

    magneticElements.forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const elCenterX = rect.left + rect.width / 2;
            const elCenterY = rect.top + rect.height / 2;
            const x = e.clientX - elCenterX;
            const y = e.clientY - elCenterY;

            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = `translate(0px, 0px)`;
        });
    });

    // --- Reveal/Scroll Animations ---
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.show-on-scroll').forEach((el) => observer.observe(el));

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- Project Card "In View" Animation (Horizontal Scroll) ---
    // Specifically observe cards to add 'in-view' class for scaling effect
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            } else {
                entry.target.classList.remove('in-view'); // Replay animation when scrolling back
            }
        });
    }, {
        threshold: 0.5, // Trigger when 50% of the card is visible
        root: document.querySelector('.project-grid') // Observe within the scroll container
    });

    document.querySelectorAll('.project-card').forEach(card => {
        cardObserver.observe(card);
    });

    // --- Floating Lines Effect ---
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        // Clear existing content (the grid-overlay) if you want to replace it, 
        // or just append if you want to layer. For now, let's keep the grid as a backup or replace it.
        // Let's hide the grid overlay to show the lines clearly.
        const gridOverlay = heroVisual.querySelector('.grid-overlay');
        if (gridOverlay) gridOverlay.style.display = 'none';

        new FloatingLines(heroVisual, {
            linesGradient: ['#D2FF00', '#1a1a1a'], // Neon to dark
            animationSpeed: 0.5,
            lineCount: 8,
            lineDistance: 2,
            bendStrength: 0.5,
            bendRadius: 3.0,
            parallaxStrength: 0.1
        });
    }

    // --- Decrypted Text Effect ---
    // Start animation sequentially for lines
    // --- Decrypted Text Effect ---
    // Start animation sequentially for lines
    // --- Decrypted Text Effect ---
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        new DecryptedText(heroTitle, {
            speed: 80, // Slightly faster/smoother than 150
            sequential: true,
            animateOn: 'view',
            revealDirection: 'start',
            characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*',
            className: 'revealed',
            encryptedClassName: 'encrypted'
        });
    }

    // --- Scroll Float Animation ---
    document.querySelectorAll('.section-title').forEach(title => {
        new ScrollFloat(title, {
            scrollStart: 'top bottom+=20%', // Start when top of element hits bottom + 20%
            scrollEnd: 'bottom bottom-=20%', // End when bottom of element hits bottom - 20%
            ease: 'back.out(1.7)' // Use a nice back ease
        });
    });
});
