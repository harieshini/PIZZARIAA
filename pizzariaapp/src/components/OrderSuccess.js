import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './OrderSuccess.css';

function OrderSuccess() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="order-success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Order Placed Successfully!</h1>
        <p className="success-message">
          Thank you for your order. Your delicious pizza is being prepared!
        </p>
        <div className="order-details">
          <p>🍕 Your order will be delivered in <strong>30-45 minutes</strong></p>
          <p>📧 You will receive a confirmation email shortly</p>
        </div>
        <div className="success-actions">
          <Link to="/my-orders" className="btn btn-primary">
            View My Orders
          </Link>
          <Link to="/order-pizza" className="btn btn-secondary">
            Order More Pizzas
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;