// src/components/context/ProductsContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

// Create context
const ProductsContext = createContext();

// Custom hook for easier access
export const useProducts = () => useContext(ProductsContext);

// Provider component
export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API or local JSON
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Example: fetch from local JSON
        const response = await fetch("/products.json"); // Place products.json in public folder
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, setProducts, loading }}>
      {children}
    </ProductsContext.Provider>
  );
};
