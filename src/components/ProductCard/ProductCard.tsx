import { Check, Heart } from 'lucide-react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { ProductsContext } from '../../context/ProductsContext';
import { Product } from '../../types/Product';
import styles from './ProductCard.module.scss';

type Props = {
  product: Product;
  turnon: boolean;
  compact?: boolean;
  isNew?: boolean;
};

const formatPrice = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

export const ProductCard = ({
  product,
  turnon,
  compact = false,
  isNew = false,
}: Props) => {
  const { cart, favorites, toggleCart, toggleFavorite } =
    useContext(ProductsContext);
  const { t } = useTranslation();
  const location = useLocation();
  const isAdded = cart.some(item => item.id === product.itemId);
  const isFavorite = favorites.some(item => item.id === product.itemId);

  const scrollFromDetails = () => {
    if (location.pathname.split('/').length > 2) {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
    }
  };

  const brand = product.name.startsWith('Apple ') ? 'Apple ' : '';
  const name = product.name.slice(brand.length);

  return (
    <article
      className={compact ? `${styles.card} ${styles.compact}` : styles.card}
    >
      <div className={styles.media}>
        <img src={`./${product.image}`} alt="" loading="lazy" />
        {isNew && <span className={styles.badge}>{t('newModels.badge')}</span>}
      </div>

      <h3 className={styles.title}>
        <Link
          to={`/${product.category}/${product.itemId}`}
          onClick={scrollFromDetails}
        >
          <span className={styles.brand}>{brand}</span>
          {name}
        </Link>
      </h3>

      <div className={styles.prices}>
        <span>{formatPrice.format(product.price)}</span>
        {turnon && <s>{formatPrice.format(product.fullPrice)}</s>}
      </div>

      <dl className={styles.specs}>
        <div>
          <dt>{t('screen')}</dt>
          <dd>{product.screen}</dd>
        </div>
        <div>
          <dt>{t('capacity')}</dt>
          <dd>{product.capacity}</dd>
        </div>
        <div>
          <dt>{t('ram')}</dt>
          <dd>{product.ram}</dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.buy}
          aria-pressed={isAdded}
          onClick={() => {
            toggleCart(product.itemId);
            scrollFromDetails();
          }}
        >
          {isAdded ? (
            <>
              <Check size={15} aria-hidden="true" />
              {t('buttonadd')}
            </>
          ) : (
            <>
              <span className={styles['buy-label']}>{t('button')}</span>
              <span className={styles['short-buy-label']}>
                {t('newModels.add')}
              </span>
            </>
          )}
        </button>
        <button
          type="button"
          className={styles.favorite}
          aria-label={t('newModels.favorite', { product: product.name })}
          aria-pressed={isFavorite}
          onClick={() => toggleFavorite(product.itemId, turnon)}
        >
          <Heart
            size={18}
            fill={isFavorite ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  );
};
