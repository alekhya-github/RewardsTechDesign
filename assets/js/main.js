// ==========================================================================
// Main JavaScript - Rans Ultimate Rewards Dashboard
// ==========================================================================

// Main App Class
class App {
  constructor() {
    this.init();
  }

  init() {
    this.initSmoothScroll();
    this.initLazyLoading();
    this.initAccessibility();
  }

  // Smooth scroll for anchor links
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (href === "#") return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }

  // Lazy loading for images
  initLazyLoading() {
    if ("IntersectionObserver" in window) {
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');

      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
            }
            imageObserver.unobserve(img);
          }
        });
      });

      lazyImages.forEach((img) => imageObserver.observe(img));
    }
  }

  // Accessibility enhancements
  initAccessibility() {
    // Add focus outline on keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        document.body.classList.add("keyboard-navigation");
      }
    });

    document.addEventListener("mousedown", () => {
      document.body.classList.remove("keyboard-navigation");
    });

    // Skip to main content link
    this.createSkipLink();
  }

  createSkipLink() {
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.className = "skip-link";
    skipLink.textContent = "Skip to main content";
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
}

// Utility Functions
const Utils = {
  // Debounce function for performance optimization
  debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Format number with commas
  formatNumber(num) {
    return num.toLocaleString("en-US");
  },

  // Format currency
  formatCurrency(num, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(num);
  },
};

// Add accessibility styles
const accessibilityStyles = document.createElement("style");
accessibilityStyles.textContent = `
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #0A4A82;
    color: white;
    padding: 8px 16px;
    z-index: 9999;
    text-decoration: none;
    font-weight: bold;
    transition: top 0.3s;
  }
  
  .skip-link:focus {
    top: 0;
  }
  
  .keyboard-navigation *:focus {
    outline: 2px solid #1A73E8 !important;
    outline-offset: 2px !important;
  }
`;
document.head.appendChild(accessibilityStyles);

// ==========================================================================
// FEATURED REWARDS CAROUSEL
// ==========================================================================
class FeaturedRewardsCarousel {
  constructor() {
    this.carousel = document.querySelector(".featured-rewards__carousel");
    if (!this.carousel) return;

    this.viewport = this.carousel.querySelector(".featured-rewards__viewport");
    this.track = this.carousel.querySelector(".featured-rewards__track");
    this.cards = this.track.querySelectorAll(".featured-rewards__card");
    this.prevBtn = document.querySelector(".featured-rewards__nav--prev");
    this.nextBtn = document.querySelector(".featured-rewards__nav--next");
    this.dotsContainer = document.querySelector(".featured-rewards__dots");
    this.dots = this.dotsContainer.querySelectorAll(".featured-rewards__dot");

    this.currentIndex = 0;
    this.cardsPerView = 2; // Show 2 cards at a time
    this.totalCards = this.cards.length;
    this.maxIndex = Math.ceil(this.totalCards / this.cardsPerView) - 1;

    this.init();
  }

  init() {
    // Set up event listeners
    this.prevBtn.addEventListener("click", () => this.prev());
    this.nextBtn.addEventListener("click", () => this.next());

    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => this.goToSlide(index));
    });

    // Handle responsive
    this.handleResize();
    window.addEventListener(
      "resize",
      Utils.debounce(() => this.handleResize(), 150)
    );

    // Touch/swipe support
    this.initTouchSupport();

    // Initial state
    this.updateCarousel();
  }

  handleResize() {
    const viewportWidth = window.innerWidth;
    if (viewportWidth <= 600) {
      this.cardsPerView = 1;
    } else {
      this.cardsPerView = 2;
    }
    this.maxIndex = Math.ceil(this.totalCards / this.cardsPerView) - 1;

    // Ensure current index is valid
    if (this.currentIndex > this.maxIndex) {
      this.currentIndex = this.maxIndex;
    }
    this.updateCarousel();
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCarousel();
    }
  }

  next() {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
      this.updateCarousel();
    }
  }

  goToSlide(index) {
    this.currentIndex = index;
    this.updateCarousel();
  }

  updateCarousel() {
    // Get the actual card width from the first card
    const cardWidth = this.cards[0].offsetWidth;
    const gap = 24; // Gap between cards (matches CSS $spacing-6 = 1.5rem = 24px)

    // Move by cardsPerView cards worth of width
    const translateX =
      this.currentIndex * this.cardsPerView * (cardWidth + gap);

    this.track.style.transform = `translateX(-${translateX}px)`;

    // Update dots
    this.dots.forEach((dot, index) => {
      dot.classList.toggle(
        "featured-rewards__dot--active",
        index === this.currentIndex
      );
    });

    // Update button states
    this.prevBtn.disabled = this.currentIndex === 0;
    this.nextBtn.disabled = this.currentIndex === this.maxIndex;

    this.prevBtn.style.opacity = this.currentIndex === 0 ? "0.5" : "1";
    this.nextBtn.style.opacity =
      this.currentIndex === this.maxIndex ? "0.5" : "1";
  }

  initTouchSupport() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    this.track.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    this.track.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    });

    this.track.addEventListener("touchend", () => {
      if (!isDragging) return;
      isDragging = false;

      const diff = startX - currentX;
      const threshold = 50;

      if (diff > threshold) {
        this.next();
      } else if (diff < -threshold) {
        this.prev();
      }
    });
  }
}

// Initialize App when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
  window.utils = Utils;
  window.carousel = new FeaturedRewardsCarousel();
});

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { App, Utils, FeaturedRewardsCarousel };
}
