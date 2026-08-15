/* Timeline · keyboard-navigable, horizontal history rail.
 *
 * - Renders one node per event with the active node's detail card floating
 *   directly above the rail.
 * - Left/Right keys cycle through events (the rail is also a roving-tabindex
 *   toolbar so AT users discover the actions).
 * - Progress fill from the first event up to the active one mirrors Earth's
 *   "story so far".
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  TIMELINE_EVENTS,
  type AccentTag,
  type EraTag,
  type TimelineEvent,
} from '@/data/timelineEvents';
import styles from './Timeline.module.css';

const ERA_LABELS: Record<EraTag, string> = {
  cosmic: 'Cosmic',
  geological: 'Geological',
  biological: 'Biological',
  human: 'Human',
};

export interface TimelineProps {
  /** Override the default event list (mainly for tests / storyboard). */
  events?: readonly TimelineEvent[];
  /** Initial active index. Defaults to the last event ("now"). */
  initialIndex?: number;
  /** Optional header copy rendered above the rail. */
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function Timeline({
  events = TIMELINE_EVENTS,
  initialIndex,
  eyebrow = 'Earth in 9 chapters',
  title = '一条缓慢的弧线',
  subtitle = '从一团星云,到此刻抬头可见的蓝色——约 46 亿年里发生了什么?沿时间轴慢慢看去。',
}: TimelineProps) {
  const lastIndex = events.length - 1;
  const [activeIndex, setActiveIndex] = useState<number>(
    Math.min(Math.max(initialIndex ?? lastIndex, 0), lastIndex)
  );

  const railRef = useRef<HTMLDivElement | null>(null);

  const active = events[activeIndex];

  // Roving tabindex — keeps keyboard focus on the active node only.
  const move = (delta: number) => {
    setActiveIndex((i) => {
      const next = Math.min(Math.max(i + delta, 0), lastIndex);
      return next;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!railRef.current?.contains(document.activeElement)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        move(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        move(-1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActiveIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setActiveIndex(lastIndex);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lastIndex]);

  // Move focus to the newly active node so keyboard / screen-reader users
  // can keep navigating without having to traverse the DOM manually.
  useEffect(() => {
    if (!railRef.current) return;
    const btn = railRef.current.querySelector<HTMLButtonElement>(
      `[data-node-index="${activeIndex}"]`
    );
    btn?.focus({ preventScroll: true });
  }, [activeIndex]);

  const progress = useMemo(() => {
    if (events.length <= 1) return 0;
    return (activeIndex / (events.length - 1)) * 100;
  }, [activeIndex, events.length]);

  return (
    <section id="timeline" className={styles.wrap} aria-labelledby="timeline-heading">
      <header className={styles.intro}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 id="timeline-heading" className={styles.title}>
          {title}
        </h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>

      <div className={styles.stage}>
        <article
          className={styles.detail}
          aria-live="polite"
          aria-atomic="true"
          key={active.id}
          data-accent={(active.accent as AccentTag) || 'stellar'}
        >
          <div className={styles.detailMeta}>
            <span className={styles.eraTag}>{ERA_LABELS[active.era]}</span>
            <span aria-hidden="true">·</span>
            <span>Sequence {String(activeIndex + 1).padStart(2, '0')} / {events.length}</span>
          </div>
          <div className={styles.detailYear}>{active.yearLabel}</div>
          <h3 className={styles.detailTitle}>
            {active.title}
            {active.subtitle ? (
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>
                {' '}— {active.subtitle}
              </span>
            ) : null}
          </h3>
          <p className={styles.detailDesc}>{active.description}</p>
        </article>

        <div
          className={styles.rail}
          ref={railRef}
          role="toolbar"
          aria-label="地球历史时间轴"
          aria-controls="timeline-heading"
        >
          <div className={styles.railTrack} aria-hidden="true" />
          <div
            className={styles.railProgress}
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />

          {events.map((event, idx) => (
            <button
              key={event.id}
              type="button"
              data-node-index={idx}
              data-active={idx === activeIndex}
              data-accent={(event.accent as AccentTag) || 'stellar'}
              className={styles.node}
              onClick={() => setActiveIndex(idx)}
              aria-label={`${event.yearLabel} — ${event.title}`}
              aria-pressed={idx === activeIndex}
              tabIndex={idx === activeIndex ? 0 : -1}
            >
              <span className={styles.nodeDot} aria-hidden="true" />
              <span className={styles.nodeYear}>{event.yearLabel}</span>
            </button>
          ))}
        </div>

        <p className={styles.hint}>
          Navigate with <kbd>←</kbd> <kbd>→</kbd> or click any marker
        </p>
      </div>
    </section>
  );
}

export default Timeline;
