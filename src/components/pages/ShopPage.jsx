import React, { useState, useMemo, useEffect } from "react"; // (NEW) Import useEffect
import { useNavigate } from "react-router-dom";
import axios from "axios"; // (NEW) Import axios for API calls
import Navbar from "../Navbar";
import "../styles/ShopPage.css";
import { useCart } from "../context/CartContext";
import Footer from "../Footer";
// import { products } from "../data/products"; // (DELETED) No longer using static data

const API_URL = 'http://localhost:5001'; // Your backend URL

export default function ShopPage() {
  // --- (NEW) State for products, loading, and errors ---
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const { addToCart } = useCart();

  // --- (NEW) useEffect to fetch products from the API on component mount ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/products`);
        if (response.data.success) {
          setProducts(response.data.items);
        } else {
          setError("Failed to fetch products.");
        }
      } catch (err) {
        setError("An error occurred while fetching products.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty array ensures this runs only once on mount

  const handleCheckboxChange = (value, setter, current) => {
    setter(
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    );
    setCurrentPage(1);
  };

  // --- (NEW) Dynamically generate filter options from fetched data ---
  const allCategories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);
  const allBrands = useMemo(() => [...new Set(products.map(p => p.brand).filter(Boolean))], [products]);

  // Filtering logic remains the same, but now works on fetched data
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false;
      if (selectedPriceRanges.length > 0) {
        const inRange = selectedPriceRanges.some((range) => {
            if (range === "Under $50") return product.price < 50;
            if (range === "$50 - $200") return product.price >= 50 && product.price <= 200;
            if (range === "$200 - $500") return product.price > 200 && product.price <= 500;
            if (range === "$500 - Over") return product.price > 500;
            return false;
        });
        if (!inRange) return false;
      }
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;
      return true;
    });
  }, [products, searchTerm, selectedCategories, selectedPriceRanges, selectedBrands]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <Navbar />
      <div className="shop-container">
        <aside className="filters">
          <input
            type="text"
            placeholder="Search products..."
            className="search-filters"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="filter-group">
            <h4>Category</h4>
            {allCategories.map((cat) => (
              <label key={cat}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleCheckboxChange(cat, setSelectedCategories, selectedCategories)}
                /> {cat}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Price Range</h4>
            {["Under $50", "$50 - $200", "$200 - $500", "$500 - Over"].map((range) => (
              <label key={range}>
                <input
                  type="checkbox"
                  checked={selectedPriceRanges.includes(range)}
                  onChange={() => handleCheckboxChange(range, setSelectedPriceRanges, selectedPriceRanges)}
                /> {range}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Brand</h4>
            {allBrands.map((brand) => (
              <label key={brand}>
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleCheckboxChange(brand, setSelectedBrands, selectedBrands)}
                /> {brand}
              </label>
            ))}
          </div>
        </aside>

        <main className="products-section">
          <h2>Discover Our Products</h2>
          <div className="products-grid">
            {/* --- (NEW) Render loading and error states --- */}
            {isLoading ? (
              <p>Loading products...</p>
            ) : error ? (
              <p>{error}</p>
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <div className="product-card" key={product.id}>
                  <img
                    src={product.img} // This should match the 'imageUrl' from your S3 bucket
                    alt={product.name}
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ cursor: "pointer" }}
                  />
                  <h3>{product.name}</h3>
                  <p className="price">${product.price.toFixed(2)}</p>
                  <button onClick={() => addToCart({ ...product, quantity: 1 })}>
                    Add to Cart
                  </button>
                </div>
              ))
            ) : (
              <p>No products found matching your filters.</p>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              {/* Pagination buttons remain the same */}
            </div>
          )}
        </main>
      </div>
<Footer />
    </>
  );
}