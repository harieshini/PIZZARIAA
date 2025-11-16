
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();


app.use(cors());
app.use(express.json());


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/PIZZARIADB';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.error('MongoDB Connection Error:', err));


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const pizzaSchema = new mongoose.Schema({
  id: String,
  type: String,
  price: Number,
  name: String,
  image: String,
  description: String,
  ingredients: [String],
  topping: [String]
});

const ingredientSchema = new mongoose.Schema({
  id: Number,
  tname: String,
  price: Number,
  image: String
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  itemType: String,
  itemId: String,
  name: String,
  basePizza: { type: String, default: null },
  basePizzaPrice: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  customIngredients: [String],
  image: String,
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  items: [new mongoose.Schema({
    itemType: String,
    name: String,
    basePizza: String,
    price: Number,
    quantity: Number,
    customIngredients: [String],
    image: String
  }, { _id: false })],
  totalAmount: Number,
  status: { type: String, default: 'confirmed' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('users', userSchema);
const Pizza = mongoose.model('pizzas', pizzaSchema);
const Ingredient = mongoose.model('ingredients', ingredientSchema);
const Cart = mongoose.model('shoppingcart', cartSchema);
const Order = mongoose.model('orders', orderSchema);


const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production_12345';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      console.error('JWT Verification Error:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = { id: payload.id, email: payload.email };
    next();
  });
};

// ==================== AUTH ROUTES ====================


app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body.email);
    const { name, email, password } = req.body;

    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'Email already registered' });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    await user.save();
    console.log('User registered successfully:', user.email);

    
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});


app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== PIZZA & INGREDIENT ROUTES====================

app.get('/api/pizzas', async (req, res) => {
  try {
    const pizzas = await Pizza.find();
    res.json(pizzas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/ingredients', async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== CART ROUTES  ====================

app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    
    const body = req.body;
    const cartItem = new Cart({
      ...body,
      userId: req.user.id
    });
    const newItem = await cartItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/cart/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Cart.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const updatedItem = await Cart.findByIdAndUpdate(
      req.params.id,
      { quantity: req.body.quantity },
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) {
    console.error('Update cart item error:', err);
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Cart.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Delete cart item error:', err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user.id });
    res.json(cartItems);
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ message: err.message });
  }
});


app.get('/api/cart/count', authenticateToken, async (req, res) => {
  try {
    const count = await Cart.countDocuments({ userId: req.user.id });
    res.json({ count });
  } catch (err) {
    console.error('Cart count error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ==================== ORDER ROUTES  ====================

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user.id });
    
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = new Order({
      userId: req.user.id,
      items: cartItems.map(item => ({
        itemType: item.itemType,
        name: item.name,
        basePizza: item.basePizza,
        price: item.price,
        quantity: item.quantity,
        customIngredients: item.customIngredients,
        image: item.image
      })),
      totalAmount,
      status: 'confirmed'
    });

    await order.save();
    await Cart.deleteMany({ userId: req.user.id });

    console.log('Order created successfully for user:', req.user.id);

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: order._id,
      order
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ message: 'Error placing order' });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error('Get specific order error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ==================== RECOMMENDATIONS ====================

app.get('/api/recommendations', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id });
    
    if (orders.length === 0) {
      const popularPizzas = await Pizza.find().limit(3);
      return res.json(popularPizzas);
    }

    const orderedPizzaNames = orders.flatMap(order => 
      order.items
        .filter(item => item.itemType === 'pizza')
        .map(item => item.name)
    );

    const allPizzas = await Pizza.find();
    const recommendations = allPizzas
      .filter(pizza => !orderedPizzaNames.includes(pizza.name))
      .slice(0, 3);

    if (recommendations.length < 3) {
      const additionalPizzas = await Pizza.find().limit(3 - recommendations.length);
      recommendations.push(...additionalPizzas.filter(p => !recommendations.find(r => r.id === p.id)));
    }

    res.json(recommendations);
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ message: err.message });
  }
});


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});
