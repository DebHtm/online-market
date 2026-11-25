import { Check, ChevronLeft, ChevronRight, Heart, House } from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { ProductsContext } from '../../context/ProductsContext';
import { Products } from '../../types';
import { CardCarousel } from '../CardCarousel';
import { NotProduct } from '../NotProduct';
import styles from './ProductDetailsPage.module.scss';

const categoryLabels = {
  phones: 'phone',
  tablets: 'tablets',
  accessories: 'accessories',
};

const colors: Record<string, string> = {
  black: '#151515',
  blue: '#427cb9',
  coral: '#ff7f50',
  gold: '#c48a51',
  graphite: '#4b4b4b',
  green: '#5f8f6b',
  midnight: '#242935',
  midnightgreen: '#355e5a',
  pink: '#ffc0cb',
  purple: '#9b6bcb',
  red: '#eb5757',
  rosegold: '#e0bfb8',
  sierrablue: '#9db7d6',
  silver: '#dedfe8',
  skyblue: '#87ceeb',
  spaceblack: '#2d2d2d',
  spacegray: '#4f4f4f',
  starlight: '#f5e6c8',
  white: '#f5f5f5',
  yellow: '#ffe471',
};

const colorKey = (color: string) => color.toLowerCase().replace(/[\s-]/g, '');
const summaryKeys = ['screen', 'resolution', 'processor', 'ram'] as const;
const specKeys = [...summaryKeys, 'camera', 'zoom', 'cell'] as const;
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

const Gallery = ({ product }: { product: Products }) => {
  const [index, setIndex] = useState(0);
  const { t } = useTranslation();
  const activeImage = product.images[index];

  return (
    <div className={styles.gallery}>
      <div className={styles.preview}>
        {activeImage && (
          <img key={activeImage} src={`./${activeImage}`} alt={product.name} />
        )}
      </div>
      <div
        className={styles.thumbnails}
        role="group"
        aria-label={t('productDetails.gallery')}
      >
        {product.images.map((image, number) => (
          <button
            key={image}
            type="button"
            aria-label={t('productDetails.photo', { number: number + 1 })}
            aria-pressed={index === number}
            onClick={() => setIndex(number)}
          >
            <img src={`./${image}`} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
};

export const ProductDetailsPage = () => {
  const {
    products,
    phones,
    tablets,
    accessories,
    cart,
    favorites,
    toggleCart,
    toggleFavorite,
    isLoading,
  } = useContext(ProductsContext);
  const { category, productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const related = useMemo(
    () => products.filter(item => item.itemId !== productId),
    [products, productId],
  );
  const categoryProducts =
    category === 'phones'
      ? phones
      : category === 'tablets'
        ? tablets
        : category === 'accessories'
          ? accessories
          : [];
  const product = categoryProducts.find(item => item.id === productId);

  if (isLoading) {
    return (
      <div className={styles.layout} role="status">
        <p className={styles.loading}>{t('header.loading')}</p>
        <div className={styles.overview} aria-hidden="true">
          <div className={styles.gallery}>
            <div className={`${styles.preview} ${styles['loading-panel']}`} />
            <div className={styles.thumbnails}>
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className={styles['loading-thumb']} />
              ))}
            </div>
          </div>
          <div className={styles.panel}>
            <div className={styles['loading-line']} />
            <div className={styles['loading-line']} />
            <div className={styles['loading-action']} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <NotProduct />;
  }

  const categoryPath = `/${product.category}`;
  const variants = categoryProducts.filter(
    item => item.namespaceId === product.namespaceId,
  );
  const catalogItem = products.find(item => item.itemId === product.id);
  const isFavorite = favorites.some(item => item.id === product.id);
  const isInCart = cart.some(item => item.id === product.id);
  const discount =
    product.priceRegular > 0
      ? (product.priceRegular - product.priceDiscount) / product.priceRegular
      : 0;
  const formatDiscount = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: discount < 0.01 ? 2 : 0,
  });

  const renderSpecs = (keys: readonly (typeof specKeys)[number][]) =>
    keys.map(key => {
      const value = product[key];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return null;
      }

      return (
        <div key={key}>
          <dt>{t(key)}</dt>
          <dd>{Array.isArray(value) ? value.join(', ') : value}</dd>
        </div>
      );
    });

  return (
    <>
      <article className={styles.layout}>
        <nav
          className={styles.breadcrumbs}
          aria-label={t('productDetails.breadcrumbs')}
        >
          <Link to="/home" aria-label={t('home')}>
            <House size={14} />
          </Link>
          <ChevronRight size={13} aria-hidden="true" />
          <Link to={categoryPath}>{t(categoryLabels[product.category])}</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span aria-current="page">{product.name}</span>
        </nav>
        <button
          type="button"
          className={styles.back}
          onClick={() => {
            if (location.key === 'default') {
              navigate(categoryPath);
            } else {
              navigate(-1);
            }
          }}
        >
          <ChevronLeft size={15} aria-hidden="true" /> {t('back')}
        </button>
        <h1 className={styles.title}>{product.name}</h1>

        <div className={styles.overview}>
          <Gallery key={product.id} product={product} />

          <div className={styles.panel}>
            <div className={styles['panel-heading']}>
              <span id="product-colors">{t('color')}</span>
              {catalogItem && (
                <span className={styles.id}>ID: {catalogItem.id}</span>
              )}
            </div>
            <div
              className={styles.swatches}
              role="group"
              aria-labelledby="product-colors"
            >
              {product.colorsAvailable.map(color => {
                const variant = variants.find(
                  item =>
                    item.capacity === product.capacity &&
                    colorKey(item.color) === colorKey(color),
                );
                const dot = (
                  <span style={{ backgroundColor: colors[colorKey(color)] }} />
                );
                return variant ? (
                  <NavLink
                    key={color}
                    to={`${categoryPath}/${variant.id}`}
                    className={styles.swatch}
                    aria-label={color}
                    title={color}
                  >
                    {dot}
                  </NavLink>
                ) : (
                  <span
                    key={color}
                    className={styles.swatch}
                    aria-disabled="true"
                    aria-label={color}
                    title={color}
                  >
                    {dot}
                  </span>
                );
              })}
            </div>
            <div className={styles['panel-section']}>
              <p id="product-capacities">
                {t(
                  product.category === 'accessories'
                    ? 'productDetails.size'
                    : 'capacitys',
                )}
              </p>
              <div
                className={styles.options}
                role="group"
                aria-labelledby="product-capacities"
              >
                {product.capacityAvailable.map(capacity => {
                  const variant = variants.find(
                    item =>
                      item.capacity === capacity &&
                      colorKey(item.color) === colorKey(product.color),
                  );
                  return variant ? (
                    <NavLink
                      key={capacity}
                      to={`${categoryPath}/${variant.id}`}
                      className={styles.option}
                    >
                      {capacity}
                    </NavLink>
                  ) : (
                    <span
                      key={capacity}
                      className={styles.option}
                      aria-disabled="true"
                    >
                      {capacity}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className={styles['panel-section']}>
              <div className={styles.prices}>
                <strong>{currency.format(product.priceDiscount)}</strong>
                {discount > 0 && (
                  <>
                    <s>{currency.format(product.priceRegular)}</s>
                    <span className={styles.discount}>
                      {formatDiscount.format(-discount)}
                    </span>
                  </>
                )}
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.buy}
                  aria-pressed={isInCart}
                  onClick={() => toggleCart(product.id)}
                >
                  {isInCart && <Check size={16} aria-hidden="true" />}
                  {t(isInCart ? 'buttonadd' : 'button')}
                </button>
                <button
                  type="button"
                  className={styles.favorite}
                  aria-pressed={isFavorite}
                  aria-label={t('newModels.favorite', {
                    product: product.name,
                  })}
                  onClick={() => toggleFavorite(product.id, false)}
                >
                  <Heart
                    size={19}
                    fill={isFavorite ? 'currentColor' : 'none'}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
            <dl className={`${styles['panel-section']} ${styles.specs}`}>
              {renderSpecs(summaryKeys)}
            </dl>
          </div>
        </div>

        <div className={styles.description}>
          <section>
            <h2>{t('about')}</h2>
            {product.description.map(({ title, text }) => (
              <div className={styles.paragraph} key={title}>
                <h3>{title}</h3>
                {text.map(line => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ))}
          </section>
          <section>
            <h2>{t('tech')}</h2>
            <dl className={`${styles.specs} ${styles['full-specs']}`}>
              {renderSpecs(specKeys)}
            </dl>
          </section>
        </div>
      </article>
      <CardCarousel
        products={related}
        title={t('titlelike')}
        fullPrice
        compactCards
      />
    </>
  );
};
