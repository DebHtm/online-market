import { Product } from '../../types/Product';

export type AssistantMessage = {
  role: 'user' | 'assistant';
  text: string;
};

export type AssistantReply = {
  text: string;
  productIds: string[];
};

type ReplyCopy = {
  matches: string;
  noMatches: string;
  unsupported: string;
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

export const requestCatalogReply = async (
  messages: readonly AssistantMessage[],
  products: readonly Product[],
  copy: ReplyCopy,
): Promise<AssistantReply> => {
  const question = messages[messages.length - 1]?.text ?? '';
  const query = normalize(question);
  const phone = query.match(
    /\biphone(?:\s+(\d+)(?:\s+(pro max|pro|plus|mini))?)?/,
  );
  const ipad = /\bipad\b/.test(query);
  const watch = /\bwatch\b/.test(query);
  const capacity = query.match(/\b(\d+)\s*(gb|tb)\b/);
  const budget =
    question.match(/\$\s*(\d[\d,]*)/) ??
    question.match(/\b(\d+)\s*(?:usd|\$)/i);

  if (!phone && !ipad && !watch) {
    return { text: copy.unsupported, productIds: [] };
  }

  const limit = budget ? Number(budget[1].replace(/,/g, '')) : Infinity;
  const matches = products.filter(product => {
    const name = normalize(product.name);
    const typeMatches = phone
      ? name.includes(phone[0]) &&
        (!phone[1] || name.split(' ')[2] === phone[1])
      : name.includes(ipad ? 'ipad' : 'watch');
    const capacityMatches =
      !capacity ||
      normalize(product.capacity).replace(/ /g, '') ===
        capacity[1] + capacity[2];

    return typeMatches && capacityMatches && product.price <= limit;
  });

  const selected =
    phone?.[2] === 'pro'
      ? matches.filter(product => !normalize(product.name).includes('pro max'))
      : matches;
  const seen = new Set<string>();
  const productIds = selected
    .filter(product => {
      const key = `${product.image}:${product.capacity}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);

      return true;
    })
    .slice(0, 3)
    .map(product => product.itemId);

  return {
    text: productIds.length ? copy.matches : copy.noMatches,
    productIds,
  };
};
