import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

// Create "atom" ease curve (matches design tokens)
CustomEase.create('atom', '0.625, 0.05, 0, 1');

// Duration constants (matches design tokens)
export const DURATION = {
  quarter: 0.15,
  half: 0.3,
  threeQuarters: 0.45,
  default: 0.6,
} as const;

// Set global defaults
gsap.defaults({
  ease: 'atom',
  duration: DURATION.default,
});

const LABEL_SELECTORS = '.button__label';

/**
 * Detect pre-rendered clones or create them dynamically
 */
export function initRotateClones() {
  const elements = document.querySelectorAll<HTMLElement>('[data-hover-rotate]');
  if (!elements.length) return () => {};

  elements.forEach((el) => {
    if (el.hasAttribute('data-clones-ready')) return;

    // Check if clone is pre-rendered (Astro pattern)
    const hasPreRenderedClone = el.querySelector('[aria-hidden="true"]');
    if (hasPreRenderedClone) {
      el.setAttribute('data-clones-ready', '');
      return;
    }

    // Fallback: create clone dynamically (non-Astro)
    const items = el.querySelectorAll<HTMLElement>(LABEL_SELECTORS);
    if (!items.length) return;

    const r = parseFloat(getComputedStyle(el).getPropertyValue('--r')) || 20;

    items.forEach((item) => {
      const clone = item.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      clone.classList.add('button__label--clone');
      clone.style.position = 'absolute';
      clone.style.width = '100%';
      clone.style.height = '100%';
      clone.style.transformOrigin = `50% var(--y, 1100%)`;
      clone.style.transform = `rotate(${-r}deg)`;
      clone.style.opacity = '0';
      
      if (item.parentElement) {
        item.parentElement.style.position = 'relative';
        item.parentElement.appendChild(clone);
      }
    });

    el.setAttribute('data-clones-ready', '');
  });

  return () => {}; // No cleanup needed (DOM structure)
}

/**
 * Calculate --y transform-origin based on text length
 */
export function initRotateCalc() {
  const elements = document.querySelectorAll<HTMLElement>('[data-hover-rotate]');
  if (!elements.length) return () => {};

  const Y_PADDING = 30;
  const Y_BASE_OFFSET = 12;
  const Y_CHAR_MULTIPLIER = 6;
  const Y_MIN = 100;
  const Y_MAX = 10000;

  function getMaxChars(el: HTMLElement): number {
    const labels = el.querySelectorAll<HTMLElement>(LABEL_SELECTORS);
    if (!labels.length) return (el.textContent || '').trim().length;
    let max = 0;
    labels.forEach((label) => {
      // Skip clones (only count originals)
      if (label.getAttribute('aria-hidden') === 'true') return;
      const len = (label.textContent || '').trim().length;
      if (len > max) max = len;
    });
    return max;
  }

  function computeY(chars: number): number {
    let y = Math.round(Y_MIN + Y_PADDING * (Y_BASE_OFFSET + Y_CHAR_MULTIPLIER * chars));
    return Math.max(Y_MIN, Math.min(y, Y_MAX));
  }

  function update(el: HTMLElement) {
    const chars = getMaxChars(el);
    const y = computeY(chars);
    el.style.setProperty('--y', y + '%');
  }

  // Initial calculation
  elements.forEach((el) => update(el));

  // Watch for text changes
  const observer = new MutationObserver((mutations) => {
    const touched = new Set<HTMLElement>();
    mutations.forEach((m) => {
      const target = m.target.nodeType === Node.TEXT_NODE
        ? m.target.parentElement
        : (m.target as HTMLElement);
      if (!target) return;
      const root = target.closest<HTMLElement>('[data-hover-rotate]');
      if (root) touched.add(root);
    });
    touched.forEach((el) => update(el));
  });

  observer.observe(document.body, {
    characterData: true,
    childList: true,
    subtree: true,
  });

  // Recalculate on resize
  let resizeTimer: ReturnType<typeof setTimeout>;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => elements.forEach((el) => update(el)), 150);
  };

  window.addEventListener('resize', onResize);

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', onResize);
    clearTimeout(resizeTimer);
  };
}

/**
 * Execute rotation animation on hover
 */
export function initHoverRotate() {
  const elements = document.querySelectorAll<HTMLElement>('[data-hover-rotate]');
  if (!elements.length) return () => {};

  function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isClone(item: HTMLElement): boolean {
    return (
      item.getAttribute('aria-hidden') === 'true' ||
      item.classList.contains('button__label--clone')
    );
  }

  const listeners: Array<{ el: HTMLElement; handler: EventListener }> = [];

  elements.forEach((el) => {
    let lastTime = 0;
    const COOLDOWN = 100; // Prevent spam

    const onEnter = () => {
      if (prefersReducedMotion()) return;
      const now = performance.now();
      if (now - lastTime < COOLDOWN) return;
      lastTime = now;

      const targets = el.querySelectorAll<HTMLElement>(LABEL_SELECTORS);
      const items = targets.length ? Array.from(targets) : [el];
      const r = parseFloat(getComputedStyle(el).getPropertyValue('--r')) || 20;
      const duration = DURATION.half; // 0.3s

      const originals: HTMLElement[] = [];
      const clones: HTMLElement[] = [];

      items.forEach((item) => {
        if (isClone(item)) {
          clones.push(item);
        } else {
          originals.push(item);
        }
      });

      // Kill previous animation and reset to rest state
      if ((el as any)._rotTl) {
        (el as any)._rotTl.kill();
      }

      originals.forEach((orig) => gsap.set(orig, { rotation: 0, opacity: 1 }));
      clones.forEach((clone) => gsap.set(clone, { rotation: -r, opacity: 0 }));

      // Show clones
      clones.forEach((clone) => gsap.set(clone, { opacity: 1 }));

      // Create timeline
      const tl = gsap.timeline({
        onComplete: () => {
          // Reset to rest state
          originals.forEach((orig) => gsap.set(orig, { rotation: 0, opacity: 1 }));
          clones.forEach((clone) => gsap.set(clone, { rotation: -r, opacity: 0 }));
          (el as any)._rotTl = null;
        },
      });

      // Animate originals: rotate +r and fade out
      tl.to(
        originals,
        {
          rotation: `+=${r}`,
          opacity: 0,
          duration,
          ease: 'atom',
          stagger: 0.075,
        },
        0,
      );

      // Animate clones: rotate from -r to 0 and fade in
      tl.to(
        clones,
        {
          rotation: 0,
          opacity: 1,
          duration,
          ease: 'atom',
          stagger: 0.075,
        },
        0,
      );

      (el as any)._rotTl = tl;
    };

    el.addEventListener('pointerenter', onEnter);
    listeners.push({ el, handler: onEnter as EventListener });
  });

  return () => {
    listeners.forEach(({ el, handler }) => {
      el.removeEventListener('pointerenter', handler);
      if ((el as any)._rotTl) {
        (el as any)._rotTl.kill();
        (el as any)._rotTl = null;
      }
    });
  };
}

export { gsap };
