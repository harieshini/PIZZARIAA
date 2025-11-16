import React, { useState, useEffect } from 'react';
import api from '../api';
import './OrderPizza.css';

function OrderPizza({ updateCartCount }) {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPizzas();
  }, []);

  const fetchPizzas = async () => {
    try {
      const res = await api.get('/pizzas');
      setPizzas(res.data);
    } catch (err) {
      console.error('Error fetching pizzas:', err);
      setMessage('Error loading pizzas. Make sure backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (pizza) => {
    
    const cartItem = {
      itemType: 'pizza',
      itemId: pizza.id || pizza._id || '',
      name: pizza.name,
      price: pizza.price,
      quantity: 1,
      image: pizza.image || '',
      basePizza: null,
      customIngredients: []
    };

    try {
      await api.post('/cart', cartItem);
      setMessage(`${pizza.name} added to cart!`);
      updateCartCount?.();
      console.log('Added to cart:', cartItem);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error adding to cart:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Error adding to cart!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading pizzas...</div>;
  }

  return (
    <div className="order-pizza-container">
      <h1 className="page-title">Order Pizza</h1>

      {message && <div className={message.includes('Error') ? 'error-message' : 'success-message'}>{message}</div>}

      <div className="pizzas-grid">
        {pizzas.map(pizza => (
          <div key={pizza.id || pizza._id} className="pizza-card">
            <div className="pizza-image-container">
              <img src={pizza.image} alt={pizza.name} className="pizza-image" />
              <div className={`category-badge ${pizza.type}`}>
                {pizza.type === 'veg' ? '🟢' : '🔴'}
              </div>
            </div>

            <div className="pizza-details">
              <h3 className="pizza-name">{pizza.name}</h3>
              <p className="pizza-description">{pizza.description}</p>

              <div className="pizza-info">
                <p className="info-label">Ingredients:</p>
                <p className="info-text">{Array.isArray(pizza.ingredients) ? pizza.ingredients.join(', ') : pizza.ingredients}</p>
              </div>

              <div className="pizza-info">
                <p className="info-label">Toppings:</p>
                <p className="info-text">{Array.isArray(pizza.topping) ? pizza.topping.join(', ') : pizza.topping}</p>
              </div>

              <div className="pizza-footer">
                <p className="pizza-price">₹{pizza.price}.00</p>
                <button
                  className="add-to-cart-btn"
                  onClick={() => addToCart(pizza)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderPizza;
