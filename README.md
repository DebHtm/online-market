# Nice Gadgets

Nice Gadgets is a responsive online electronics store built with React, TypeScript and Vite. Browse devices, compare available variants, save favorites and manage your cart across desktop and mobile.

[**Open the live demo →**](https://debhtm.github.io/online-market/)

## What you can do

- Browse product categories, sort results, choose a page size and share the resulting catalog URL.
- Explore product photos, colors, storage options, specifications and discounts.
- Save favorites and manage your cart. Selections are stored locally in the browser.
- Switch between light and dark themes and Ukrainian, English and German.
- Use **Nice AI Preview** to search the local catalog by model, storage or budget and add matching products to the cart.

The storefront uses static catalog data. Checkout is a demo flow.

## Run locally

Use Node.js 20 and npm.

```bash
git clone https://github.com/DebHtm/online-market.git
cd online-market
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000/).

## Build and publish

| Command           | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run build`   | Build the production site in `dist/`.                |
| `npm run preview` | Preview the production build locally after building. |
| `npm run deploy`  | Build and publish the demo to the `gh-pages` branch. |

The demo uses GitHub Pages with **Deploy from a branch → `gh-pages` → `/(root)`** as its publishing source.

## Nice AI roadmap

Nice AI currently runs in the browser and returns matches from the local product data. The chat UI and its reply service are already in place in [CatalogAssistant](src/components/CatalogAssistant). The service accepts the conversation and returns reply text with product IDs, which the UI renders as links and shoppable cards.

The next step is to connect a **retrieval-augmented generation (RAG)** backend. The planned backend will retrieve relevant catalog and store information, then answer questions about products, comparisons, and store policies using that information.

## Tech stack

React · TypeScript · Vite · React Router · SCSS Modules · i18next · Lucide

## License

[GNU GPL v3.0](LICENSE)
