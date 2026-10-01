import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const getStoredUser = () => {
    try {
      const userStr = localStorage.getItem('user') || localStorage.getItem('usuario');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(getStoredUser());

  const [cart, setCart] = useState(() => {
    const currentUser = getStoredUser();
    if (currentUser && (currentUser.id || currentUser._id)) {
      const userId = currentUser.id || currentUser._id;
      const saved = localStorage.getItem(`baguete_burguer_cart_${userId}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sincroniza com o backend utilizando fetch para a rota específica do carrinho
  useEffect(() => {
    const currentUser = getStoredUser();
    if (currentUser && (currentUser.id || currentUser._id)) {
      const userId = currentUser.id || currentUser._id;
      localStorage.setItem(`baguete_burguer_cart_${userId}`, JSON.stringify(cart));
      
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api-hamburgueria.rodhonsystem.com.br';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl.replace(/\/$/, '')}/api`;

      fetch(`${apiUrl}/carrinho`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itens: cart })
      }).catch(err => console.error('Erro ao sincronizar carrinho:', err));
    }
  }, [cart]);

  // Carrega do servidor quando a aplicação abre
  useEffect(() => {
    const currentUser = getStoredUser();
    if (currentUser && (currentUser.id || currentUser._id)) {
      const userId = currentUser.id || currentUser._id;
      
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api-hamburgueria.rodhonsystem.com.br';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl.replace(/\/$/, '')}/api`;

      fetch(`${apiUrl}/carrinho/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setCart(data);
          }
        })
        .catch(err => console.error('Erro ao buscar carrinho do servidor:', err));
    }
  }, []);

  const addToCart = (product) => {
    const currentUser = getStoredUser();
    if (!currentUser) {
      alert('Por favor, faça login para adicionar itens ao carrinho.');
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => (item.id || item._id) === (product.id || product._id));
      if (existing) {
        return prevCart.map((item) =>
          (item.id || item._id) === (product.id || product._id) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => (item.id || item._id) !== id));
  };

  const updateQuantity = (id, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        const itemId = item.id || item._id;
        if (itemId === id) {
          return { ...item, quantity: novaQuantidade };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    const currentUser = getStoredUser();
    if (currentUser && (currentUser.id || currentUser._id)) {
      const userId = currentUser.id || currentUser._id;
      localStorage.removeItem(`baguete_burguer_cart_${userId}`);
      
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api-hamburgueria.rodhonsystem.com.br';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl.replace(/\/$/, '')}/api`;

      fetch(`${apiUrl}/carrinho`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itens: [] })
      }).catch(err => console.error('Erro ao limpar carrinho:', err));
    }
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price || item.preco || 0) * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        setIsCartOpen,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);