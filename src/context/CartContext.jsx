import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

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
      sessionStorage.setItem('pending_cart_item', JSON.stringify(product));
      sessionStorage.setItem('redirect_after_auth', '/checkout');
      window.location.href = '/cadastro'; 
      return;
    }

    const productId = product.id || product._id;
    const maxEstoque = product.estoque !== undefined && product.estoque !== null ? Number(product.estoque) : Infinity;

    // Se o produto não tiver estoque disponível de início
    if (maxEstoque <= 0) {
      toast.error('ops! este item está esgotado no momento.', { id: 'aviso-estoque-limite' });
      return;
    }

    let estoqueExcedido = false;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => (item.id || item._id) === productId);

      if (existing) {
        const itemEstoque = existing.estoque !== undefined && existing.estoque !== null ? Number(existing.estoque) : maxEstoque;
        
        // Trava de limite no estoque
        if (existing.quantity + 1 > itemEstoque) {
          estoqueExcedido = true;
          return prevCart;
        }

        return prevCart.map((item) =>
          (item.id || item._id) === productId 
            ? { ...item, quantity: item.quantity + 1, estoque: itemEstoque } 
            : item
        );
      }

      return [...prevCart, { ...product, id: productId, quantity: 1, estoque: maxEstoque }];
    });

    if (estoqueExcedido) {
      toast.error(`ops! temos apenas ${maxEstoque} unidades deste item disponíveis em estoque.`, { id: 'aviso-estoque-limite' });
    } else {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          const itemId = item.id || item._id;
          if (itemId === productId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const updateQuantity = (id, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removeFromCart(id);
      return;
    }

    let estoqueExcedido = false;
    let limiteDisponivel = 0;

    setCart((prevCart) =>
      prevCart.map((item) => {
        const itemId = item.id || item._id;
        if (itemId === id) {
          const maxEstoque = item.estoque !== undefined && item.estoque !== null ? Number(item.estoque) : Infinity;

          // Trava para não aceitar valores maiores que o estoque
          if (novaQuantidade > maxEstoque) {
            estoqueExcedido = true;
            limiteDisponivel = maxEstoque;
            return item;
          }

          return { ...item, quantity: novaQuantidade };
        }
        return item;
      })
    );

    if (estoqueExcedido) {
      toast.error(`quantidade máxima atingida! restam apenas ${limiteDisponivel} unidades.`, { id: 'aviso-estoque-limite' });
    }
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