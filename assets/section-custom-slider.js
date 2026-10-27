(() => {
  if (customElements.get('custom-slider')) return;
  const toPositive = (value, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  class CustomSlider extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('[data-cs-track]');
      this.slides = Array.from(this.querySelectorAll('[data-cs-slide]'));
      this.total = this.slides.length;
      if (!this.track || this.total < 2) return;
      this.abort = new AbortController();
      this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.readConfig();
      this.cacheElements();
      this.index = 0;
      this.timer = null;
      this.remaining = this.config.speed;
      this.startedAt = 0;
      this.userPaused = this.motionQuery.matches;
      this.suspendReasons = new Set();
      this.bindEvents();
      this.bindSwipe();
      this.bindAutoplayGuards();
      this.bindEditorEvents();
      this.render({ announce: false });
      this.classList.add('is-ready');
      this.syncAutoplay();
    }
    disconnectedCallback() {
      this.abort?.abort();
      this.observer?.disconnect();
      clearTimeout(this.timer);
      this.timer = null;
      this.classList.remove('is-dragging');
      this.track?.style.removeProperty('--cs-drag');
    }
    readConfig() {
      const d = this.dataset;
      this.config = {
        transition: d.transition,
        autoplay: d.autoplay === 'true',
        speed: toPositive(d.speed, 5) * 1000,
        pauseOnHover: d.pauseHover === 'true',
        stopOnInteraction: d.stopOnInteraction === 'true',
        loop: d.loop === 'true',
        threshold: toPositive(d.swipeThreshold, 50),
        labels: {
          slide: d.labelSlide,
          counter: d.labelCounter,
          play: d.labelPlay,
          pause: d.labelPause,
        },
      };
    }
    cacheElements() {
      this.prevBtn = this.querySelector('[data-cs-prev]');
      this.nextBtn = this.querySelector('[data-cs-next]');
      this.playBtn = this.querySelector('[data-cs-play]');
      this.counter = this.querySelector('[data-cs-counter]');
      this.liveRegion = this.querySelector('[data-cs-live]');
      this.dots = Array.from(this.querySelectorAll('[data-cs-dot]'));
    }
    goTo(target, { user = false } = {}) {
      const next = this.normalize(target);
      if (next === null || next === this.index) return;
      if (this.slides[this.index].contains(document.activeElement)) {
        this.slides[next].inert = false;
        this.slides[next].focus({ preventScroll: true });
      }
      this.index = next;
      if (user && this.config.stopOnInteraction) this.stopAutoplay();
      this.render({ announce: user });
      this.restartTimer();
    }
    normalize(i) {
      if (this.config.loop) return (i + this.total) % this.total;
      return i >= 0 && i < this.total ? i : null;
    }
    next(options) {
      this.goTo(this.index + 1, options);
    }
    prev(options) {
      this.goTo(this.index - 1, options);
    }
    render({ announce }) {
      const current = this.index;
      this.style.setProperty('--cs-index', current);
      this.slides.forEach((slide, n) => {
        const active = n === current;
        slide.classList.toggle('is-active', active);
        slide.inert = !active;
      });
      this.dots.forEach((dot, n) => {
        if (n === current) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      if (this.counter) this.counter.textContent = this.format(this.config.labels.counter);
      if (!this.config.loop) {
        this.prevBtn?.setAttribute('aria-disabled', String(current === 0));
        this.nextBtn?.setAttribute('aria-disabled', String(current === this.total - 1));
      }
      if (announce && this.liveRegion) {
        this.liveRegion.textContent = this.format(this.config.labels.slide);
      }
    }
    format(template = '') {
      return template.replace('[current]', this.index + 1);
    }
    bindEvents() {
      const { signal } = this.abort;
      this.addEventListener('click', (event) => {
        const button = event.target.closest('[data-cs-prev], [data-cs-next], [data-cs-dot], [data-cs-play]');
        if (!button) return;
        if (button.hasAttribute('data-cs-prev')) this.prev({ user: true });
        else if (button.hasAttribute('data-cs-next')) this.next({ user: true });
        else if (button.hasAttribute('data-cs-dot')) this.goTo(Number(button.dataset.csDot), { user: true });
        else this.togglePlay();
      }, { signal });
      this.addEventListener('keydown', (event) => {
        if (event.target.closest('input, textarea, select, [contenteditable]')) return;
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          this.prev({ user: true });
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          this.next({ user: true });
        } else if (event.key === 'Home') {
          event.preventDefault();
          this.goTo(0, { user: true });
        } else if (event.key === 'End') {
          event.preventDefault();
          this.goTo(this.total - 1, { user: true });
        }
      }, { signal });
      this.motionQuery.addEventListener('change', () => {
        if (this.motionQuery.matches) this.setUserPaused(true);
      }, { signal });
    }
    bindSwipe() {
      const { signal } = this.abort;
      const track = this.track;
      const followFinger = this.config.transition === 'slide';
      let pointerId = null;
      let startX = 0;
      let startY = 0;
      let deltaX = 0;
      let dragging = false;
      let blockClick = false;
      track.addEventListener('pointerdown', (event) => {
        if (dragging) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        deltaX = 0;
        dragging = false;
        blockClick = false;
      }, { signal });
      track.addEventListener('pointermove', (event) => {
        if (event.pointerId !== pointerId) return;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        if (!dragging) {
          if (dx === 0 && dy === 0) return;
          if (Math.abs(dy) > Math.abs(dx)) {
            pointerId = null;
            return;
          }
          dragging = true;
          track.setPointerCapture(pointerId);
          this.classList.add('is-dragging');
          this.suspend('drag');
        }
        deltaX = dx;
        if (followFinger) track.style.setProperty('--cs-drag', `${dx}px`);
      }, { signal });
      const end = (event) => {
        if (event.pointerId !== pointerId) return;
        pointerId = null;
        if (!dragging) return;
        dragging = false;
        this.classList.remove('is-dragging');
        track.style.setProperty('--cs-drag', '0px');
        this.resume('drag');
        blockClick = Math.abs(deltaX) >= this.config.threshold / 2;
        if (event.type === 'pointerup' && Math.abs(deltaX) >= this.config.threshold) {
          if (deltaX < 0) this.next({ user: true });
          else this.prev({ user: true });
        }
      };
      track.addEventListener('pointerup', end, { signal });
      track.addEventListener('pointercancel', end, { signal });
      track.addEventListener('click', (event) => {
        if (!blockClick || event.detail === 0) return;
        event.preventDefault();
        event.stopPropagation();
        blockClick = false;
      }, { capture: true, signal });
      track.addEventListener('dragstart', (event) => event.preventDefault(), { signal });
    }
    get isRunning() {
      return this.config.autoplay && !this.userPaused && this.suspendReasons.size === 0;
    }
    suspend(reason) {
      this.suspendReasons.add(reason);
      this.syncAutoplay();
    }
    resume(reason) {
      this.suspendReasons.delete(reason);
      this.syncAutoplay();
    }
    setUserPaused(paused) {
      this.userPaused = paused;
      clearTimeout(this.timer);
      this.timer = null;
      this.remaining = this.config.speed;
      this.syncAutoplay();
    }
    togglePlay() {
      if (this.userPaused && !this.config.loop && this.index === this.total - 1) this.goTo(0);
      this.setUserPaused(!this.userPaused);
    }
    stopAutoplay() {
      if (!this.config.autoplay || this.userPaused) return;
      this.setUserPaused(true);
    }
    syncAutoplay() {
      if (!this.config.autoplay) return;
      const running = this.isRunning;
      if (running && !this.timer) this.startTimer();
      if (!running && this.timer) this.pauseTimer();
      this.dataset.playing = String(!this.userPaused);
      this.dataset.suspended = String(this.suspendReasons.size > 0);
      if (this.playBtn) {
        this.playBtn.dataset.state = this.userPaused ? 'paused' : 'playing';
        this.playBtn.setAttribute('aria-label', this.userPaused ? this.config.labels.play : this.config.labels.pause);
      }
      this.liveRegion?.setAttribute('aria-live', running ? 'off' : 'polite');
    }
    startTimer() {
      this.startedAt = performance.now();
      this.timer = setTimeout(() => this.onTick(), this.remaining);
    }
    pauseTimer() {
      clearTimeout(this.timer);
      this.timer = null;
      this.remaining = Math.max(0, this.remaining - (performance.now() - this.startedAt));
    }
    restartTimer() {
      clearTimeout(this.timer);
      this.timer = null;
      this.remaining = this.config.speed;
      if (this.isRunning) this.startTimer();
    }
    onTick() {
      this.timer = null;
      if (!this.config.loop && this.index === this.total - 1) {
        this.setUserPaused(true);
        return;
      }
      this.next();
    }
    bindAutoplayGuards() {
      if (!this.config.autoplay) return;
      const { signal } = this.abort;
      if (this.config.pauseOnHover) {
        this.addEventListener('pointerenter', (event) => {
          if (event.pointerType === 'mouse') this.suspend('hover');
        }, { signal });
        this.addEventListener('pointerleave', (event) => {
          if (event.pointerType === 'mouse') this.resume('hover');
        }, { signal });
      }
      this.addEventListener('focusin', (event) => {
        if (event.target.closest('[data-cs-play]')) this.resume('focus');
        else if (event.target.matches(':focus-visible')) this.suspend('focus');
      }, { signal });
      this.addEventListener('focusout', (event) => {
        if (!this.contains(event.relatedTarget)) this.resume('focus');
      }, { signal });
      this.observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) this.resume('offscreen');
        else this.suspend('offscreen');
      });
      this.observer.observe(this);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.suspend('hidden');
        else this.resume('hidden');
      }, { signal });
    }
    bindEditorEvents() {
      if (!window.Shopify?.designMode) return;
      const { signal } = this.abort;
      this.addEventListener('shopify:block:select', (event) => {
        const index = this.slides.indexOf(event.target.closest('[data-cs-slide]'));
        if (index < 0) return;
        this.suspend('editor');
        this.goTo(index);
      }, { signal });
      this.addEventListener('shopify:block:deselect', () => this.resume('editor'), { signal });
    }
  }
  customElements.define('custom-slider', CustomSlider);
})();