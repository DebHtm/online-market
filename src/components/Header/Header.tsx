import { Heart, Menu, Moon, Search, ShoppingBag, Sun, Zap } from 'lucide-react';
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ProductsContext } from '../../context/ProductsContext';
import { MobileMenu } from '../MobileMenu';
import styles from './Header.module.scss';

const categories = [
  { path: '/home', label: 'home' },
  { path: '/phones', label: 'phone' },
  { path: '/tablets', label: 'tablet' },
  { path: '/accessories', label: 'accesuar' },
];

const languages = ['uk', 'en', 'de'] as const;

export const Header = () => {
  const { favorites, totalItems, products, isLoading } =
    useContext(ProductsContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dark, setDark] = useState(
    () => localStorage.getItem('catalog-theme') === 'dark',
  );
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) {
      return;
    }

    const updateIndicator = () => {
      const activeLink = nav.querySelector<HTMLElement>(
        '[aria-current="page"]',
      );
      if (activeLink) {
        nav.style.setProperty('--indicator-x', `${activeLink.offsetLeft}px`);
        nav.style.setProperty(
          '--indicator-width',
          `${activeLink.offsetWidth}px`,
        );
      }

      nav.style.setProperty('--indicator-opacity', activeLink ? '1' : '0');
    };

    updateIndicator();
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(nav);
    nav.querySelectorAll('a').forEach(link => observer.observe(link));

    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('catalog-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setQuery('');
  }, [location]);

  const searchTerm = query.trim().toLowerCase();
  const matches = searchTerm
    ? products
        .filter(product => product.name.toLowerCase().includes(searchTerm))
        .slice(0, 6)
    : [];

  const renderSettings = (mobile: boolean) => (
    <div className={mobile ? styles['mobile-settings'] : styles.settings}>
      <div>
        {mobile && <p>{t('mobileMenu.theme')}</p>}
        <div
          className={styles.segment}
          role="group"
          aria-label={t('header.theme')}
        >
          <button
            type="button"
            aria-label={t('header.light')}
            aria-pressed={!dark}
            onClick={() => setDark(false)}
          >
            <Sun size={18} aria-hidden="true" />
            {mobile && t('mobileMenu.light')}
          </button>
          <button
            type="button"
            aria-label={t('header.dark')}
            aria-pressed={dark}
            onClick={() => setDark(true)}
          >
            <Moon size={17} aria-hidden="true" />
            {mobile && t('mobileMenu.dark')}
          </button>
        </div>
      </div>
      <div>
        {mobile && <p>{t('mobileMenu.language')}</p>}
        <div
          className={styles.segment}
          role="group"
          aria-label={t('header.language')}
        >
          {languages.map(language => (
            <button
              key={language}
              type="button"
              lang={language}
              aria-pressed={i18n.resolvedLanguage === language}
              onClick={() => void i18n.changeLanguage(language)}
            >
              {language === 'uk' ? 'UA' : language.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header
        className={styles.header}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            setIsMenuOpen(false);
            setIsSearchOpen(false);
          }
        }}
      >
        <div className={styles.inner}>
          <button
            type="button"
            className={`${styles['icon-button']} ${styles['menu-button']}`}
            aria-label={t('header.menu')}
            aria-expanded={isMenuOpen}
            aria-haspopup="dialog"
            aria-controls={isMenuOpen ? 'mobile-menu' : undefined}
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              setIsSearchOpen(false);
            }}
          >
            <Menu size={21} aria-hidden="true" />
          </button>
          <Link to="/home" className={styles.brand}>
            <span className={styles['brand-icon']}>
              <Zap size={19} />
            </span>
            <span>Nice Gadgets</span>
          </Link>
          <nav
            ref={navRef}
            className={styles.nav}
            aria-label={t('header.categories')}
          >
            {categories.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                end
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                <span
                  className={
                    path === '/home' ? styles['home-label'] : undefined
                  }
                >
                  {t(label)}
                </span>
                {path === '/home' && (
                  <span className={styles['all-label']}>{t('header.all')}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <div
            id="header-search-panel"
            className={`${styles.search} ${isSearchOpen ? styles['search-open'] : ''}`}
            onBlur={event => {
              if (
                !event.currentTarget.contains(event.relatedTarget) &&
                event.relatedTarget?.getAttribute('aria-controls') !==
                  'header-search-panel'
              ) {
                setIsSearchOpen(false);
              }
            }}
          >
            <form
              className={styles['search-field']}
              role="search"
              onSubmit={event => {
                event.preventDefault();
                const firstMatch = matches[0];
                if (firstMatch) {
                  navigate(`/${firstMatch.category}/${firstMatch.itemId}`);
                }
              }}
            >
              <input
                id="header-search"
                type="search"
                aria-label={t('header.search')}
                placeholder={t('header.placeholder')}
                value={query}
                onFocus={() => setIsSearchOpen(true)}
                onChange={event => {
                  setQuery(event.target.value);
                  setIsSearchOpen(true);
                }}
              />
              <Search size={19} aria-hidden="true" />
            </form>
            {isSearchOpen && searchTerm && (
              <div className={styles.results}>
                {matches.length ? (
                  matches.map(product => (
                    <Link
                      key={product.itemId}
                      to={`/${product.category}/${product.itemId}`}
                    >
                      {product.name}
                    </Link>
                  ))
                ) : (
                  <p role="status">
                    {t(isLoading ? 'header.loading' : 'header.empty')}
                  </p>
                )}
              </div>
            )}
          </div>
          {renderSettings(false)}
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles['icon-button']} ${styles['search-button']}`}
              aria-label={t('header.search')}
              aria-expanded={isSearchOpen}
              aria-controls="header-search-panel"
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setIsMenuOpen(false);
                if (!isSearchOpen) {
                  requestAnimationFrame(() =>
                    document.getElementById('header-search')?.focus(),
                  );
                }
              }}
            >
              <Search size={20} />
            </button>
            <NavLink
              to="/favorites"
              className={`${styles['icon-button']} ${styles['favorites-button']}`}
              aria-label={t('header.favorites', { count: favorites.length })}
            >
              <Heart
                size={21}
                fill={
                  location.pathname === '/favorites' ? 'currentColor' : 'none'
                }
              />
              {favorites.length > 0 && (
                <span className={styles.badge}>{favorites.length}</span>
              )}
            </NavLink>
            <NavLink
              to="/cart"
              className={styles['icon-button']}
              aria-label={t('header.cart', { count: totalItems })}
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className={`${styles.badge} ${styles['cart-badge']}`}>
                  {totalItems}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </header>
      {isMenuOpen && (
        <MobileMenu onClose={closeMenu}>{renderSettings(true)}</MobileMenu>
      )}
    </>
  );
};
