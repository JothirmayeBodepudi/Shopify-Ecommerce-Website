import React, { useState, useEffect } from "react"; // (NEW) Import hooks
import { useParams } from "react-router-dom";
import axios from "axios"; // (NEW) Import axios
import Navbar from "../Navbar";
import { useCart } from "../context/CartContext";
import "../styles/ProductDetails.css";
// import { products } from "../data/products"; // (DELETED) No longer using static data

const API_URL = 'http://localhost:5000';

export default function ProductDetails() {
  const { id } = useParams(); // id comes from the URL
  const { addToCart } = useCart();
  
  // (NEW) State for the product, loading, and error
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // (NEW) useEffect to fetch the product data when the component loads
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        // Use the new server endpoint
        const response = await axios.get(`${API_URL}/products/${id}`);
        if (response.data.success) {
          setProduct(response.data.product);
        } else {
          setError(response.data.error);
        }
      } catch (err) {
        setError("Product not found or an error occurred.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]); // This effect re-runs if the product id in the URL changes

  const handleAddToCart = (item, qty = 1) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      img: item.img,
      quantity: qty,
    });
  };
  
  // (NEW) Render loading state
  if (isLoading) {
    return (
        <>
            <Navbar />
            <div className="product-details-container"><p>Loading...</p></div>
        </>
    );
  }

  // (NEW) Render error or product not found state
  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="product-not-found">
          <h2>{error || "Product not found ❌"}</h2>
        </div>
      </>
    );
  }

  // --- If product is found, render the details ---
  return (
    <>
      <Navbar />
      <div className="product-details-container">
        <div className="product-main">
          <img src={product.img} alt={product.name} className="main-image" />
          {/* Optional: Add thumbnail logic later if needed */}
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="price">${product.price.toFixed(2)}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Brand:</strong> {product.brand}</p>
          <p className="description">{product.description}</p>

          <div className="quantity">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)}>+</button>
          </div>

          <div className="action-buttons">
            <button
              className="add-to-cart"
              onClick={() => handleAddToCart(product, quantity)}
            >
              Add to Cart
            </button>
            <button className="buy-now">Buy Now</button>
          </div>
        </div>
      </div>
      {/* Note: Related products section was removed as it requires fetching all products */}
    </>
  );
}