import React, { useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "../styles/MediaQueries.css";

export default function MediaQueries() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [submittedQueries, setSubmittedQueries] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/media-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, query }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmittedQueries([...submittedQueries, query]);
        setName("");
        setEmail("");
        setQuery("");
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("❌ Error submitting query:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="media-queries-container">
        <h1>Media Queries</h1>
        <p>Submit your media-related questions or requests.</p>

        <form onSubmit={handleSubmit} className="query-form">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <textarea
            placeholder="Your query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <button type="submit">Submit</button>
        </form>

        <section className="submitted-queries">
          <h2>Submitted Queries</h2>
          {submittedQueries.length === 0 ? (
            <p>No queries submitted yet.</p>
          ) : (
            <ul>
              {submittedQueries.map((q, index) => (
                <li key={index}>{q}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
}
