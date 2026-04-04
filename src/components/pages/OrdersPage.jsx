import React, { useEffect, useState, useMemo } from "react";
import { Package, Clock, CheckCircle, Truck, ShoppingBag, Filter as FilterIcon } from "lucide-react";
import Navbar from "../Navbar";
import "../styles/OrdersPage.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all");

  const userId = localStorage.getItem("userId") || "PAYPAL_USER";

  // Map status to icons and colors
  const statusConfig = {
    Processing: { icon: <Clock size={14} />, class: "status-processing" },
    Shipped: { icon: <Package size={14} />, class: "status-shipped" },
    "Out for Delivery": { icon: <Truck size={14} />, class: "status-delivery" },
    Delivered: { icon: <CheckCircle size={14} />, class: "status-delivered" }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/orders?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      } catch (err) {
        setError("Unable to load your order history.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); 
    return () => clearInterval(interval); 
  }, [userId]);

  const filteredOrders = useMemo(() => {
    if (timeFilter === "all") return orders;
    const now = new Date();
    return orders.filter((order) => {
      const diffDays = Math.ceil(Math.abs(now - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));
      return diffDays <= parseInt(timeFilter);
    });
  }, [orders, timeFilter]);

  if (loading) return (
    <div className="orders-loading">
      <Navbar />
      <div className="spinner-container">
        <div className="pro-spinner"></div>
        <p>Retrieving your orders...</p>
      </div>
    </div>
  );

  return (
    <div className="orders-page-wrapper">
      <Navbar />
      
      <main className="orders-main container">
        <header className="orders-header">
          <div className="header-text">
            <h1>Order History</h1>
            <p>Track, manage, and view your previous purchases.</p>
          </div>

          <div className="filter-wrapper">
            <FilterIcon size={16} className="filter-icon" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="pro-select"
            >
              <option value="all">All Orders</option>
              <option value="30">Last 30 Days</option>
              <option value="180">Last 6 Months</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </header>

        {filteredOrders.length === 0 ? (
          <div className="empty-orders-card">
            <ShoppingBag size={48} />
            <h3>No orders found</h3>
            <p>It looks like you haven't placed any orders in this period.</p>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.orderId} className="pro-order-card">
                {/* CARD HEADER */}
                <div className="card-top">
                  <div className="order-meta">
                    <div className="meta-box">
                      <span className="label">Order Placed</span>
                      <span className="value">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="meta-box">
                      <span className="label">Total Amount</span>
                      <span className="value price">${Number(order.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="meta-box">
                      <span className="label">Ship To</span>
                      <span className="value">{order.shipping?.fullName || "Customer"}</span>
                    </div>
                  </div>
                  
                  <div className="order-id-box">
                    <span className="label text-right">Order #</span>
                    <span className="order-id-code">{order.orderId.slice(-8).toUpperCase()}</span>
                  </div>
                </div>

                {/* STATUS BAR */}
                <div className="card-status-bar">
                  <div className={`pro-status-badge ${statusConfig[order.status]?.class || "status-processing"}`}>
                    {statusConfig[order.status]?.icon}
                    {order.status}
                  </div>
                </div>

                {/* ITEMS LIST */}
                <div className="card-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="pro-item-row">
                      <img
                        src={item.imageUrl || item.img || "https://via.placeholder.com/80"}
                        alt={item.name}
                        className="pro-item-thumb"
                      />
                      <div className="pro-item-details">
                        <h4>{item.name}</h4>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                      <div className="pro-item-price">
                        ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* CARD FOOTER ACTIONS */}
                <div className="card-footer">
                  <button className="btn-secondary-sm" onClick={() => window.print()}>Invoice</button>
                  <button className="btn-primary-sm">View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;