import './App.scss';
import { CatalogAssistant } from './components/CatalogAssistant';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import './styles/_colors.scss';
import { NotFound } from './components/NotFound';
import { Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { useEffect, useState } from 'react';
import { Product, Products } from './types/Product';
import { ProductPage } from './components/ProductPage';
import { ProductsContext } from './context/ProductsContext';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { Favourites } from './components/Favourites';
import { Cart } from './components/Cart';
import './i18n';
type Favorite = {
  id: string;
  active: boolean;
};

export const App = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [phones, setPhones] = useState<Products[]>([]);
  const [tablets, setTablets] = useState<Products[]>([]);
  const [accessories, setAccessories] = useState<Products[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [cart, setCart] = useState<{ id: string }[]>(() => {
    try {
      const savedCart = localStorage.getItem('cart');

      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    try {
      const savedfavorites = localStorage.getItem('favorites');

      return savedfavorites ? JSON.parse(savedfavorites) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleCart = (id: string) => {
    setCart(prev =>
      prev.some(item => item.id === id)
        ? prev.filter(item => item.id !== id)
        : [...prev, { id }],
    );
  };

  const toggleFavorite = (id: string, active: boolean) => {
    setFavorites(prev =>
      prev.some(item => item.id === id)
        ? prev.filter(item => item.id !== id)
        : [...prev, { id, active }],
    );
  };

  const deletCard = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const load = async <T,>(file: string, setData: (data: T[]) => void) => {
      const response = await fetch(`./api/${file}.json`, { signal });
      if (!response.ok) {
        throw new Error(`Failed to load ${file}`);
      }

      const data: T[] = await response.json();
      if (!signal.aborted) {
        setData(data);
      }
    };

    void Promise.allSettled([
      load('products', setProducts),
      load('phones', setPhones),
      load('tablets', setTablets),
      load('accessories', setAccessories),
    ]).then(() => {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    });

    return () => controller.abort();
  }, []);

  const [counts, setCounts] = useState<Record<string, number>>(() => {
    try {
      const savedCounts = localStorage.getItem('counts');

      return savedCounts ? JSON.parse(savedCounts) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('counts', JSON.stringify(counts));
  }, [counts]);

  const increase = (id: string) => {
    setCounts(prev => ({
      ...prev,
      [id]: (prev[id] || 1) + 1,
    }));
  };

  const decrease = (id: string) => {
    setCounts(prev => ({
      ...prev,
      [id]: Math.max((prev[id] || 1) - 1, 1),
    }));
  };

  const totalItems = cart.reduce((sum, item) => {
    return sum + (counts[item.id] || 1);
  }, 0);

  const productsMap = Object.fromEntries(
    products.map(product => [product.itemId, product]),
  );

  const total = cart.reduce((sum, item) => {
    const product = productsMap[item.id];
    const count = counts[item.id] || 1;

    return product ? sum + product.fullPrice * count : sum;
  }, 0);

  return (
    <div className="App">
      <ProductsContext.Provider
        value={{
          products,
          phones,
          tablets,
          accessories,
          isLoading,
          cart,
          favorites,
          toggleCart,
          toggleFavorite,
          deletCard,
          counts,
          totalItems,
          total,
          increase,
          decrease,

          // toggleCart,
          // toggleFavorite,
          // deletCard,
        }}
      >
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/favorites" element={<Favourites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/:category" element={<ProductPage />} />
            <Route
              path="/:category/:productId"
              element={<ProductDetailsPage />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <CatalogAssistant />
      </ProductsContext.Provider>
      <Footer />
    </div>
  );
};
