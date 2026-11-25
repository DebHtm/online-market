import { ArrowUp, ChevronDown, MessageCircle, X } from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ProductsContext } from '../../context/ProductsContext';
import {
  AssistantMessage,
  AssistantReply,
  requestCatalogReply,
} from './assistant';
import styles from './CatalogAssistant.module.scss';

type Message = AssistantMessage & { productIds?: AssistantReply['productIds'] };

const prompts = ['iphone', 'ipad', 'watch'] as const;
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

export const CatalogAssistant = () => {
  const { products, cart, toggleCart, isLoading } = useContext(ProductsContext);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const collapse = useRef<HTMLButtonElement>(null);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && log.current) {
      log.current.scrollTop = log.current.scrollHeight;
    }
  }, [open, messages, pending]);

  const close = () => {
    setOpen(false);
    launcher.current?.focus();
  };

  const send = async (question: string) => {
    const text = question.trim();
    if (!text || isLoading || pending) {
      return;
    }

    const conversation: Message[] = [...messages, { role: 'user', text }];
    setMessages(conversation);
    setDraft('');
    setPending(true);

    try {
      const reply = await requestCatalogReply(conversation, products, {
        matches: t('assistant.matches'),
        noMatches: t('assistant.noMatches'),
        unsupported: t('assistant.unsupported'),
      });
      setMessages([...conversation, { role: 'assistant', ...reply }]);
    } catch {
      setMessages([
        ...conversation,
        { role: 'assistant', text: t('assistant.error') },
      ]);
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      className={styles.widget}
      onKeyDown={event => {
        if (open && event.key === 'Escape') {
          event.stopPropagation();
          close();
        }
      }}
    >
      {open && (
        <section
          className={styles.panel}
          id="catalog-assistant"
          aria-labelledby="assistant-title"
        >
          <header className={styles.header}>
            <span className={styles.orb} aria-hidden="true" />
            <div>
              <h2 id="assistant-title">
                Nice AI <span>{t('assistant.preview')}</span>
              </h2>
              <p>{t('assistant.subtitle')}</p>
            </div>
            <button
              type="button"
              ref={collapse}
              className={styles.collapse}
              aria-label={t('assistant.close')}
              onClick={close}
            >
              <ChevronDown size={18} aria-hidden="true" />
            </button>
          </header>
          <div
            className={styles.log}
            ref={log}
            role="log"
            aria-label={t('assistant.history')}
            tabIndex={0}
          >
            <div className={styles.reply}>
              <span className={styles.orb} aria-hidden="true" />
              <p className={styles.bubble}>{t('assistant.greeting')}</p>
            </div>
            {messages.map((message, index) =>
              message.role === 'user' ? (
                <p key={index} className={styles.question}>
                  {message.text}
                </p>
              ) : (
                <div key={index} className={styles.reply}>
                  <span className={styles.orb} aria-hidden="true" />
                  <div className={styles.answer}>
                    <p className={styles.bubble}>{message.text}</p>
                    {message.productIds?.map(id => {
                      const product = products.find(item => item.itemId === id);
                      if (!product) {
                        return null;
                      }

                      const added = cart.some(item => item.id === id);

                      return (
                        <div key={id} className={styles.product}>
                          <Link
                            className={styles.item}
                            to={`/${product.category}/${id}`}
                            onClick={close}
                          >
                            <span className={styles.image}>
                              <img
                                src={`./${product.image}`}
                                alt=""
                                loading="lazy"
                              />
                            </span>
                            <span>
                              <strong>{product.name}</strong>
                              <span className={styles.price}>
                                {currency.format(product.price)}
                                {product.fullPrice > product.price && (
                                  <s>{currency.format(product.fullPrice)}</s>
                                )}
                              </span>
                            </span>
                          </Link>
                          <button
                            type="button"
                            className={styles.buy}
                            disabled={added}
                            aria-label={
                              t(added ? 'buttonadd' : 'button') +
                              ': ' +
                              product.name
                            }
                            onClick={() => toggleCart(id)}
                          >
                            {t(added ? 'buttonadd' : 'newModels.add')}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ),
            )}
            {pending && (
              <p className={styles.bubble} role="status">
                {t('assistant.pending')}
              </p>
            )}
          </div>
          <div
            className={styles.suggestions}
            role="group"
            aria-label={t('assistant.suggestions')}
          >
            {prompts.map(prompt => (
              <button
                key={prompt}
                type="button"
                disabled={isLoading || pending}
                onClick={() => void send(t(`assistant.prompts.${prompt}`))}
              >
                {t(`assistant.prompts.${prompt}`)}
              </button>
            ))}
          </div>
          <form
            className={styles.composer}
            onSubmit={event => {
              event.preventDefault();
              void send(draft);
            }}
          >
            <input
              ref={input}
              type="text"
              maxLength={400}
              value={draft}
              onChange={event => setDraft(event.target.value)}
              aria-label={t('assistant.placeholder')}
              placeholder={t('assistant.placeholder')}
            />
            <button
              type="submit"
              aria-label={t('assistant.send')}
              disabled={!draft.trim() || isLoading || pending}
            >
              <ArrowUp size={20} aria-hidden="true" />
            </button>
          </form>
        </section>
      )}
      <button
        ref={launcher}
        type="button"
        className={styles.launcher}
        aria-expanded={open}
        aria-controls={open ? 'catalog-assistant' : undefined}
        onClick={() => {
          if (open) {
            close();
          } else {
            setOpen(true);
            requestAnimationFrame(() => {
              const target = window.matchMedia('(max-width: 639px)').matches
                ? collapse
                : input;
              target.current?.focus({ preventScroll: true });
            });
          }
        }}
      >
        <span className={styles.orb} aria-hidden="true" />
        {open ? t('assistant.close') : t('assistant.open')}
        {open ? (
          <X size={16} aria-hidden="true" />
        ) : (
          <MessageCircle size={17} aria-hidden="true" />
        )}
      </button>
    </div>
  );
};
