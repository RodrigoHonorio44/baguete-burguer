import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Tenta descobrir o utilizador logado no localStorage (ajuste a chave conforme o seu app, ex: 'user', 'usuario', etc.)
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
    if (currentUser && currentUser.id) {
      const saved = localStorage.getItem(`baguete_burguer_cart_${currentUser.id}`);
      return saved ? JSON.parse(saved) : [];
    }
    return []; // Se não houver utilizador logado, começa vazio para não misturar!
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sempre que o carrinho muda e há um utilizador, guarda no localStorage específico dele e envia para o servidor
  useEffect(() => {
    const currentUser = getStoredUser();
    if (currentUser && currentUser.id) {
      localStorage.setItem(`baguete_burguer_cart_${currentUser.id}`, JSON.stringify(cart));
      
      // Sincroniza com o backend
      fetch(`https://bagueteburguer.rodhonsystem.com.br/api/carrinho`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, itens: cart })
      }).catch(err => console.error('Erro ao sincronizar carrinho:', err));
    }
  }, [cart]);

  // Opcional: Se quiser carregar do servidor quando a página abre
  useEffect(() => {
    const currentUser = getStoredUser();
    if (currentUser && currentUser.id) {
      fetch(`https://bagueteburguer.rodhonsystem.com.br/api/carrinho/${currentUser.id}`)
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
    setCart();
    const currentUser = getStoredUser();
    if (currentUser && currentUser.id) {
      localStorage.removeItem(`baguete_burguer_cart_${currentUser.id}`);
      // Limpa também no servidor
      fetch(`https://bagueteburguer.rodhonsystem.com.br/api/carrinho`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, itens: [] })
      }).catch(err => console.error('Erro ao limpar carrinho:', err));
    }
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
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