class ScrollFloat {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            animationDuration: 1,
            ease: 'back.inOut(2)',
            scrollStart: 'top bottom+=50%',
            scrollEnd: 'bottom bottom-=40%',
            stagger: 0.03,
            ...options
        };

        this.init();
    }

    init() {
        if (!window.gsap || !window.ScrollTrigger) {
            console.error('GSAP or ScrollTrigger not found. Please load them before initializing ScrollFloat.');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        this.splitText(this.element);

        const charElements = this.element.querySelectorAll('.char');

        if (charElements.length === 0) return;

        gsap.fromTo(
            charElements,
            {
                willChange: 'opacity, transform',
                opacity: 0,
                yPercent: 120,
                scaleY: 2.3,
                scaleX: 0.7,
                transformOrigin: '50% 0%'
            },
            {
                duration: this.options.animationDuration,
                ease: this.options.ease,
                opacity: 1,
                yPercent: 0,
                scaleY: 1,
                scaleX: 1,
                stagger: this.options.stagger,
                scrollTrigger: {
                    trigger: this.element,
                    scroller: window,
                    start: this.options.scrollStart,
                    end: this.options.scrollEnd,
                    scrub: true
                }
            }
        );
    }

    splitText(node) {
        // Create a copy of child nodes to iterate over safely while modifying
        const children = Array.from(node.childNodes);

        children.forEach(child => {
            if (child.nodeType === 3) { // Text node
                const text = child.textContent;

                // If it's pure whitespace, it might be for layout, but usually we ignore
                // unless it is essential. For inline-block flow, spaces matter.
                // However, replacing text node with spans for each char means a space char 
                // becomes a span with &nbsp; equivalent.
                if (!text) return;

                // Check for pure whitespace to avoid cluttering DOM with empty spans if not visible/needed
                if (!text.trim() && text.includes('\n')) {
                    // It's likely indentation
                    return;
                }

                const wrapperInfo = document.createDocumentFragment();
                const chars = text.split('');

                chars.forEach(char => {
                    const span = document.createElement('span');
                    span.className = 'char';
                    // Preserve space perfectly
                    span.textContent = char === ' ' ? '\u00A0' : char;
                    wrapperInfo.appendChild(span);
                });

                node.replaceChild(wrapperInfo, child);
            } else if (child.nodeType === 1) { // Element node
                this.splitText(child);
            }
        });
    }
}
