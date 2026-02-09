class DecryptedText {
    constructor(element, options = {}) {
        this.element = element;
        this.originalText = element.textContent.trim();
        this.options = {
            speed: 50,
            maxIterations: 10,
            sequential: false,
            revealDirection: 'start',
            useOriginalCharsOnly: false,
            characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
            animateOn: 'hover', // 'hover', 'view', 'both', 'click', 'manual'
            className: 'revealed',
            encryptedClassName: 'encrypted',
            ...options
        };

        this.displayText = this.originalText;
        this.isHovering = false;
        this.isScrambling = false;
        this.revealedIndices = new Set();
        this.interval = null;
        this.hasAnimated = false;
        this.currentIteration = 0;

        this.init();
    }

    init() {
        // Enforce styling for characters to make them individually addressable
        // We'll wrap characters in spans dynamically. 
        // Better yet, let's keep the text node as is but manipulate it, 
        // OR replace content with spans. Replacing with spans is better for styling encrypted vs revealed chars.
        this.render();

        const { animateOn } = this.options;

        if (animateOn === 'hover' || animateOn === 'both') {
            this.element.addEventListener('mouseenter', () => this.startScramble());
            this.element.addEventListener('mouseleave', () => this.stopScramble());
        }

        if (animateOn === 'click') {
            this.element.addEventListener('click', () => {
                // Toggle or restart? Let's restart.
                this.reset();
                this.startScramble();
            })
        }

        if (animateOn === 'view' || animateOn === 'both') {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.startScramble();
                        this.hasAnimated = true;
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(this.element);
        }
    }

    reset() {
        this.stopScramble();
        this.displayText = this.originalText;
        this.revealedIndices.clear();
        this.currentIteration = 0;
        this.render();
    }

    startScramble() {
        this.isHovering = true;
        this.isScrambling = true;
        this.currentIteration = 0;

        // Clear existing interval to restart
        if (this.interval) clearInterval(this.interval);

        this.interval = setInterval(() => {
            this.update();
        }, this.options.speed);
    }

    stopScramble() {
        this.isHovering = false;
        this.isScrambling = false;
        if (this.interval) clearInterval(this.interval);
        this.displayText = this.originalText;
        this.render();
    }

    getNextIndex() {
        const textLength = this.originalText.length;
        const { revealDirection } = this.options;
        const revealedSize = this.revealedIndices.size;

        if (revealDirection === 'start') {
            return revealedSize;
        } else if (revealDirection === 'end') {
            return textLength - 1 - revealedSize;
        } else if (revealDirection === 'center') {
            const middle = Math.floor(textLength / 2);
            const offset = Math.floor(revealedSize / 2);
            const nextIndex = revealedSize % 2 === 0 ? middle + offset : middle - offset - 1;

            if (nextIndex >= 0 && nextIndex < textLength && !this.revealedIndices.has(nextIndex)) {
                return nextIndex;
            }

            // Fallback linear scan if calculation misses
            for (let i = 0; i < textLength; i++) {
                if (!this.revealedIndices.has(i)) return i;
            }
            return 0;
        }
        return revealedSize; // Default to start
    }

    shuffleText(text, revealedSet) {
        if (this.options.useOriginalCharsOnly) {
            const positions = text.split('').map((char, i) => ({
                char,
                isSpace: char === ' ',
                index: i,
                isRevealed: revealedSet.has(i)
            }));

            // Filter out spaces and already revealed characters to get the pool of scrambleable chars
            const scrambleablePositions = positions.filter(p => !p.isSpace && !p.isRevealed);
            const scrambleableChars = scrambleablePositions.map(p => p.char);

            // Fisher-Yates shuffle
            for (let i = scrambleableChars.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [scrambleableChars[i], scrambleableChars[j]] = [scrambleableChars[j], scrambleableChars[i]];
            }

            let charIndex = 0;
            return positions
                .map(p => {
                    if (p.isSpace) return ' ';
                    if (p.isRevealed) return text[p.index];
                    // If we have characters to distribute, distribute them. 
                    // Otherwise (shouldn't happen if logic is tight), return original.
                    return scrambleableChars[charIndex++] || text[p.index];
                })
                .join('');
        } else {
            const availableChars = this.options.characters;
            return text
                .split('')
                .map((char, i) => {
                    if (char === ' ') return ' ';
                    if (revealedSet.has(i)) return text[i];
                    return availableChars[Math.floor(Math.random() * availableChars.length)];
                })
                .join('');
        }
    }

    update() {
        const { sequential, maxIterations } = this.options;
        const textLength = this.originalText.length;

        if (sequential) {
            if (this.revealedIndices.size < textLength) {
                const nextIndex = this.getNextIndex();
                this.revealedIndices.add(nextIndex);
                this.displayText = this.shuffleText(this.originalText, this.revealedIndices);
            } else {
                clearInterval(this.interval);
                this.isScrambling = false;
                this.displayText = this.originalText;
            }
        } else {
            // For non-sequential, we just scramble everything not revealed, 
            // but here "revealed" logic is slightly different or usually 
            // it just scrambles for N iterations then stops?
            // The original code uses `currentIteration` and sets ALL text to original after maxIterations.
            // It doesn't seem to progressively reveal in non-sequential mode in the React example provided?
            // Actually, the React example's non-sequential mode:
            // 1. calls shuffleText with prevRevealed (which starts empty)
            // 2. increments iteration
            // 3. if iterations >= max, stop and show original. 
            // So it's pure noise then snap to clear.

            this.displayText = this.shuffleText(this.originalText, this.revealedIndices);
            this.currentIteration++;
            if (this.currentIteration >= maxIterations) {
                clearInterval(this.interval);
                this.isScrambling = false;
                this.displayText = this.originalText;
            }
        }

        this.render();
    }

    render() {
        // Clear content
        this.element.innerHTML = '';
        const { className, encryptedClassName } = this.options;

        // Split displayText into spans
        const chars = this.displayText.split('');
        chars.forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;

            const isRevealedOrDone = this.revealedIndices.has(index) || !this.isScrambling;
            span.className = isRevealedOrDone ? className : encryptedClassName;

            this.element.appendChild(span);
        });
    }
}
