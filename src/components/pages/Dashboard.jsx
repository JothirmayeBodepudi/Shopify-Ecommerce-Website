// src/components/pages/Dashboard.jsx
import React from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../Navbar"; 
import Footer from "../Footer";  // ✅ Import Footer
import "../styles/DashBoard.css";


export default function Dashboard() {
  const auth = useAuth();
  const { addToCart } = useCart();

  // ✅ Custom logout (if you want to trigger auth removal from Dashboard)
  const handleLogout = () => {
    auth.removeUser();
    localStorage.removeItem("userToken");
  };

  // ✅ Sample featured products
  const featuredProducts = [
    {
      id: 1,
      name: "Sneakers",
      price: 89.99,
      quantity: 1,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6D6Zy2rPILUgGRxUEdXKkh0nuwChUktF61Q&s",
    },
    {
      id: 2,
      name: "Smartphone",
      price: 699.99,
      quantity: 1,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbuWbcxIctKqHkwAsnkBY7qp1pe-iPGnEsJA&s",
    },
    {
      id: 3,
      name: "Watch",
      price: 199.99,
      quantity: 1,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpW6O9SL3F_R1bBTKi_ophVU0rhogKRrerZQ&s",
    },
    {
      id: 4,
      name: "Headphones",
      price: 129.99,
      quantity: 1,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTukdpli8OYpbqKW4EpCvpA413y_TrPbsHnbw&s",
    },
  ];

  return (
    <div>
      {/* ✅ Navbar handles cart + logout */}
      <Navbar />

      {/* ✅ Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Discover the Latest Trends</h1>
          <p>Shop the best deals on clothing, electronics, and more.</p>
          <Link to="/shop" className="hero-btn">
            Shop Now
          </Link>
        </div>
      </section>

      {/* ✅ Featured Products */}
      <section className="featured-products">
        <h2>Featured Products</h2>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-img-wrapper">
                <img src={product.image} alt={product.name} />
              </div>
              <h3>{product.name}</h3>
              <p>${product.price.toFixed(2)}</p>
              <button onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ Footer at the bottom */}
      <Footer />
    </div>
  );
}
