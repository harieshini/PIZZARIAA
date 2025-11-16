import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BuildUrPizza.css';

axios.defaults.headers.common['Authorization'] =
  `Bearer ${localStorage.getItem('token')}`;

function BuildUrPizza({ updateCartCount }) {
  const [pizzas, setPizzas] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedBasePizza, setSelectedBasePizza] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [buildMode, setBuildMode] = useState('scratch');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pizzaRes, ingredientRes] = await Promise.all([
        axios.get('http://localhost:5000/api/pizzas'),
        axios.get('http://localhost:5000/api/ingredients')
      ]);
      setPizzas(pizzaRes.data);
      setIngredients(ingredientRes.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setMessage('Error loading data!');
    }
  };

  const handleBasePizzaSelect = (pizza) => {
    setSelectedBasePizza(pizza);
    setTotalCost(pizza.price);
    setSelectedIngredients([]);
  };

  const handleIngredientToggle = (ingredient) => {
    const isSelected = selectedIngredients.find(item => item.id === ingredient.id);

    if (isSelected) {
      setSelectedIngredients(selectedIngredients.filter(item => item.id !== ingredient.id));
      setTotalCost(totalCost - ingredient.price);
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
      setTotalCost(totalCost + ingredient.price);
    }
  };

  const buildPizza = async () => {
    if (buildMode === 'scratch' && selectedIngredients.length === 0) {
      setMessage('Please select at least one ingredient!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (buildMode === 'base' && !selectedBasePizza) {
      setMessage('Please select a base pizza!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const cartItem = {
      itemType: 'custom',
      name: buildMode === 'base'
        ? `Custom ${selectedBasePizza.name}`
        : 'Custom Pizza from Scratch',
      basePizza: buildMode === 'base' ? selectedBasePizza.name : null,
      basePizzaPrice: buildMode === 'base' ? selectedBasePizza.price : 0,
      price: totalCost,
      quantity: 1,
      customIngredients: selectedIngredients.map(ing => ing.tname),
      image: buildMode === 'base'
        ? selectedBasePizza.image
        : 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
    };

    try {
      await axios.post('http://localhost:5000/api/cart', cartItem);
      setMessage('Pizza added to cart successfully!');
      updateCartCount();
      resetBuild();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error adding to cart!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const resetBuild = () => {
    setSelectedBasePizza(null);
    setSelectedIngredients([]);
    setTotalCost(0);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="pizza-page-wrapper">

      
      <div className="pizza-layout">

        
        <div className="pizza-main-column">

          <h1 className="page-title">Build Your Pizza</h1>
          <p className="subtitle">Create your perfect pizza your way!</p>

          {message && (
            <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
              {message}
            </div>
          )}

          
          <div className="build-mode-selector">
            <button
              className={`mode-btn ${buildMode === 'scratch' ? 'active' : ''}`}
              onClick={() => { setBuildMode('scratch'); resetBuild(); }}
            >
              Build from Scratch
            </button>

            <button
              className={`mode-btn ${buildMode === 'base' ? 'active' : ''}`}
              onClick={() => { setBuildMode('base'); resetBuild(); }}
            >
              Start with Base Pizza
            </button>
          </div>

          
          {buildMode === 'base' && (
            <div className="base-section-box">
              <h2>Select Your Base Pizza</h2>
              <div className="base-pizzas-grid">
                {pizzas.map(pizza => (
                  <div
                    key={pizza.id}
                    className={`base-pizza-card ${selectedBasePizza?.id === pizza.id ? 'selected' : ''}`}
                    onClick={() => handleBasePizzaSelect(pizza)}
                  >
                    <img src={pizza.image} alt={pizza.name} />
                    <h3>{pizza.name}</h3>
                    <p className="base-price">₹{pizza.price}</p>

                    {selectedBasePizza?.id === pizza.id && (
                      <div className="selected-badge">✓ Selected</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          
          <div className="section-box">
            <h2>Add Extra Ingredients</h2>
            <div className="ingredients-list">
              {ingredients.map(ing => {
                const isSelected = selectedIngredients.find(i => i.id === ing.id);
                return (
                  <div key={ing.id} className="ingredient-item">
                    <div className="ingredient-info">
                      <img src={ing.image} alt={ing.tname} className="ingredient-image" />
                      <div className="ingredient-details">
                        <h3>{ing.tname}</h3>
                        <p className="ingredient-price">+₹{ing.price}</p>
                      </div>
                    </div>

                    <div className="ingredient-action">
                      {!isSelected ? (
                        <button className="add-btn" onClick={() => handleIngredientToggle(ing)}>
                          Add
                        </button>
                      ) : (
                        <>
                          <button className="add-btn selected" disabled>✓ Added</button>
                          <button className="remove-btn" onClick={() => handleIngredientToggle(ing)}>
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        
        <div className="pizza-summary-column">

          <div className="summary-card">
            <h2 className="summary-title">Summary</h2>

            <div className="summary-details">
              {buildMode === 'base' && selectedBasePizza && (
                <p className="base-summary">
                  Base Pizza: <strong>{selectedBasePizza.name}</strong> (₹{selectedBasePizza.price})
                </p>
              )}

              <p className="ingredient-summary">
                Ingredients Selected: <strong>{selectedIngredients.length}</strong>
              </p>

              {selectedIngredients.length > 0 && (
                <p className="ingredient-list">{selectedIngredients.map(i => i.tname).join(', ')}</p>
              )}
            </div>

            <h2 className="summary-total">Total: ₹{totalCost}.00</h2>

            <button
              className="checkout-btn"
              onClick={buildPizza}
              disabled={(buildMode === 'scratch' && selectedIngredients.length === 0) ||
                (buildMode === 'base' && !selectedBasePizza)}
            >
              Add to Cart
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default BuildUrPizza;
