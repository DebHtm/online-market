import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Product } from '../../types/Product';
import { ProductCard, ProductCardSkeleton } from '../ProductCard';
import styles from './CardCarousel.module.scss';

type Props = {
  products: Product[];
  title: string;
  fullPrice: boolean;
  isLoading?: boolean;
  showDiscount?: boolean;
  compactCards?: boolean;
  subtitle?: string;
  newModels?: { subtitle: string; catalogPath: string };
};

export const CardCarousel = ({
  products,
  title,
  fullPrice,
  isLoading = false,
  showDiscount = false,
  compactCards = false,
  subtitle,
  newModels,
}: Props) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const { t } = useTranslation();
  const titleId = useId();
  const sliderId = useId();
  const visibleProducts = useMemo(() => {
    if (title === 'You may also like') {
      return [...products].sort(() => Math.random() - 0.5).slice(0, 30);
    }

    return products;
  }, [products, title]);

  const newProductIds = useMemo(() => {
    const ids = new Set<number>();
    const images = new Set<string>();
    const latestYear = visibleProducts[0]?.year;

    if (newModels) {
      for (const product of visibleProducts) {
        if (product.year === latestYear && !images.has(product.image)) {
          ids.add(product.id);
          images.add(product.image);
        }
      }
    }

    return ids;
  }, [newModels, visibleProducts]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) {
      return;
    }

    const updateEdges = () => {
      const start = slider.scrollLeft <= 1;
      const end =
        slider.scrollWidth - slider.clientWidth - slider.scrollLeft <= 1;
      setEdges(previous =>
        previous.start === start && previous.end === end
          ? previous
          : { start, end },
      );
    };

    const observer = new ResizeObserver(updateEdges);
    observer.observe(slider);
    slider.addEventListener('scroll', updateEdges, { passive: true });
    updateEdges();

    return () => {
      observer.disconnect();
      slider.removeEventListener('scroll', updateEdges);
    };
  }, [visibleProducts]);

  const move = (direction: -1 | 1) => {
    const slider = sliderRef.current;
    const nextCard = slider?.children[1];
    if (!(nextCard instanceof HTMLElement) || !slider) {
      return;
    }

    const step = nextCard.offsetLeft;
    const index = Math.round(slider.scrollLeft / step);
    slider.scrollTo({ left: (index + direction) * step });
  };

  return (
    <section
      className={
        newModels ? `${styles.section} ${styles.showcase}` : styles.section
      }
      aria-labelledby={titleId}
    >
      <div className={styles.header}>
        <div>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {(subtitle || newModels?.subtitle) && (
            <p className={styles.subtitle}>{subtitle || newModels?.subtitle}</p>
          )}
        </div>

        {newModels && (
          <Link className={styles.catalog} to={newModels.catalogPath}>
            {t('newModels.all')}
          </Link>
        )}
        <div className={styles.buttons}>
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label={t('hero.previous')}
            aria-controls={sliderId}
            disabled={isLoading || edges.start}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label={t('hero.next')}
            aria-controls={sliderId}
            disabled={isLoading || edges.end}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        id={sliderId}
        className={styles.slider}
        ref={sliderRef}
        aria-busy={isLoading}
      >
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => (
              <ProductCardSkeleton
                key={index}
                compact={compactCards || Boolean(newModels)}
              />
            ))
          : visibleProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                turnon={fullPrice}
                showDiscount={showDiscount}
                compact={compactCards || Boolean(newModels)}
                isNew={newProductIds.has(product.id)}
              />
            ))}
      </div>
    </section>
  );
};
