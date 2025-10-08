import React, { useState } from 'react'; // Import useState
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Your existing page components
import MainApp from './components/MainApp';
import Dashboard from './components/pages/Dashboard';
import Contact from './components/pages/Contact';
import Cart from './components/pages/Cart';
import ShopPage from './components/pages/ShopPage';
import ProductDetails from './components/pages/ProductDetails';
import CheckoutPage from './components/pages/CheckoutPage';
import ProfilePage from './components/pages/ProfilePage';
import DealerRegistration from "./components/pages/DealerRegistration";
import DealerDashboard from "./components/pages/DealerDashboard";
import WorkFromHomeQuiz from './components/pages/WorkFromHomeQuiz';
import Careers from './components/pages/Careers';
import InvestorRelations from './components/pages/InvestorRelations';
import BusinessOrders from './components/pages/BusinessOrders';
import MediaQueries from './components/pages/MediaQueries';
import MediaCoverage from './components/pages/MediaCoverage';
import ProductSurvey from './components/pages/ProductSurvey';
import SeasonalDeals from './components/pages/SeasonalDeals';
import FAQs from './components/pages/FAQs';
import ShippingLocation from './components/pages/ShippingLocation';
import ReturnsRefunds from './components/pages/ReturnsRefunds';
import Warranty from './components/pages/Warranty';
import TermsOfService from './components/pages/TermsOfService';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import Help from './components/pages/Help';
import CallbackPage from './components/pages/CallbackPage';


// (NEW) Import the new Admin pages
import AdminLoginPage from './components/admin/AdminLoginPage';
import AdminDashboardPage from './components/admin/AdminDashboardPage';
import DealerLoginPage from './components/pages/DealerLoginPage';
import LogoutSuccessPage from './components/pages/LogoutSuccessPage';


function App() {
  // (NEW) State for admin authentication token
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  // (NEW) Function to handle successful admin login
  const handleLogin = (newToken) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
  };

  // (NEW) Function to handle admin logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* --- Your Existing Public Routes --- */}
        <Route path="/" element={<MainApp />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/deals" element={<Cart />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/profile/view" element={<ProfilePage />} /> 
        <Route path="/dealer-registration" element={<DealerRegistration />} />
        <Route path="/dealer-dashboard" element={<DealerDashboard />} />
        <Route path="/Work-From-Home-Quiz" element={<WorkFromHomeQuiz />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/investor-relations" element={<InvestorRelations />} />
        <Route path="/business-orders" element={<BusinessOrders />} />
        <Route path="/media-queries" element={<MediaQueries />} />
        <Route path="/media-coverage" element={<MediaCoverage />} />
        <Route path="/product-survey" element={<ProductSurvey />} />
        <Route path="/seasonal-deals" element={<SeasonalDeals />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/shipping-location" element={<ShippingLocation />} />
        <Route path="/returns-refunds" element={<ReturnsRefunds />} />
        <Route path="/warranty" element={<Warranty />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/help" element={<Help />} />
        <Route path="/dealer-login" element={<DealerLoginPage />} />
        <Route path="/home" element={<CallbackPage />} />
        <Route path="/logout-success" element={<LogoutSuccessPage />} />

        {/* --- (NEW) Admin Routes --- */}
        <Route 
          path="/admin/login" 
          element={token ? <Navigate to="/admin/dashboard" /> : <AdminLoginPage onLogin={handleLogin} />} 
        />
        <Route 
          path="/admin/dashboard" 
          element={token ? <AdminDashboardPage token={token} onLogout={handleLogout} /> : <Navigate to="/admin/login" />} 
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;