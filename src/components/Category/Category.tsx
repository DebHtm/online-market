import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { Products } from '../../types/Product';
import styles from './Category.module.scss';

type Props = {
  phones: Products[];
  tablets: Products[];
  accessories: Products[];
};

const categories = [
  { id: 'phones', title: 'mobile' },
  { id: 'tablets', title: 'tablets' },
  { id: 'accessories', title: 'accessories' },
] as const;

export const Category = (products: Props) => {
  const { isLoading } = useProducts();
  const { t } = useTranslation();

  return (
    <section className={styles.section} aria-labelledby="category-heading">
      <h2 id="category-heading" className={styles.title}>
        <span className={styles['wide-title']}>{t('titlecategory')}</span>
        <span className={styles['short-title']}>
          {t('shopCategories.title')}
        </span>
      </h2>
      <p className={styles.subtitle}>{t('shopCategories.subtitle')}</p>
      <div className={styles.grid} aria-busy={isLoading}>
        {categories.map(({ id, title }) => (
          <Link
            key={id}
            className={`${styles.card} ${styles[id]}`}
            to={`/${id}`}
          >
            <div className={styles.details}>
              <h3>{t(title)}</h3>
              {isLoading ? (
                <span className={styles.skeleton} aria-hidden="true" />
              ) : (
                <p>
                  {t('shopCategories.models', { count: products[id].length })}
                </p>
              )}
            </div>
            <span className={styles.arrow} aria-hidden="true">
              <ArrowRight size={16} />
            </span>
            <div className={styles.media}>
              <img src={`./img/category-${id}.webp`} alt="" loading="lazy" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
