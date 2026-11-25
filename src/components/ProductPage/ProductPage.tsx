import {
  ArrowDownUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  House,
} from 'lucide-react';
import { useRef, useState } from 'react';
import styles from './ProductPage.module.scss';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { NotFound } from '../NotFound';
import { ProductCard } from '../ProductCard';
import { Category } from '../../types';
import { useProducts } from '../../hooks/useProducts';
import { useTranslation } from 'react-i18next';

type SortOrder = 'newest' | 'alphabetically' | 'cheapest';
type PageSize = 'all' | '4' | '8' | '16';

const VISIBLE_PAGE_COUNT = 4;
const categories = {
  phones: { title: 'mobile', breadcrumb: 'mobileMenu.phones' },
  tablets: { title: 'tablets', breadcrumb: 'tablets' },
  accessories: { title: 'accessories', breadcrumb: 'accessories' },
};
const sortOptions = [
  { value: 'newest', label: 'selectone' },
  { value: 'alphabetically', label: 'selecttwo' },
  { value: 'cheapest', label: 'selectthre' },
] as const;

const isCategory = (value: string | undefined): value is Category =>
  value === 'phones' || value === 'tablets' || value === 'accessories';

const parseSort = (value: string | null): SortOrder => {
  return value === 'alphabetically' || value === 'cheapest' ? value : 'newest';
};

const parsePageSize = (value: string | null): PageSize => {
  return value === '4' || value === '8' || value === '16' ? value : 'all';
};

export const ProductPage = () => {
  const { products, isLoading } = useProducts();
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const [openFilter, setOpenFilter] = useState<'sort' | 'size' | null>(null);
  const sortTrigger = useRef<HTMLButtonElement>(null);
  const sizeTrigger = useRef<HTMLButtonElement>(null);
  const closeFilter = () => {
    (openFilter === 'sort' ? sortTrigger : sizeTrigger).current?.focus();
    setOpenFilter(null);
  };

  const sort = parseSort(searchParams.get('sort'));
  const requestedPage = Number(searchParams.get('page'));
  const perPage = parsePageSize(searchParams.get('perPage'));

  if (!isCategory(category)) {
    return <NotFound />;
  }

  const sortedProducts = products.filter(p => p.category === category);
  const labels = categories[category];

  switch (sort) {
    case 'alphabetically':
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;

    case 'cheapest':
      sortedProducts.sort((a, b) => a.price - b.price);
      break;

    case 'newest':
    default:
      sortedProducts.sort((a, b) => b.year - a.year);
  }

  const perPageNumber =
    perPage === 'all' ? Math.max(sortedProducts.length, 1) : Number(perPage);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedProducts.length / perPageNumber),
  );
  const page =
    perPage !== 'all' &&
    Number.isSafeInteger(requestedPage) &&
    requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1;

  const start = (page - 1) * perPageNumber;
  const end = start + perPageNumber;

  const visibleProducts = sortedProducts.slice(start, end);

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    const nextSort = parseSort(value);

    if (nextSort === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', nextSort);
    }

    params.delete('page');

    setSearchParams(params);
  };

  const handlePerPageChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    const nextPageSize = parsePageSize(value);

    if (nextPageSize === 'all') {
      params.delete('perPage');
    } else {
      params.set('perPage', nextPageSize);
    }

    params.delete('page');

    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    if (!Number.isSafeInteger(newPage) || newPage < 1 || newPage > totalPages) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', String(newPage));
    }

    setSearchParams(params);
  };

  const shouldShowPagination =
    !isLoading && perPage !== 'all' && totalPages > 1;

  const startPage =
    Math.floor((page - 1) / VISIBLE_PAGE_COUNT) * VISIBLE_PAGE_COUNT + 1;

  const endPage = Math.min(startPage + VISIBLE_PAGE_COUNT - 1, totalPages);

  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );

  const selectedSort =
    sortOptions.find(option => option.value === sort) ?? sortOptions[0];
  const selectedSize = perPage === 'all' ? t('all') : perPage;
  const filterOptions =
    openFilter === 'sort'
      ? sortOptions.map(option => ({
          value: option.value,
          label: t(option.label),
        }))
      : (['all', '4', '8', '16'] as const).map(value => ({
          value,
          label: value === 'all' ? t('all') : value,
        }));

  return (
    <section className={styles.content} aria-labelledby="catalog-title">
      <nav
        className={styles.breadcrumbs}
        aria-label={t('productDetails.breadcrumbs')}
      >
        <Link to="/home" aria-label={t('home')}>
          <House size={15} aria-hidden="true" />
        </Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{t(labels.breadcrumb)}</span>
      </nav>

      <div className={styles.heading}>
        <div className={styles.intro}>
          <h1 id="catalog-title">{t(labels.title)}</h1>
          {!isLoading && (
            <p className={styles.count}>
              <span className={styles['full-count']}>
                {t('shopCategories.models', { count: sortedProducts.length })}
              </span>
              <span className={styles['short-count']} aria-hidden="true">
                {sortedProducts.length}
              </span>
            </p>
          )}
        </div>
        <div
          className={styles.filters}
          onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setOpenFilter(null);
          }}
          onKeyDown={event => {
            if (event.key === 'Escape' && openFilter) {
              event.stopPropagation();
              closeFilter();
            }
          }}
        >
          <div className={styles.toolbar}>
            <button
              ref={sortTrigger}
              type="button"
              className={styles.sort}
              aria-expanded={openFilter === 'sort'}
              aria-controls={
                openFilter === 'sort' ? 'catalog-options' : undefined
              }
              onClick={() =>
                setOpenFilter(openFilter === 'sort' ? null : 'sort')
              }
            >
              <ArrowDownUp
                className={styles['sort-icon']}
                size={17}
                aria-hidden="true"
              />
              <span>{t(selectedSort.label)}</span>
              <ChevronDown size={15} aria-hidden="true" />
            </button>
            <button
              ref={sizeTrigger}
              type="button"
              className={styles.size}
              aria-expanded={openFilter === 'size'}
              aria-controls={
                openFilter === 'size' ? 'catalog-options' : undefined
              }
              onClick={() =>
                setOpenFilter(openFilter === 'size' ? null : 'size')
              }
            >
              <span className={styles['size-label']}>
                {t('catalogPage.show')}
              </span>
              <span>{selectedSize}</span>
              <ChevronDown size={15} aria-hidden="true" />
            </button>
          </div>
          {openFilter && (
            <div
              id="catalog-options"
              className={
                openFilter === 'sort'
                  ? `${styles.options} ${styles['sort-options']}`
                  : styles.options
              }
              role="group"
              aria-label={t(openFilter === 'sort' ? 'sort' : 'item')}
            >
              {filterOptions.map(({ value, label }) => {
                const selected =
                  value === (openFilter === 'sort' ? sort : perPage);
                return (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={selected}
                    onClick={() => {
                      if (openFilter === 'sort') {
                        handleSortChange(value);
                      } else {
                        handlePerPageChange(value);
                      }
                      closeFilter();
                    }}
                  >
                    {label}
                    {selected && <Check size={16} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {!isLoading && sortedProducts.length === 0 && (
        <p className={styles.message} role="status">
          {t('emptyCategory')}
        </p>
      )}
      {isLoading && (
        <p className={styles.message} role="status">
          {t('header.loading')}
        </p>
      )}
      <ul className={styles.grid} aria-busy={isLoading}>
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => (
              <li key={index} className={styles.skeleton} aria-hidden="true">
                <div />
              </li>
            ))
          : visibleProducts.map(product => (
              <li key={product.itemId}>
                <ProductCard
                  product={product}
                  turnon={product.fullPrice > product.price}
                  compact
                />
              </li>
            ))}
      </ul>

      {shouldShowPagination && (
        <nav
          className={styles.pagination}
          aria-label={t('catalogPage.pagination')}
        >
          <button
            type="button"
            disabled={page === 1}
            aria-label={t('previousPage')}
            onClick={() => handlePageChange(page - 1)}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          {startPage > 1 && (
            <button
              type="button"
              aria-label={t('catalogPage.page', { number: 1 })}
              onClick={() => handlePageChange(1)}
            >
              1
            </button>
          )}
          {visiblePages.map(pageNumber => (
            <button
              type="button"
              key={pageNumber}
              aria-current={page === pageNumber ? 'page' : undefined}
              aria-label={t('catalogPage.page', { number: pageNumber })}
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            disabled={page === totalPages}
            aria-label={t('nextPage')}
            onClick={() => handlePageChange(page + 1)}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </nav>
      )}
    </section>
  );
};
