import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  House,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  X,
} from 'lucide-react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ProductsContext } from '../../context/ProductsContext';
import styles from './Cart.module.scss';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

export const Cart = () => {
  const {
    cart,
    products,
    isLoading,
    counts,
    total,
    totalItems,
    increase,
    decrease,
    deletCard,
  } = useContext(ProductsContext);
  const { t } = useTranslation();

  const productsMap = new Map(
    products.map(product => [product.itemId, product]),
  );
  const items = cart.flatMap(({ id }) => {
    const product = productsMap.get(id);

    return product ? [{ product, quantity: counts[id] || 1 }] : [];
  });

  return (
    <section className={styles.cart} aria-labelledby="cart-heading">
      <nav
        className={styles.breadcrumbs}
        aria-label={t('productDetails.breadcrumbs')}
      >
        <Link to="/home" aria-label={t('home')}>
          <House size={15} aria-hidden="true" />
        </Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{t('cart')}</span>
      </nav>

      <div className={styles.heading}>
        <h1 id="cart-heading">{t('cart')}</h1>
        {items.length > 0 && (
          <Link to="/phones" className={styles.continue}>
            <ArrowLeft size={16} aria-hidden="true" />
            {t('cartPage.continue')}
          </Link>
        )}
      </div>

      {isLoading && cart.length > 0 && items.length === 0 ? (
        <p className={styles.empty} role="status">
          {t('header.loading')}
        </p>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <ShoppingBag size={32} aria-hidden="true" />
          <p>{t('cartPage.empty')}</p>
          <Link to="/phones" className={styles.continue}>
            {t('cartPage.continue')}
          </Link>
        </div>
      ) : (
        <div className={styles.content}>
          <ul className={styles.items}>
            {items.map(({ product, quantity }) => {
              const id = product.itemId;
              const path = `/${product.category}/${id}`;
              const type = t(
                product.category === 'accessories' &&
                  /watch/i.test(product.name)
                  ? 'cartPage.watch'
                  : `cartPage.${product.category}`,
              );

              return (
                <li key={id} className={styles.item}>
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label={t('cartPage.remove', { product: product.name })}
                    onClick={() => deletCard(id)}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                  <Link
                    className={styles.image}
                    to={path}
                    aria-label={product.name}
                  >
                    <img src={`./${product.image}`} alt="" loading="lazy" />
                  </Link>
                  <div className={styles.product}>
                    <Link to={path}>{product.name}</Link>
                    <p>
                      <span className={styles.type}>{type} · </span>
                      {product.capacity} · {t('cartPage.inStock')}
                    </p>
                  </div>
                  <div
                    className={styles.quantity}
                    role="group"
                    aria-label={t('cartPage.quantity', {
                      product: product.name,
                    })}
                  >
                    <button
                      type="button"
                      aria-label={t('cartPage.decrease')}
                      disabled={quantity <= 1}
                      onClick={() => decrease(id)}
                    >
                      <Minus size={15} aria-hidden="true" />
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      aria-label={t('cartPage.increase')}
                      onClick={() => increase(id)}
                    >
                      <Plus size={15} aria-hidden="true" />
                    </button>
                  </div>
                  <strong className={styles.price}>
                    {currency.format(product.fullPrice * quantity)}
                  </strong>
                </li>
              );
            })}
          </ul>

          <aside className={styles.summary} aria-labelledby="cart-total">
            <p className={styles['item-count']}>
              {t('cartPage.itemCount', { count: totalItems })}
            </p>
            <h2 className={styles.total} id="cart-total">
              <span>{t('total')}</span>
              <strong>{currency.format(total)}</strong>
            </h2>
            <dl className={styles.services}>
              <div className={styles.shipping}>
                <dt>{t('cartPage.shipping')}</dt>
                <dd className={styles.free}>
                  <span className={styles['full-label']}>
                    {t('cartPage.free')}
                  </span>
                  <span className={styles['short-label']}>
                    {t('cartPage.freeShipping')}
                  </span>
                </dd>
              </div>
              <div className={styles.warranty}>
                <dt>{t('cartPage.warranty')}</dt>
                <dd>{t('cartPage.warrantyTerm')}</dd>
              </div>
            </dl>
            <button
              type="button"
              className={styles.checkout}
              onClick={() => {
                if (window.confirm(t('check'))) {
                  cart.forEach(item => deletCard(item.id));
                }
              }}
            >
              {t('checkout')}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <p className={styles.payment}>
              <ShieldCheck size={16} aria-hidden="true" />
              {t('cartPage.payment')}
            </p>
          </aside>
        </div>
      )}
    </section>
  );
};
