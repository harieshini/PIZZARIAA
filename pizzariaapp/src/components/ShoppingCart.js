import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './ShoppingCart.css';

function ShoppingCart({ updateCartCount }) {
  const [cartItems, setCartItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
    fetchRecommendations();
  }, []);

  const fetchCartItems = async () => {
    try {
      const res = await api.get('/cart');
      setCartItems(res.data || []);
      updateCartCount?.();
    } catch (err) {
      console.error('Error fetching cart:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setMessage('Please login to view your cart.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/recommendations');
      setRecommendations(res.data || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err.response?.data || err.message);
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`/cart/${id}`, { quantity: newQuantity });
      await fetchCartItems();
    } catch (err) {
      console.error('Error updating quantity:', err.response?.data || err.message);
    }
  };

  const removeItem = async (id, itemName) => {
    if (!window.confirm(`Remove ${itemName} from cart?`)) return;
    try {
      await api.delete(`/cart/${id}`);
      setMessage(`${itemName} removed from cart`);
      await fetchCartItems();
      updateCartCount?.();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting item:', err.response?.data || err.message);
      setMessage('Unable to remove item');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
  };

  const proceedToCheckout = async () => {
    if (cartItems.length === 0) {
      setMessage('Your cart is empty.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await api.post('/orders');
      setCartItems([]);
      updateCartCount?.();
      navigate('/order-success');
    } catch (err) {
      console.error('Error placing order:', err.response?.data || err.message);
      setMessage('Error placing order!');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const addRecommendationToCart = async (pizza) => {
    const payload = {
      itemType: 'pizza',
      itemId: pizza.id || pizza._id || '',
      name: pizza.name,
      price: pizza.price,
      quantity: 1,
      image: pizza.image,
      basePizza: null,
      customIngredients: []
    };

    try {
      await api.post('/cart', payload);
      setMessage(`${pizza.name} added to cart!`);
      await fetchCartItems();
      updateCartCount?.();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error adding to cart:', err.response?.data || err.message);
      setMessage('Error adding to cart');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <div className="loading">Loading cart...</div>;

  return (
    <div className="cart-wrapper">

      <h1 className="cart-title">Shopping Cart</h1>

      {message && (
        <div className={`alert-box ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="cart-layout">

        
        <div className="cart-left">
          {cartItems.length === 0 ? (
            <div className="empty-layout">
              <div className="empty-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Add some delicious pizzas to get started!</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div className="item-card" key={item._id}>
                <img src={item.image} className="item-img" alt={item.name} />

                <div className="item-info">
                  <h3>{item.name}</h3>

                  {item.basePizza && <p className="small-tag">Base: {item.basePizza}</p>}

                  {item.customIngredients?.length > 0 && (
                    <p className="small-tag">
                      <strong>Ingredients:</strong> {item.customIngredients.join(', ')}
                    </p>
                  )}

                  <p className="price-tag">₹{item.price}.00 each</p>

                  <div className="qty-box">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                  </div>

                  <p className="item-total">
                    ₹{item.price * item.quantity}.00
                  </p>

                  <button className="remove-item" onClick={() => removeItem(item._id, item.name)}>
                    Remove
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        
        <div className="cart-right">
          <div className="summary-box">
            <h3>Order Summary</h3>

            <p className="summary-row">
              <span>Items ({cartItems.length})</span>
              <strong>₹{calculateTotal()}.00</strong>
            </p>

            <p className="summary-row">
              <span>Delivery</span>
              <strong className="green">FREE</strong>
            </p>

            <p className="summary-total">
              <span>Total</span>
              <span>₹{calculateTotal()}.00</span>
            </p>

            <button
              className="checkout-btn"
              disabled={checkoutLoading}
              onClick={proceedToCheckout}
            >
              {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>

      
      {recommendations.length > 0 && (
        <div className="rec-section">
          <h2>You Might Also Like</h2>

          <div className="rec-grid">
            {recommendations.map(p => (
              <div className="rec-card" key={p._id}>
                <img src={p.image} alt={p.name} />
                <h3>{p.name}</h3>
                <p className="rec-price">₹{p.price}</p>

                <button onClick={() => addRecommendationToCart(p)}>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default ShoppingCart;
