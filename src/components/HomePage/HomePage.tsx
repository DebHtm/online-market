import React, { useMemo } from 'react';
import { CardCarousel } from '../CardCarousel';
import { Carousel } from '../Carousel';
import styles from './HomePage.module.scss';
import { Category } from '../Category';
import { useProducts } from '../../hooks/useProducts';
import { useTranslation } from 'react-i18next';

export const HomePage: React.FC = () => {
  const { phones, products, tablets, accessories, isLoading } = useProducts();
  const newest = useMemo(() => {
    return [...products].sort((a, b) => b.year - a.year);
  }, [products]);
  const { t } = useTranslation();

  const hotPrices = useMemo(() => {
    return [...products]
      .filter(p => p.fullPrice > p.price)
      .sort((a, b) => b.fullPrice - b.price - (a.fullPrice - a.price));
  }, [products]);

  return (
    <>
      <section className={styles.hero}>
        <h1 style={{ position: 'absolute', left: '-9999px' }}>
          Product Catalog
        </h1>
        <div className={styles.intro}>
          <p className={styles.title}>{t('title')}</p>
          <p className={styles.subtitle}>{t('hero.subtitle')}</p>
        </div>
        <Carousel />
      </section>

      <CardCarousel
        products={newest}
        isLoading={isLoading}
        title={t('titlebrend')}
        fullPrice={false}
        newModels={{
          subtitle: t('newModels.subtitle'),
          catalogPath: '/phones',
        }}
      />

      <Category phones={phones} tablets={tablets} accessories={accessories} />
      <CardCarousel
        products={hotPrices}
        isLoading={isLoading}
        title={t('titleprice')}
        subtitle={t('hotPricesSubtitle')}
        showDiscount
        fullPrice={true}
      />
    </>
  );
};
