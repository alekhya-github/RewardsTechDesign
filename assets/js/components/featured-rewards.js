/**
 * Featured Rewards Carousel Component
 *
 * AEM ClientLib Category: Rans.components.featured-rewards
 * Dependencies: None (Vanilla JS)
 *
 * Features:
 * - Carousel navigation with prev/next arrows
 * - Dot navigation
 * - Responsive: 2 cards visible per page
 * - Smooth CSS transitions
 * - Touch/swipe support ready (can be extended)
 *
 * Usage in AEM:
 * - Include in component's clientlib js.txt
 * - Initialize automatically on DOMContentLoaded
 * - Can also be initialized manually: new Rans.FeaturedRewardsCarousel(element)
 */

(function () {
  "use strict";

  // Create Rans namespace if it doesn't exist
  window.Rans = window.Rans || {};

  /**
   * FeaturedRewardsCarousel Class
   * Manages the featured rewards carousel functionality
   */
  class FeaturedRewardsCarousel {
    /**
     * @param {HTMLElement} element - The carousel container element
     * @param {Object} options - Configuration options
     */
    constructor(element, options = {}) {
      this.carousel = element;
      if (!this.carousel) return;

      // Configuration with defaults
      this.options = {
        cardsPerPage: options.cardsPerPage || 2,
        transitionDuration: options.transitionDuration || 300,
        autoplay: options.autoplay || false,
        autoplaySpeed: options.autoplaySpeed || 5000,
        ...options,
      };

      // DOM Elements
      this.track = this.carousel.querySelector(".featured-rewards__track");
      this.cards = this.carousel.querySelectorAll(".featured-rewards__card");
      this.prevBtn = this.carousel.querySelector(
        ".featured-rewards__nav--prev"
      );
      this.nextBtn = this.carousel.querySelector(
        ".featured-rewards__nav--next"
      );
      this.dotsContainer = this.carousel.querySelector(
        ".featured-rewards__dots"
      );
      this.dots = this.carousel.querySelectorAll(".featured-rewards__dot");

      // State
      this.currentPage = 0;
      this.totalCards = this.cards.length;
      this.totalPages = Math.ceil(this.totalCards / this.options.cardsPerPage);
      this.autoplayInterval = null;

      // Initialize
      this.init();
    }

    /**
     * Initialize the carousel
     */
    init() {
      if (!this.track || this.totalCards === 0) return;

      this.bindEvents();
      this.updateCarousel();
      this.updateButtons();
      this.updateDots();

      if (this.options.autoplay) {
        this.startAutoplay();
      }

      // Log initialization for debugging
      console.log(
        `[FeaturedRewardsCarousel] Initialized with ${this.totalCards} cards, ${this.totalPages} pages`
      );
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
      // Navigation buttons
      if (this.prevBtn) {
        this.prevBtn.addEventListener("click", () => this.prev());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener("click", () => this.next());
      }

      // Dot navigation
      this.dots.forEach((dot, index) => {
        dot.addEventListener("click", () => this.goToPage(index));
      });

      // Pause autoplay on hover
      if (this.options.autoplay) {
        this.carousel.addEventListener("mouseenter", () => this.stopAutoplay());
        this.carousel.addEventListener("mouseleave", () =>
          this.startAutoplay()
        );
      }

      // Handle window resize
      window.addEventListener("resize", () => this.handleResize());
    }

    /**
     * Navigate to previous page
     */
    prev() {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.updateCarousel();
        this.updateButtons();
        this.updateDots();
      }
    }

    /**
     * Navigate to next page
     */
    next() {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++;
        this.updateCarousel();
        this.updateButtons();
        this.updateDots();
      }
    }

    /**
     * Navigate to specific page
     * @param {number} pageIndex - The page index to navigate to
     */
    goToPage(pageIndex) {
      if (pageIndex >= 0 && pageIndex < this.totalPages) {
        this.currentPage = pageIndex;
        this.updateCarousel();
        this.updateButtons();
        this.updateDots();
      }
    }

    /**
     * Update carousel position
     */
    updateCarousel() {
      // Calculate offset based on viewport width and cards per page
      const viewport = this.carousel.querySelector(
        ".featured-rewards__viewport"
      );
      if (!viewport) return;

      const viewportWidth = viewport.offsetWidth;
      const offset = this.currentPage * viewportWidth;

      this.track.style.transform = `translateX(-${offset}px)`;
    }

    /**
     * Update navigation button states
     */
    updateButtons() {
      if (this.prevBtn) {
        this.prevBtn.disabled = this.currentPage === 0;
        this.prevBtn.style.opacity = this.currentPage === 0 ? "0.5" : "1";
      }
      if (this.nextBtn) {
        this.nextBtn.disabled = this.currentPage >= this.totalPages - 1;
        this.nextBtn.style.opacity =
          this.currentPage >= this.totalPages - 1 ? "0.5" : "1";
      }
    }

    /**
     * Update dot indicators
     */
    updateDots() {
      this.dots.forEach((dot, index) => {
        dot.classList.toggle(
          "featured-rewards__dot--active",
          index === this.currentPage
        );
      });
    }

    /**
     * Start autoplay
     */
    startAutoplay() {
      if (this.autoplayInterval) return;

      this.autoplayInterval = setInterval(() => {
        if (this.currentPage < this.totalPages - 1) {
          this.next();
        } else {
          this.goToPage(0);
        }
      }, this.options.autoplaySpeed);
    }

    /**
     * Stop autoplay
     */
    stopAutoplay() {
      if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
      }
    }

    /**
     * Handle window resize
     */
    handleResize() {
      // Recalculate and update carousel on resize
      this.updateCarousel();
    }

    /**
     * Destroy carousel instance
     */
    destroy() {
      this.stopAutoplay();
      // Remove event listeners if needed
    }
  }

  // Export to Rans namespace
  Rans.FeaturedRewardsCarousel = FeaturedRewardsCarousel;

  /**
   * Auto-initialize carousels on DOM ready
   */
  function initCarousels() {
    const carousels = document.querySelectorAll(".featured-rewards");
    carousels.forEach((carousel) => {
      // Check if already initialized
      if (!carousel.dataset.carouselInitialized) {
        new FeaturedRewardsCarousel(carousel);
        carousel.dataset.carouselInitialized = "true";
      }
    });
  }

  // Initialize on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCarousels);
  } else {
    initCarousels();
  }
})();
