import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    // ✅ Load cart from localStorage (or empty array)
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // ✅ Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ➕ UPDATED: Add product to cart with Vendor Tracking
  const addToCart = (product) => {
    setCart((prevCart) => {
      // Check if product already exists in cart
      const existing = prevCart.find((item) => item.id === product.id);
      
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // ✅ CRITICAL FIX: Explicitly ensure dealerId is included in the cart item
        // This ensures the backend knows which seller owns which product during checkout
        return [
          ...prevCart, 
          { 
            ...product, 
            dealerId: product.dealerId || null, // Preserve dealerId or set to null for Admin products
            quantity: 1 
          }
        ];
      }
    });
  };

  // ❌ Remove product
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // 🔄 Update product quantity
  const updateQuantity = (id, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  // ➖ Decrease quantity by 1 (helper)
  const decrementQuantity = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0) // remove if quantity goes 0
    );
  };

  // 🧹 Clear cart
  const clearCart = () => setCart([]);

  // 🛒 Derived values (cart count & total price)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        decrementQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ✅ Custom hook
export function useCart() {
  return useContext(CartContext);
}