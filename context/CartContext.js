'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('hill-cart') : null;
    if (stored) setCart(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('hill-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const itemId = product.id || product._id;
    setCart((prev) => {
      const exists = prev.find((item) => item.id === itemId);
      if (exists) return prev.map((item) => item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, id: itemId, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, qty) => {
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, quantity: Math.max(1, qty) } : item));
  };

  const clearCart = () => setCart([]);

  return <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
