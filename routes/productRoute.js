const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Order = require('../models/order');

// Create a Product
router.post('/', async (req, res) => {
    try {
      const { name, description, price, stock } = req.body;

      if (!name || !description || !price || !stock) {
        return res.status(400).json({ message: 'Name, description, price, and stock are required' });
      }

      const newProduct = await Product.create({ name, description, price, stock });
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

// Delete a Product (by ID)
router.delete('/:id', async (req, res) => {
    try {
      const productID = req.params.id;
      const product = await Product.findById(productID);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      await product.deleteOne();

      await Order.updateMany(
        { 'items.productID': productID }, 
        { $pull: { items: { productID } } } 
      );

      res.json({ message: 'Product deleted and removed from current orders' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

module.exports = router;