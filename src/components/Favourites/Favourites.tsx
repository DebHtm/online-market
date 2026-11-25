import { ChevronRight, Heart, House } from 'lucide-react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ProductsContext } from '../../context/ProductsContext';
import { ProductCard } from '../ProductCard';
import styles from './Favourites.module.scss';

export const Favourites = () => {
  const { favorites, products, isLoading } = useContext(ProductsContext);
  const { t } = useTranslation();
  const productsById = new Map(
    products.map(product => [product.itemId, product]),
  );
  const savedProducts = favorites.flatMap(({ id }) => {
    const product = productsById.get(id);

    return product ? [product] : [];
  });
  const isPending =
    isLoading && favorites.length > 0 && savedProducts.length === 0;

  return (
    <section className={styles.section} aria-labelledby="favorites-title">
      <nav
        className={styles.breadcrumbs}
        aria-label={t('productDetails.breadcrumbs')}
      >
        <Link to="/home" aria-label={t('home')}>
          <House size={15} aria-hidden="true" />
        </Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{t('favourites')}</span>
      </nav>

      <h1 id="favorites-title" className={styles.title}>
        {t('favourites')}
      </h1>
      <p className={styles.count} aria-live="polite">
        {isPending
          ? t('header.loading')
          : t('favoritesPage.count', { count: savedProducts.length })}
      </p>

      {savedProducts.length > 0 && (
        <ul className={styles.grid}>
          {savedProducts.map(product => (
            <li key={product.itemId}>
              <ProductCard
                product={product}
                turnon={product.fullPrice > product.price}
                showDiscount
                compact
              />
            </li>
          ))}
        </ul>
      )}

      {!isPending && savedProducts.length === 0 && (
        <div className={styles.empty}>
          <Heart size={30} aria-hidden="true" />
          <p>{t('favoritesPage.empty')}</p>
          <Link to="/phones">{t('cartPage.continue')}</Link>
        </div>
      )}
    </section>
  );
};
