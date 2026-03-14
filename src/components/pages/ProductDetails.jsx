import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import { useCart } from "../context/CartContext";
import "../styles/ProductDetails.css";
import Footer from "../Footer";

const API_URL = "http://localhost:5001";

/* ================= Wishlist Helpers ================= */

const getWishlist = () =>
  JSON.parse(localStorage.getItem("wishlist")) || [];

const isInWishlist = (productId) =>
  getWishlist().some((item) => item.productId === productId);

/* =================================================== */

export default function ProductDetails() {
  const { id } = useParams(); // URL param
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [productId, setProductId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await axios.get(
          `${API_URL}/api/products/${id}`
        );

        const prod = res.data.product || res.data;

        if (!prod) {
          setError("Product not found");
          return;
        }

        const pid = prod.id || prod._id;

        setProduct({ ...prod, productId: pid });
        setProductId(pid);
        setWishlisted(isInWishlist(pid));
      } catch (err) {
        console.error("❌ Fetch Error:", err);
        setError("Unable to load product details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  /* ================= CART ================= */

  const handleAddToCart = (item, qty) => {
    addToCart({
      ...item,
      productId,
      quantity: qty,
    });
  };

  /* ================= WISHLIST ================= */

  const toggleWishlist = () => {
    const wishlist = getWishlist();

    if (wishlisted) {
      const updated = wishlist.filter(
        (item) => item.productId !== productId
      );
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setWishlisted(false);
    } else {
      wishlist.push({
        productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl || product.img,
      });
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setWishlisted(true);
    }
  };

  /* ================= LOADING ================= */

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading product details...</p>
        </div>
      </>
    );
  }

  /* ================= ERROR ================= */

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="product-not-found">
          <h2>{error || "Product not found ❌"}</h2>
          <button onClick={() => navigate("/shop")} className="back-btn">
            Back to Shop
          </button>
        </div>
      </>
    );
  }

  /* ================= UI ================= */

  return (
    <>
      <Navbar />

      <div className="product-details-container">
        {/* IMAGE */}
        <div className="product-main">
          <img
            src={product.imageUrl || product.img}
            alt={product.name}
            className="main-image"
          />
        </div>

        {/* INFO */}
        <div className="product-info">
          <p className="breadcrumb">
            Products / {product.category || "General"}
          </p>

          <div className="product-title-row">
            <h1>{product.name}</h1>
            <span
              className={`wishlist-heart ${wishlisted ? "active" : ""}`}
              onClick={toggleWishlist}
            >
              {wishlisted ? "❤️" : "🤍"}
            </span>
          </div>

          <p className="price">
            ${Number(product.price).toFixed(2)}
          </p>

          <p className="description">
            {product.description || "No description available"}
          </p>

          {/* QUANTITY */}
          <div className="quantity-selector">
            <label>Quantity</label>
            <div className="quantity-controls">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="action-buttons">
            <button
              className="add-to-cart"
              onClick={() => handleAddToCart(product, quantity)}
            >
              Add to Cart
            </button>

            <button
              className="buy-now"
              onClick={() => {
                handleAddToCart(product, quantity);
                navigate("/cart");
              }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}
