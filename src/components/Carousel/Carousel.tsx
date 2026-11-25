import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './Carousel.module.scss';

const slides = [
  { model: 'apple-iphone-14-pro', color: 'spaceblack' },
  { model: 'apple-iphone-13-pro-max', color: 'sierrablue' },
  { model: 'apple-iphone-14-pro', color: 'gold' },
];

export const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const { t } = useTranslation();
  const activeSlide = slides[currentIndex];

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (isHovered || hasFocus || motion.matches) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (!motion.matches) {
        setCurrentIndex((currentIndex + 1) % slides.length);
      }
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [currentIndex, isHovered, hasFocus]);

  const move = (direction: number) => {
    setCurrentIndex(
      index => (index + direction + slides.length) % slides.length,
    );
  };

  return (
    <section
      className={styles.carousel}
      aria-label={t('hero.carousel')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setHasFocus(true)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setHasFocus(false);
        }
      }}
      onTouchStart={event => {
        const touch = event.touches[0];

        touchStart.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchCancel={() => {
        touchStart.current = null;
      }}
      onTouchEnd={event => {
        const start = touchStart.current;

        touchStart.current = null;
        if (!start) {
          return;
        }

        const touch = event.changedTouches[0];
        const distance = touch.clientX - start.x;

        if (
          Math.abs(distance) >= 50 &&
          Math.abs(distance) > Math.abs(touch.clientY - start.y)
        ) {
          move(distance < 0 ? 1 : -1);
        }
      }}
    >
      <div className={styles.artwork} aria-hidden="true">
        {slides.map(({ model, color }, index) => (
          <img
            key={color}
            className={index === currentIndex ? styles.visible : undefined}
            src={`./img/phones/${model}/${color}/02.webp`}
            alt=""
          />
        ))}
      </div>

      <div className={styles.content}>
        <span className={styles.badge}>
          <Sparkles size={14} aria-hidden="true" />
          {t('hero.collection')}
        </span>
        <h2>{t('textincarusel')}</h2>
        <p>{t('secoundtext')}</p>
        <div className={styles.actions}>
          <Link
            className={styles.order}
            to={`/phones/${activeSlide.model}-128gb-${activeSlide.color}`}
          >
            {t('buttuncarusel')}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link className={styles.catalog} to="/phones">
            {t('hero.catalog')}
          </Link>
        </div>
      </div>

      <div className={styles.arrows}>
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label={t('hero.previous')}
        >
          <ChevronLeft size={19} />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label={t('hero.next')}
        >
          <ChevronRight size={19} />
        </button>
      </div>
      <div className={styles.dots}>
        {slides.map(({ color }, index) => (
          <button
            key={color}
            type="button"
            aria-label={t('hero.slide', { number: index + 1 })}
            aria-pressed={index === currentIndex}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </section>
  );
};
