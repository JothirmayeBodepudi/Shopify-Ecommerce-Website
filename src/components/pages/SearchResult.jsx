import React, { useEffect, useState } from "react";

export default function SearchResults() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const storedResults = sessionStorage.getItem("searchResults");
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
  }, []);

  if (!results.length) return <h2>No products found</h2>;

  return (
    <div>
      <h2>Search Results</h2>
      <div className="product-list">
        {results.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
