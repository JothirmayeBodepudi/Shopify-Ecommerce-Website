import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import "../styles/OrdersPage.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId") || "PAYPAL_USER";

  const statusColors = {
  Processing: "badge-blue",
  Shipped: "badge-orange",
  "Out for Delivery": "badge-purple",
  Delivered: "badge-green"
};


  /* ================= FETCH ORDERS ================= */

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/orders?userId=${userId}`
      );

      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("❌ Orders fetch error:", err);
      setError("Unable to load orders");
    } finally {
      setLoading(false);
    }
  };

  fetchOrders(); // initial load

  const interval = setInterval(fetchOrders, 10000); // 🔄 refresh every 10s

  return () => clearInterval(interval); // cleanup
}, [userId]);


  /* ================= STATES ================= */

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20 text-lg">
          Loading orders...
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20 text-red-600">
          {error}
        </div>
      </>
    );
  }

  /* ================= UI ================= */

  return (
    <>
      <Navbar />

      <div className="orders-wrapper">
        <div className="orders-container">
          <h2 className="text-3xl font-bold mb-8 text-slate-800">
            My Orders
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-10 glassy">
              <p className="text-gray-600">
                You haven’t placed any orders yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="order-card"
                >
                  {/* -------- ORDER HEADER -------- */}
                  <div className="order-header">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Order ID
                      </p>
                      <p className="font-mono text-sm font-semibold text-gray-700">
                        {order.orderId}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Placed on:{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`status-badge ${statusColors[order.status]}`}>
                          {order.status}
                      </span>

                      <p className="text-xl font-black mt-1 text-slate-900">
                        ${Number(order.totalAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* -------- ORDER ITEMS -------- */}
                  <div className="order-items-list">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        {/* PRODUCT IMAGE (DISPLAY ONLY) */}
                        <img
                          src={
                            item.imageUrl ||
                            item.img ||
                            "https://via.placeholder.com/80"
                          }
                          alt={item.name}
                          className="product-img"
                        />

                        {/* PRODUCT INFO */}
                        <div className="product-info">
                          <h4>{item.name}</h4>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        {/* PRICE */}
                        <div className="product-price">
                          $
                          {(
                            Number(item.price) *
                            Number(item.quantity)
                          ).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrdersPage;
