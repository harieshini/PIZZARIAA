import React, { useState, useEffect } from 'react';
import api from '../api';
import './MyOrders.css';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="my-orders-container">
      <h1 className="page-title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Start ordering delicious pizzas!</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.substring(order._id.length - 8)}</h3>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <div className="order-status">
                  <span className={`status-badge ${order.status}`}>
                    {order.status === 'confirmed' ? '✓ Confirmed' : order.status}
                  </span>
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img src={item.image} alt={item.name} />
                    <div className="order-item-details">
                      <h4>{item.name}</h4>
                      {item.basePizza && <p className="base-pizza">Base: {item.basePizza}</p>}
                      {item.customIngredients && item.customIngredients.length > 0 && (
                        <p className="ingredients-list">{item.customIngredients.join(', ')}</p>
                      )}
                      <p className="item-qty">Quantity: {item.quantity}</p>
                    </div>
                    <div className="order-item-price">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <span className="order-total">Total: ₹{order.totalAmount}.00</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
