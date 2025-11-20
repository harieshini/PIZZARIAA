import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import OrderPizza from './components/OrderPizza';
import BuildUrPizza from './components/BuildUrPizza';
import ShoppingCart from './components/ShoppingCart';
import OrderSuccess from './components/OrderSuccess';
import MyOrders from './components/MyOrders';
import logo from './Logo.png';

function AppContent() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);            
  const [dropdownOpen, setDropdownOpen] = useState(false);    
  const { user, logout, isAuthenticated } = useAuth();
  

  useEffect(() => {
    if (isAuthenticated) {
      updateCartCount();
    }
  }, [isAuthenticated]);

  const updateCartCount = () => {
    const token = localStorage.getItem("token");  

    if (!token) {
      setCartCount(0);
      return;
    }

    axios.get("http://localhost:5000/api/cart", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      const items = Array.isArray(res.data) ? res.data : res.data.items || [];
      setCartCount(items.length);
    })
    .catch(err => {
      console.error(err);
      setCartCount(0);
    });
  };

  return (
    <div className="App">
      <nav className="navbar">
  <div className="nav-container">

    
    <Link to="/" className="logo-container">
      <img src={logo} alt="Pizzeria Logo" className="logo" />
      <h1 className="brand-name">Pizzeria</h1>
    </Link>

    
    <button className="menu-toggle" onClick={() => setMenuOpen(prev => !prev)}>
      ☰
    </button>

    
    <div className={`nav-links ${menuOpen ? "open" : ""}`}>
      {!isAuthenticated ? (
        <>
          <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link to="/register" className="nav-link" onClick={() => setMenuOpen(false)}>Register</Link>
        </>
      ) : (
        <>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Our Story</Link>
          <Link to="/order-pizza" className="nav-link" onClick={() => setMenuOpen(false)}>Order Pizza</Link>
          <Link to="/build-ur-pizza" className="nav-link" onClick={() => setMenuOpen(false)}>Build Your Pizza</Link>
          <Link to="/my-orders" className="nav-link" onClick={() => setMenuOpen(false)}>My Orders</Link>

          <Link to="/cart" className="cart-button" onClick={() => setMenuOpen(false)}>
            🛒 Cart {cartCount > 0 && `(${cartCount})`}
          </Link>

          <div className="user-menu">
            <span className="user-name">👤 {user?.name}</span>
            <button onClick={() => { logout(); setMenuOpen(false); }} className="logout-button">Logout</button>
          </div>
        </>
      )}
    </div>
  </div>
</nav>



      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/order-pizza" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/order-pizza" />} />

        <Route path="/order-pizza" element={<ProtectedRoute><OrderPizza updateCartCount={updateCartCount} /></ProtectedRoute>} />
        <Route path="/build-ur-pizza" element={<ProtectedRoute><BuildUrPizza updateCartCount={updateCartCount} /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><ShoppingCart updateCartCount={updateCartCount} /></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
      </Routes>

      <footer className="footer">
        <p>Copyright © {new Date().getFullYear()} Pizzeria. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
