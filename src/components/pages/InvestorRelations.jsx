import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "../styles/InvestorRelations.css";

export default function InvestorRelations() {
  const [news, setNews] = useState([]);
  const [financialData, setFinancialData] = useState({
    revenue: "100M",
    netIncome: "20M",
    year: "2023",
  });

  useEffect(() => {
    // Mock dynamic news
    setNews([
      { id: 1, title: "Q4 Earnings Report", date: "2023-12-01", summary: "MyShop reports record profits." },
      { id: 2, title: "New Partnership Announced", date: "2023-11-15", summary: "Collaboration with major retailer." },
    ]);
  }, []);

  return (
    <>
      <Navbar />
      <div className="investor-container">
        <h1>Investor Relations</h1>
        <p>Stay updated with MyShop's financial performance and news.</p>

        <section className="financial-highlight">
          <h2>Financial Highlights</h2>
          <p>
            <b>Revenue ({financialData.year}):</b> ${financialData.revenue}
          </p>
          <p>
            <b>Net Income ({financialData.year}):</b> ${financialData.netIncome}
          </p>
        </section>

        <section className="news-list">
          <h2>Latest News</h2>
          {news.map(item => (
            <div key={item.id} className="news-card">
              <h3>{item.title}</h3>
              <p className="news-date">{item.date}</p>
              <p className="news-summary">{item.summary}</p>
            </div>
          ))}
        </section>
      </div>
      <Footer />
    </>
  );
}
