import { useRef, useEffect, useCallback, useState } from 'react';
import GameCard from '../GameCard/GameCard';
import CarouselDots from '../CarouselDots/CarouselDots';
import styles from './GamesCarousel.module.css';

const AUTOPLAY_INTERVAL = 3500;

export default function GamesCarousel({ games }) {
  const trackRef = useRef(null);
  const autoplayRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const pausedRef = useRef(false);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const hasDragged = useRef(false);
  const capturedPointerId = useRef(null);

  // Respect reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll to a specific card dynamically based on element position
  const scrollTo = useCallback((index) => {
    const el = trackRef.current;
    if (!el) return;
    const clampedIndex = Math.max(0, Math.min(index, games.length - 1));
    const targetItem = el.children[clampedIndex];
    if (targetItem) {
      const scrollPos = targetItem.offsetLeft - el.offsetLeft;
      el.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
    setActiveIndex(clampedIndex);
  }, [games.length]);

  // Advance by 1 card smoothly
  const advance = useCallback(() => {
    if (pausedRef.current) return;
    setActiveIndex((prev) => {
      const next = (prev + 1) % games.length;
      const el = trackRef.current;
      if (el && el.children[next]) {
        const scrollPos = el.children[next].offsetLeft - el.offsetLeft;
        el.scrollTo({ left: scrollPos, behavior: 'smooth' });
      }
      return next;
    });
  }, [games.length]);

  const scrollPrev = useCallback(() => {
    pause();
    const nextIdx = activeIndex === 0 ? games.length - 1 : activeIndex - 1;
    scrollTo(nextIdx);
    setTimeout(resume, 3000);
  }, [activeIndex, games.length, scrollTo]);

  const scrollNext = useCallback(() => {
    pause();
    const nextIdx = (activeIndex + 1) % games.length;
    scrollTo(nextIdx);
    setTimeout(resume, 3000);
  }, [activeIndex, games.length, scrollTo]);

  // Start autoplay
  useEffect(() => {
    if (prefersReducedMotion) return;
    autoplayRef.current = setInterval(advance, AUTOPLAY_INTERVAL);
    return () => clearInterval(autoplayRef.current);
  }, [advance, prefersReducedMotion]);

  // Sync active dot on scroll by finding the closest card
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const handler = () => {
      const children = Array.from(el.children);
      if (!children.length) return;
      const currentScroll = el.scrollLeft;
      let closestIdx = 0;
      let minDiff = Infinity;
      children.forEach((child, idx) => {
        const offset = child.offsetLeft - el.offsetLeft;
        const diff = Math.abs(offset - currentScroll);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setActiveIndex(closestIdx);
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [games.length]);

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  // Pointer drag - do not capture pointer immediately on pointerdown,
  // so that clicks on child Links and Buttons fire normally
  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    hasDragged.current = false;
    dragStartX.current = e.clientX;
    dragScrollLeft.current = trackRef.current?.scrollLeft ?? 0;
    pause();
  };

  const onPointerMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStartX.current;

    // Only initiate drag scroll if movement exceeds threshold
    if (!hasDragged.current && Math.abs(dx) > 6) {
      hasDragged.current = true;
      try {
        trackRef.current?.setPointerCapture?.(e.pointerId);
        capturedPointerId.current = e.pointerId;
      } catch {
        /* Ignore */
      }
    }

    if (hasDragged.current && trackRef.current) {
      trackRef.current.scrollLeft = dragScrollLeft.current - dx;
    }
  };

  const onPointerUp = (e) => {
    if (isDragging.current) {
      if (capturedPointerId.current !== null) {
        try {
          trackRef.current?.releasePointerCapture?.(capturedPointerId.current);
        } catch {
          /* Ignore */
        }
        capturedPointerId.current = null;
      }
      isDragging.current = false;
      setTimeout(resume, 1000);
      // Reset hasDragged shortly after click event has processed
      setTimeout(() => {
        hasDragged.current = false;
      }, 60);
    }
  };

  // Prevent accidental card navigation if user was actively dragging
  const handleClickCapture = (e) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section className={styles.section} aria-label="Games carousel">
      {/* Changing Arrow: Move to previous game */}
      <button
        type="button"
        className={`${styles.navArrow} ${styles.navArrowLeft}`}
        onClick={scrollPrev}
        aria-label="Previous game"
        title="Previous game"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      {/* Changing Arrow: Move to next game */}
      <button
        type="button"
        className={`${styles.navArrow} ${styles.navArrowRight}`}
        onClick={scrollNext}
        aria-label="Next game"
        title="Next game"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      <div
        className={styles.track}
        ref={trackRef}
        role="list"
        aria-live="polite"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocus={pause}
        onBlur={resume}
        onTouchStart={pause}
        onTouchEnd={() => setTimeout(resume, 1500)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={handleClickCapture}
      >
        {games.map((game) => (
          <div key={game.id} role="listitem" className={styles.item}>
            <GameCard game={game} />
          </div>
        ))}
      </div>

      <CarouselDots
        count={games.length}
        active={activeIndex}
        onSelect={scrollTo}
        games={games}
      />
    </section>
  );
}
