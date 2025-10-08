import React, { useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "../styles/MediaCoverage.css";

export default function MediaCoverage() {
  const [coverage, setCoverage] = useState([
    {
      id: 1,
      title: "7 E-Commerce Tips That Will Increase Sales",
      link: "https://www.youtube.com/watch?v=6_t_qjHBJtk",
      date: "2023-01-01",
    },
    {
      id: 2,
      title: "How to Start an Online Store in 2024",
      link: "https://www.youtube.com/watch?v=WPtzKslNLrs",
      date: "2023-02-15",
    },
    {
      id: 3,
      title: "Top 10 Ecommerce Website Best Practices",
      link: "https://www.youtube.com/watch?v=uK9C6xiJk-I",
      date: "2023-03-10",
    },
  ]);

  // --- Admin State ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // --- State for Adding and Editing Videos ---
  const [newVideo, setNewVideo] = useState({ title: "", link: "", date: "" });
  const [editingVideo, setEditingVideo] = useState(null); // To store the video being edited

  // --- Login and Logout Handlers ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin@example.com" && password === "password123") {
      setIsAdmin(true);
      setShowLoginForm(false);
      setUsername("");
      setPassword("");
    } else {
      alert("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  // --- CRUD Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVideo({ ...newVideo, [name]: value });
  };

  const handleAddVideo = (e) => {
    e.preventDefault();
    setCoverage([...coverage, { ...newVideo, id: Date.now() }]); // Use timestamp for unique ID
    setNewVideo({ title: "", link: "", date: "" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setCoverage(coverage.filter((item) => item.id !== id));
    }
  };

  const handleEdit = (video) => {
    setEditingVideo({ ...video });
  };
  
  const handleUpdate = (e) => {
    e.preventDefault();
    setCoverage(
      coverage.map((item) => (item.id === editingVideo.id ? editingVideo : item))
    );
    setEditingVideo(null); // Exit editing mode
  };
  
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingVideo({ ...editingVideo, [name]: value });
  };

  return (
    <>
      <Navbar />
      <div className="media-coverage-container">
        <h1>Media Coverage</h1>
        <p className="coverage-description">
          See what the media is saying about us! Check out our latest features and interviews.
        </p>

        {/* --- Video List --- */}
        <ul className="coverage-list">
          {coverage.map((item) => (
            <li key={item.id} className="coverage-item">
              {editingVideo && editingVideo.id === item.id ? (
                // --- EDITING VIEW ---
                <form onSubmit={handleUpdate} className="edit-form">
                  <input
                    type="text"
                    name="title"
                    value={editingVideo.title}
                    onChange={handleEditInputChange}
                  />
                  <input
                    type="url"
                    name="link"
                    value={editingVideo.link}
                    onChange={handleEditInputChange}
                  />
                  <input
                    type="date"
                    name="date"
                    value={editingVideo.date}
                    onChange={handleEditInputChange}
                  />
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditingVideo(null)}>Cancel</button>
                </form>
              ) : (
                // --- DEFAULT VIEW ---
                <>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title} - {new Date(item.date).toLocaleDateString()}
                  </a>
                  {isAdmin && (
                    <div className="admin-actions">
                      <button onClick={() => handleEdit(item)} className="edit-btn">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="delete-btn">Delete</button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>

        {/* --- Admin Section --- */}
        <div className="admin-section">
          {isAdmin ? (
            // --- Logged-in View: Add Video Form and Logout Button ---
            <>
              <form onSubmit={handleAddVideo} className="add-video-form">
                <h2>Add New Video</h2>
                <input
                  type="text" name="title" placeholder="Title" value={newVideo.title}
                  onChange={handleInputChange} required
                />
                <input
                  type="url" name="link" placeholder="YouTube URL" value={newVideo.link}
                  onChange={handleInputChange} required
                />
                <input
                  type="date" name="date" value={newVideo.date}
                  onChange={handleInputChange} required
                />
                <button type="submit">Add Video</button>
              </form>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            // --- Logged-out View: Login Button and Form ---
            <>
              {!showLoginForm ? (
                <button onClick={() => setShowLoginForm(true)}>Admin Login</button>
              ) : (
                <form onSubmit={handleLogin} className="login-form">
                  <h2>Admin Login</h2>
                  <input
                    type="text" placeholder="Username" value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <input
                    type="password" placeholder="Password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="submit">Login</button>
                  <button type="button" onClick={() => setShowLoginForm(false)}>Cancel</button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}