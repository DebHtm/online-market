import {
  Heart,
  House,
  ShoppingBag,
  Smartphone,
  Tablet,
  Watch,
  X,
  Zap,
} from 'lucide-react';
import { type ReactNode, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import { ProductsContext } from '../../context/ProductsContext';
import styles from './MobileMenu.module.scss';

type Props = {
  onClose: () => void;
  children: ReactNode;
};

export const MobileMenu = ({ onClose, children }: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();
  const { phones, tablets, accessories, favorites, totalItems, isLoading } =
    useContext(ProductsContext);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 640px)');
    const closeOnDesktop = () => {
      if (desktop.matches) {
        onClose();
      }
    };

    desktop.addEventListener('change', closeOnDesktop);
    closeOnDesktop();

    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, [onClose]);

  const links = [
    { path: '/home', label: 'mobileMenu.home', Icon: House },
    {
      path: '/phones',
      label: 'mobileMenu.phones',
      Icon: Smartphone,
      count: phones.length,
    },
    { path: '/tablets', label: 'tablets', Icon: Tablet, count: tablets.length },
    {
      path: '/accessories',
      label: 'accessories',
      Icon: Watch,
      count: accessories.length,
    },
  ];

  const actions = [
    {
      path: '/favorites',
      label: 'favourites',
      Icon: Heart,
      count: favorites.length,
    },
    { path: '/cart', label: 'cart', Icon: ShoppingBag, count: totalItems },
  ];

  return (
    <dialog
      ref={dialogRef}
      id="mobile-menu"
      className={styles.dialog}
      aria-label={t('header.menu')}
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={styles.layout}>
        <div className={styles.top}>
          <Link to="/home" className={styles.brand} onClick={onClose}>
            <span>
              <Zap size={19} aria-hidden="true" />
            </span>
            Nice Gadgets
          </Link>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            aria-label={t('mobileMenu.close')}
            onClick={onClose}
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.content}>
          <nav
            className={styles.categories}
            aria-label={t('header.categories')}
          >
            {links.map(({ path, label, Icon, count }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/home'}
                onClick={onClose}
              >
                <Icon size={22} aria-hidden="true" />
                <span>{t(label)}</span>
                {count === undefined ? (
                  <span className={styles.dot} aria-hidden="true" />
                ) : (
                  !isLoading && <span className={styles.count}>{count}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className={styles.settings}>{children}</div>
        </div>

        <nav className={styles.actions} aria-label={t('mobileMenu.shortcuts')}>
          {actions.map(({ path, label, Icon, count }) => (
            <NavLink key={path} to={path} onClick={onClose}>
              <span className={styles.icon}>
                <Icon size={23} aria-hidden="true" />
                {count > 0 && <span className={styles.badge}>{count}</span>}
              </span>
              {t(label)}
            </NavLink>
          ))}
        </nav>
      </div>
    </dialog>
  );
};
