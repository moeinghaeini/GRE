// GRE Flashcards - Ultra Minimal
class GREFlashcards {
    constructor() {
        this.vocabulary = [];
        this.currentIndex = 0;
        this.isFlipped = false;
        
        this.elements = {
            flashcard: document.getElementById('flashcard'),
            word: document.getElementById('word'),
            definition: document.getElementById('definition'),
            persian: document.getElementById('persian'),
            synonyms: document.getElementById('synonyms'),
            counter: document.getElementById('counter'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            flipBtn: document.getElementById('flipBtn'),
            shuffleBtn: document.getElementById('shuffleBtn'),
            pronounceBtn: document.getElementById('pronounceBtn')
        };
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadVocabulary();
            this.setupEventListeners();
            this.displayCurrentCard();
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.showError('Failed to load vocabulary');
        }
    }
    
    async loadVocabulary() {
        try {
            const response = await fetch('vocabulary_persian_final.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.vocabulary = await response.json();
            if (!Array.isArray(this.vocabulary) || this.vocabulary.length === 0) {
                throw new Error('No vocabulary data');
            }
        } catch (error) {
            console.error('Error loading vocabulary:', error);
            throw error;
        }
    }
    
    setupEventListeners() {
        // Navigation
        this.elements.prevBtn.addEventListener('click', () => this.previousCard());
        this.elements.nextBtn.addEventListener('click', () => this.nextCard());
        this.elements.flipBtn.addEventListener('click', () => this.flipCard());
        
        // Controls
        this.elements.shuffleBtn.addEventListener('click', () => this.shuffleCards());
        this.elements.pronounceBtn.addEventListener('click', () => this.pronounceWord());
        
        // Flashcard click
        this.elements.flashcard.addEventListener('click', () => this.flipCard());
        
        // Keyboard
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft': e.preventDefault(); this.previousCard(); break;
                case 'ArrowRight': e.preventDefault(); this.nextCard(); break;
                case ' ': case 'Enter': e.preventDefault(); this.flipCard(); break;
                case 's': e.preventDefault(); this.shuffleCards(); break;
                case 'p': e.preventDefault(); this.pronounceWord(); break;
            }
        });
        
        // Touch gestures
        this.setupTouchGestures();
    }
    
    setupTouchGestures() {
        let startX = 0, startY = 0;
        
        this.elements.flashcard.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        this.elements.flashcard.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                diffX > 0 ? this.nextCard() : this.previousCard();
            } else if (Math.abs(diffY) < 30 && Math.abs(diffX) < 30) {
                this.flipCard();
            }
            
            startX = startY = 0;
        });
    }
    
    displayCurrentCard() {
        if (this.vocabulary.length === 0) return;
        
        const word = this.vocabulary[this.currentIndex];
        
        this.elements.word.textContent = word.word;
        this.elements.definition.textContent = word.definition;
        this.elements.persian.textContent = word.persian_translation;
        this.elements.synonyms.textContent = word.synonyms ? `Synonyms: ${word.synonyms}` : '';
        this.elements.counter.textContent = `${this.currentIndex + 1} / ${this.vocabulary.length}`;
        
        this.isFlipped = false;
        this.elements.flashcard.classList.remove('flipped');
        this.updateButtonStates();
    }
    
    flipCard() {
        this.isFlipped = !this.isFlipped;
        this.elements.flashcard.classList.toggle('flipped');
        this.elements.flipBtn.textContent = this.isFlipped ? 'Show Word' : 'Show Definition';
    }
    
    nextCard() {
        this.currentIndex = this.currentIndex < this.vocabulary.length - 1 ? this.currentIndex + 1 : 0;
        this.displayCurrentCard();
    }
    
    previousCard() {
        this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.vocabulary.length - 1;
        this.displayCurrentCard();
    }
    
    shuffleCards() {
        if (this.vocabulary.length === 0) return;
        
        for (let i = this.vocabulary.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.vocabulary[i], this.vocabulary[j]] = [this.vocabulary[j], this.vocabulary[i]];
        }
        
        this.currentIndex = 0;
        this.displayCurrentCard();
        
        // Visual feedback
        this.elements.shuffleBtn.style.background = 'var(--primary)';
        this.elements.shuffleBtn.style.color = 'white';
        setTimeout(() => {
            this.elements.shuffleBtn.style.background = '';
            this.elements.shuffleBtn.style.color = '';
        }, 500);
    }
    
    pronounceWord() {
        if (this.vocabulary.length === 0) return;
        
        const word = this.vocabulary[this.currentIndex].word;
        
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.rate = 0.75;
            utterance.pitch = 1.1;
            utterance.volume = 0.9;
            speechSynthesis.speak(utterance);
        }
        
        // Visual feedback
        this.elements.pronounceBtn.style.background = 'var(--primary)';
        this.elements.pronounceBtn.style.color = 'white';
        setTimeout(() => {
            this.elements.pronounceBtn.style.background = '';
            this.elements.pronounceBtn.style.color = '';
        }, 1000);
    }
    
    updateButtonStates() {
        const disabled = this.vocabulary.length <= 1;
        this.elements.prevBtn.disabled = disabled;
        this.elements.nextBtn.disabled = disabled;
        this.elements.prevBtn.style.opacity = disabled ? '0.5' : '1';
        this.elements.nextBtn.style.opacity = disabled ? '0.5' : '1';
    }
    
    showError(message) {
        this.elements.word.textContent = 'Error';
        this.elements.definition.textContent = message;
        this.elements.persian.textContent = '';
        this.elements.synonyms.textContent = '';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new GREFlashcards();
});

// Optional: Register service worker for offline support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}