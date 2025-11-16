const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

mongoose.connect('mongodb://localhost:27017/PIZZARIADB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
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

const Pizza = mongoose.model('pizzas', pizzaSchema);
const Ingredient = mongoose.model('ingredients', ingredientSchema);

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    const removeBOM = (data) => data.replace(/^\uFEFF/, '');

    const pizzaData = JSON.parse(
      removeBOM(fs.readFileSync(path.join(__dirname, 'pizza.json'), 'utf8'))
    );

    const ingredientData = JSON.parse(
      removeBOM(fs.readFileSync(path.join(__dirname, 'ingredients.json'), 'utf8'))
    );

    await Pizza.deleteMany({});
    await Ingredient.deleteMany({});
    console.log('Cleared existing data');

    const pizzaResult = await Pizza.insertMany(pizzaData);
    const ingredientResult = await Ingredient.insertMany(ingredientData);

    console.log(`Inserted ${pizzaResult.length} pizzas`);
    console.log(`Inserted ${ingredientResult.length} ingredients`);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();
