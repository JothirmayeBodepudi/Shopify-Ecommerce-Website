import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./context/CartContext";
import { useAuth } from "react-oidc-context";
import { 
  Search, ShoppingBag, User, ChevronDown, 
  LogOut, Heart, Package, ShieldCheck, X, Mic, Loader2,
  MessageSquareText 
} from "lucide-react";
import Chatbot from "./pages/Chatbot"; 
import "./styles/Navbar.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001";

export default function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); 
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const { cart } = useCart();
  const auth = useAuth();
  const navigate = useNavigate();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- 🚪 FIXED LOGOUT LOGIC ---
  const handleLogout = async () => {
    setShowProfileMenu(false);
    
    try {
      // 1. Clear local storage first to ensure immediate UI feedback
      localStorage.removeItem("userId"); 
      localStorage.removeItem("dealerId");

      // 2. Attempt a clean OIDC signout
      if (auth.isAuthenticated) {
        await auth.signoutRedirect();
      }
    } catch (err) {
      console.error("Cognito signout error, forcing local logout:", err);
    } finally {
      // 3. FAIL-SAFE: Manually remove the user from state if redirect fails
      auth.removeUser();
      // Use window.location to ensure a hard refresh of the auth state
      window.location.href = "/home";
    }
  };

  // --- 🎙️ VOICE SEARCH LOGIC ---
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript); 
    };

    recognition.start();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        searchRef.current && !searchRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE}/api/search?q=${query}`);
        const data = await response.json(); 
        setSuggestions(data);
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <>
      <nav className="navbar-modern">
        <div className="navbar-container">
          
          <div className="nav-left">
            <Link to="/home" className="logo">
              Shop<span>Ease</span>
            </Link>
            <div className="nav-links">
              <Link to="/home">Home</Link>
              <Link to="/shop">Shop</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          <div className="nav-right">
            
            <div className="search-container" ref={searchRef}>
              <div className={`search-input-wrapper ${isListening ? "listening-glow" : ""}`}>
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder={isListening ? "Listening..." : "Search products..."}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                      if(e.key === 'Enter' && query) navigate(`/search?q=${query}`);
                  }}
                />
                
                <div className="search-actions">
                  {query && (
                    <button className="clear-search" onClick={() => setQuery("")}>
                      <X size={16} />
                    </button>
                  )}
                  <button 
                    className={`mic-btn ${isListening ? "active" : ""}`} 
                    onClick={handleVoiceSearch}
                  >
                    {isListening ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
                  </button>
                </div>
              </div>

              {suggestions.length > 0 && (
                <div className="search-dropdown-modern">
                  <div className="dropdown-header">Products</div>
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      className="search-item-modern"
                      onClick={() => {
                        setQuery("");
                        setSuggestions([]);
                        navigate(`/product/${item.id}`);
                      }}
                    >
                      <img src={item.img} alt={item.name} />
                      <div className="item-info">
                        <p className="item-name">{item.name}</p>
                        <p className="item-price">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              className={`nav-icon-btn chat-nav-btn ${isChatOpen ? "active" : ""}`}
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <MessageSquareText size={22} />
              <span className="dot-indicator"></span>
            </button>

            <Link to="/cart" className="nav-icon-btn cart-btn">
              <ShoppingBag size={22} />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>

            {auth.isAuthenticated ? (
              <div className="profile-dropdown-container" ref={dropdownRef}>
                <button onClick={() => setShowProfileMenu((prev) => !prev)} className="profile-trigger">
                  <div className="avatar">
                    {auth.user?.profile.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="profile-name">
                    {auth.user?.profile.name?.split(" ")[0] || "Profile"}
                  </span>
                  <ChevronDown size={16} className={`chevron ${showProfileMenu ? "rotate" : ""}`} />
                </button>

                {showProfileMenu && (
                  <div className="profile-dropdown-menu">
                    <div className="menu-welcome">
                      <p>Welcome back,</p>
                      <h4>{auth.user?.profile.name || "User"}</h4>
                    </div>
                    <div className="menu-divider"></div>
                    <Link to="/profile/view" className="menu-item" onClick={() => setShowProfileMenu(false)}><User size={16} /> My Account</Link>
                    <Link to="/profile/orders" className="menu-item" onClick={() => setShowProfileMenu(false)}><Package size={16} /> My Orders</Link>
                    <Link to="/profile/wishlist" className="menu-item" onClick={() => setShowProfileMenu(false)}><Heart size={16} /> Wishlist</Link>
                    <Link to="/admin/login" className="menu-item" onClick={() => setShowProfileMenu(false)}><ShieldCheck size={16} /> Admin Portal</Link>
                    <div className="menu-divider"></div>
                    <button onClick={handleLogout} className="menu-item logout-btn"><LogOut size={16} /> Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <button className="nav-login-btn" onClick={() => auth.signinRedirect()}>Log In</button>
            )}
          </div>
        </div>
      </nav>

      <Chatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </>
  );
}