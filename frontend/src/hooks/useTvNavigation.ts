import { useEffect, useRef } from 'react';

interface TvNavigationOptions {
  active: boolean;
  onEscape?: () => void;
  onEnter?: () => void;
}

export const useTvNavigation = (options: TvNavigationOptions) => {
  const { active, onEscape, onEnter } = options;
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Get all currently visible and focusable TV elements
      const elements = Array.from(
        document.querySelectorAll('[data-nav="true"]')
      ) as HTMLElement[];

      if (elements.length === 0) return;

      const activeEl = document.activeElement as HTMLElement;
      
      // If the current focused element is not in our list, focus the first one
      let currentIndex = elements.indexOf(activeEl);
      if (currentIndex === -1) {
        // Try focusing the first element
        elements[0].focus();
        lastFocusedRef.current = elements[0];
        return;
      }

      // Handle Escape/Back key
      if (e.key === 'Escape' || e.key === 'Backspace' && activeEl.tagName !== 'INPUT') {
        if (onEscape) {
          e.preventDefault();
          onEscape();
        }
        return;
      }

      // Handle Enter key for custom triggers if not already handled by buttons
      if (e.key === 'Enter') {
        if (activeEl && activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA') {
          // Trigger a click event programmatically
          activeEl.click();
          if (onEnter) onEnter();
          return;
        }
      }

      // We only handle directional keys
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        return;
      }

      e.preventDefault(); // Prevent page scrolling

      const currentRect = activeEl.getBoundingClientRect();
      const currentCenterX = currentRect.left + currentRect.width / 2;
      const currentCenterY = currentRect.top + currentRect.height / 2;

      let bestTarget: HTMLElement | null = null;
      let minDistance = Infinity;

      elements.forEach((target) => {
        if (target === activeEl) return;

        const targetRect = target.getBoundingClientRect();
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        const dx = targetCenterX - currentCenterX;
        const dy = targetCenterY - currentCenterY;

        let isValid = false;

        // Spatial Direction Filtering
        switch (e.key) {
          case 'ArrowLeft':
            // Target is to the left of the current element
            isValid = dx < 0 && Math.abs(dy) < Math.abs(dx) * 1.5;
            break;
          case 'ArrowRight':
            // Target is to the right of the current element
            isValid = dx > 0 && Math.abs(dy) < Math.abs(dx) * 1.5;
            break;
          case 'ArrowUp':
            // Target is above the current element
            isValid = dy < 0 && Math.abs(dx) < Math.abs(dy) * 1.5;
            break;
          case 'ArrowDown':
            // Target is below the current element
            isValid = dy > 0 && Math.abs(dx) < Math.abs(dy) * 1.5;
            break;
        }

        if (isValid) {
          // Euclidean distance with a multiplier on the perpendicular axis
          // to favor elements directly aligned in the direction of movement
          let distance = 0;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            distance = Math.pow(dx, 2) + Math.pow(dy * 2.2, 2);
          } else {
            distance = Math.pow(dy, 2) + Math.pow(dx * 2.2, 2);
          }

          if (distance < minDistance) {
            minDistance = distance;
            bestTarget = target;
          }
        }
      });

      if (bestTarget) {
        const targetElement = bestTarget as HTMLElement;
        targetElement.focus();
        lastFocusedRef.current = targetElement;
        
        // Scroll into view if needed
        targetElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Proactively focus the first focusable element or restore focus
    setTimeout(() => {
      const elements = Array.from(
        document.querySelectorAll('[data-nav="true"]')
      ) as HTMLElement[];
      
      if (elements.length > 0) {
        const activeEl = document.activeElement as HTMLElement;
        if (!elements.includes(activeEl)) {
          if (lastFocusedRef.current && elements.includes(lastFocusedRef.current)) {
            lastFocusedRef.current.focus();
          } else {
            elements[0].focus();
          }
        }
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, onEscape, onEnter]);
};
