const express = require('express');
const app = express();

app.use(express.json());

// In-memory store for products and transactions
let products = [];
let transactions = [];

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Add a new product
app.post('/api/products', (req, res) => {
  const { id, name, price, quantity } = req.body;
  
  if (!id || !name || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (price < 0) {
    return res.status(400).json({ error: 'Price cannot be negative' });
  }
  
  const product = { id, name, price, quantity: quantity || 0 };
  products.push(product);
  res.status(201).json(product);
});

// Create a transaction (sale)
app.post('/api/transactions', (req, res) => {
  const { items } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in transaction' });
  }
  
  let total = 0;
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      return res.status(404).json({ error: `Product ${item.productId} not found` });
    }
    if (product.quantity < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
    }
    product.quantity -= item.quantity;
    total += product.price * item.quantity;
  }
  
  const transaction = { 
    id: transactions.length + 1, 
    items, 
    total, 
    timestamp: new Date() 
  };
  transactions.push(transaction);
  res.status(201).json(transaction);
});

// Get all transactions
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`POS System running on port ${PORT}`);
});

module.exports = app;
