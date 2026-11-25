import { ChevronUp, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';

const repository = 'https://github.com/DebHtm/online-market';
const links = [
  { label: 'git', href: repository },
  { label: 'contact', href: 'https://github.com/DebHtm' },
  { label: 'right', href: repository + '/blob/main/LICENSE' },
];

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link to="/home" className={styles.brand}>
          <span className={styles.mark}>
            <Zap size={16} aria-hidden="true" />
          </span>
          Nice Gadgets
        </Link>
        <nav className={styles.nav} aria-label={t('footerNav')}>
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t(label)}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className={styles.top}
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                .matches
                ? 'instant'
                : 'smooth',
            })
          }
        >
          {t('toup')}
          <span className={styles.chevron}>
            <ChevronUp size={18} aria-hidden="true" />
          </span>
        </button>
      </div>
    </footer>
  );
};
